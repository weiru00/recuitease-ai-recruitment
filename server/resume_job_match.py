import re
import io
import os
import nltk
import spacy
from spacy.matcher import Matcher
import numpy as np
nltk.download('punkt')
nltk.download('stopwords')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pypdf import PdfReader
from transformers import AutoTokenizer, AutoModel
import torch
from firebase_config import db, bucket
from kNN import preprocess, load_model, predict_categories

def load_model_components():
    base_dir = os.path.dirname(__file__)
    model_path = os.path.join(base_dir, 'models', 'knn_model.pkl')
    vectorizer_path = os.path.join(base_dir, 'models', 'tfidf_vectorizer.pkl')
    label_encoder_path = os.path.join(base_dir, 'models', 'label_encoder.pkl')
    return load_model(model_path, vectorizer_path, label_encoder_path)

# Function to fetch and preprocess text from a PDF in Firebase Storage
def fetch_pdf_text(file_path):
    try:
        # bucket = storage.bucket()
        blob = bucket.blob(file_path)
        pdf_bytes = blob.download_as_bytes()

        pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text() + ' '
        # return preprocess(text)
        return text
    
    except Exception as e:
        print(f"Error fetching PDF text: {e}")
        return ""

# def preprocess_text(text):
#     text = text.lower()
#     text = re.sub(r'\d+', '', text)
#     text = re.sub(r'[^\w\s]', '', text)
#     tokens = word_tokenize(text)
#     tokens = [word for word in tokens if word not in stopwords.words('english')]
#     return ' '.join(tokens)

# def fetch_resumes_for_job(job_id):
#     applications_ref = db.collection('applications')
#     query = applications_ref.where('jobID', '==', job_id)
#     results = query.stream()

#     resumes = []
#     for doc in results:
#         application = doc.to_dict()
#         resume_url = application.get('resume')

#         if resume_url:
#             try:
#                 resume_content = fetch_pdf_text(resume_url)
#                 resumes.append(resume_content)
#             except Exception as e:
#                 print(f"Error fetching resume content for application {doc.id}: {e}")
#         else:
#             print(f"No resume found for application {doc.id}")

#     return resumes

def get_job_description(job_id):
    doc_ref = db.collection('jobListings').document(job_id)
    doc = doc_ref.get()
    
    if doc.exists:
        doc_data = doc.to_dict()
        full_description = " ".join([doc_data[field] for field in ['title', 'desc', 'qualification', 'req']])
        # Preprocess the full job description to a clean string
        full_description = preprocess(full_description)
        return full_description  # Return the string directly
    else:
        print("No such job listing document!")
        return ""
    
def get_embeddings(text, model, tokenizer, device):
    # Tokenize the input text and prepare input tensors
    inputs = tokenizer(text, return_tensors="pt", max_length=512, truncation=True, padding='max_length')
    inputs = {key: value.to(device) for key, value in inputs.items()}

    # Generate embeddings using the model
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Use the mean of the last hidden state as the text embedding
    embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
    return embeddings

# # For recruiter
def calculate_similarity_scores(resumes, preprocessed_job_descs):
    try:

        device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load the tokenizer and model from the Hugging Face library
        model_name = "bert-base-uncased"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        model.to(device)

        preprocessed_resume = [preprocess(resume) for resume in resumes]

        # Generate embeddings for the job description and the resume
        job_desc_embedding = get_embeddings(preprocessed_job_descs, model, tokenizer, device)
        resume_embedding = get_embeddings(preprocessed_resume, model, tokenizer, device)

        # Calculate the cosine similarity between the job description and resume embeddings
        similarity_score = cosine_similarity(job_desc_embedding, resume_embedding)[0][0]

        return round(similarity_score * 100, 2)

    except Exception as e:
        print(f"Error calculating similarity scores: {e}")

# def calculate_similarity_scores(preprocessed_resumes, preprocessed_job_descs, vectorizer):
#     try:

#         job_vectors = vectorizer.transform(preprocessed_job_descs)
#         resume_vectors = vectorizer.transform([clean_and_tokenize(resume) for resume in resumes])

#         # Calculate the cosine similarity between the job description and resume embeddings
#         similarity_score = cosine_similarity(job_vectors, resume_vectors)[0][0]

#         return round(similarity_score * 100, 2)

#     except Exception as e:
#         print(f"Error calculating similarity scores: {e}")
    
def calculate_similarity_for_resume(preprocessed_resume, preprocessed_job_descs, top_n=10):
    try:

        device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load the tokenizer and model from the Hugging Face library
        model_name = "bert-base-uncased"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        model.to(device)

        # Generate embeddings for the job description and the resume
        job_desc_embeddings = np.array([get_embeddings(job_desc, model, tokenizer, device) for job_desc in preprocessed_job_descs])
        resume_embedding = get_embeddings(preprocessed_resume, model, tokenizer, device)
        
        # Ensure job_desc_embeddings is a 2D array
        if job_desc_embeddings.ndim > 2:
            job_desc_embeddings = job_desc_embeddings.mean(axis=1)

        # Calculate the cosine similarity between the job description and resume embeddings
        similarity_score = cosine_similarity(resume_embedding, job_desc_embeddings).flatten()
        similarity_score = np.around(similarity_score * 100, 2)
        
        top_matching_indices = similarity_score.argsort()[-top_n:][::-1]

        # Prepare the results
        top_matches = [(index, similarity_score[index]) for index in top_matching_indices]

        return top_matches

    except Exception as e:
        print(f"Error calculating similarity scores: {e}")
        return []

def find_matching_jobs(resumes, top_n):
    jobs_collection = db.collection('jobListings')  # Assuming your jobs are stored in a 'jobs' collection
    docs = jobs_collection.stream()

    preprocessed_resume = [preprocess(resume) for resume in resumes]
    preprocessed_job_desc = []
    matched_jobs = []
    
    for doc in docs:
        job = doc.to_dict()
        job['id'] = doc.id
        full_description = " ".join([job[field] for field in ['title', 'desc', 'qualification', 'req']])
        full_description = preprocess(full_description)
        preprocessed_job_desc.append(full_description)

        matched_jobs.append(job)
        
        recruiter_doc = db.collection('users').document(job['recruiterID']).get()
        if recruiter_doc.exists:
            recruiter_data = recruiter_doc.to_dict()
            
            company_id = recruiter_data.get('companyID')
            if company_id:
                company_doc = db.collection('company').document(company_id).get()
                if company_doc.exists:
                    company_data = company_doc.to_dict()
                    job['companyName'] = company_data.get('companyName', 'Unavailable')
                    job['companyLogoUrl'] = company_data.get('companyLogoUrl', 'Logo Unavailable')
                else:
                    job['companyLogoUrl'] = 'Logo Unavailable'
                    job['companyName'] = 'Unknown Company'
            else:
                job['companyLogoUrl'] = 'Logo Unavailable'
        else:
            job['companyLogoUrl'] = 'Logo Unavailable' 
        
    # Calculate top matching jobs
    top_matches = calculate_similarity_for_resume(preprocessed_resume, preprocessed_job_desc, top_n)

    # Select top matching jobs from Firestore data
    matched_jobs = [(matched_jobs[index], float(score)) for index, score in top_matches]

    return matched_jobs

# # Function to fetch and preprocess text from a PDF in Firebase Storage
# def fetch_pdf_text(file_path):
#     try:
#         # bucket = storage.bucket()
#         blob = bucket.blob(file_path)
#         pdf_bytes = blob.download_as_bytes()

#         pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
#         text = ''
#         for page in pdf_reader.pages:
#             text += page.extract_text() + ' '
        
#         print(text)
#         return preprocess_text(text)

#     except Exception as e:
#         print(f"Error fetching PDF text: {e}")
#         return ""

# def preprocess_text(text):
#     text = text.lower()
#     text = re.sub(r'\d+', '', text)
#     text = re.sub(r'[^\w\s]', '', text)
#     tokens = word_tokenize(text)
#     # tokens = [word for word in tokens if word not in stopwords.words('english')]
#     return ' '.join(tokens)

# def fetch_resumes_for_job(job_id):
#     applications_ref = db.collection('applications')
#     query = applications_ref.where('jobID', '==', job_id)
#     results = query.stream()

#     resumes = []
#     for doc in results:
#         application = doc.to_dict()
#         resume_url = application.get('resume')

#         if resume_url:
#             try:
#                 resume_content = fetch_pdf_text(resume_url)
#                 resumes.append(resume_content)
#             except Exception as e:
#                 print(f"Error fetching resume content for application {doc.id}: {e}")
#         else:
#             print(f"No resume found for application {doc.id}")

#     return resumes

# def get_job_description(job_id):
#     try:
#         doc_ref = db.collection('jobListings').document(job_id)
#         doc = doc_ref.get()
        
#         if doc.exists:
#             doc_data = doc.to_dict()
#             parsed_job_desc = {
#                     'skills': doc_data.get('skills', ''),
#                     # 'experience': doc_data.get('experience', ''),
#                     'education': doc_data.get('education', ''),
#                     'certifications': doc_data.get('certifications', ''),
#                     # Add more fields as necessary
#                 }
#             print("parsed_job_desc:", parsed_job_desc)
#             return parsed_job_desc
#             # full_description = " ".join([doc_data[field] for field in ['title', 'desc', 'qualification', 'req']])
#             # # Preprocess the full job description to a clean string
#             # full_description = preprocess_text(full_description)
#             # return full_description  # Return the string directly
#         else:
#             print("No such job listing document!")
#             return {}
#     except Exception as e:
#         print(f"Error retrieving job description: {e}")
#         return {}
    
# def get_skillset_from_job_desc(parsed_job_desc):
#     # Assuming skills in job description are separated by commas or listed in some standard format
#     return parsed_job_desc.get('skills', '').split(',')

# # Parse Resume and JD (extract fields)
# def parse_resume(resume_text, parsed_job_desc):
#     skillset = get_skillset_from_job_desc(parsed_job_desc)
#     parsed_resume = {
#         'skills': extract_skills(resume_text, skillset),
#         # 'experience': extract_experience(resume_text),
#         'education': extract_education(resume_text),
#         # 'certifications': extract_certifications(resume_text),
#     }
#     print("parsed_resume:", parsed_resume)

#     return parsed_resume

# # def parse_job_description(job_desc_text):
# #     parsed_job_desc = {
# #         'skills': extract_skills(job_desc_text),
# #         'experience': extract_experience(job_desc_text),
# #         'education': extract_education(job_desc_text),
# #         'certifications': extract_certifications(job_desc_text),
# #         # Add more fields as necessary
# #     }
# #     print("parsed_job_desc:", parsed_job_desc)
# #     return parsed_job_desc

# def extract_skills(text, skills_list):
#     skills = []

#     for skill in skills_list:
#         pattern = r"\b{}\b".format(re.escape(skill.strip()))
#         match = re.search(pattern, text, re.IGNORECASE)
#         if match:
#             skills.append(skill)

#     return skills

# def extract_education(text):
#     education = []

#     # Use regex pattern to find education information
#     pattern = r"(?i)(?:Bsc|\bB\.\w+|\bM\.\w+|\bPh\.D\.\w+|\bBachelor(?:'s)?|\bMaster(?:'s)?|\bPh\.D)\s(?:\w+\s)*\w+"
#     matches = re.findall(pattern, text)
#     for match in matches:
#         education.append(match.strip())

#     return education

# # def extract_section(text, section_names):
# #     # Combine all section names into a single regex pattern with optional trailing 's'
# #     section_pattern = '|'.join([name + 's?' for name in section_names])
# #     # Use regular expressions to capture the content of sections following the section header
# #     pattern = re.compile(r'(?i)({}).*?(?=\n[A-Z][a-z]*:|\Z)'.format(section_pattern), re.DOTALL)
# #     matches = pattern.findall(text)
# #     return ' '.join(matches).strip()

# # def extract_skills(text):
# #     skill_headers = ['skill', 'proficiency', 'competencies']
# #     return extract_section(text, skill_headers)

# # def extract_experience(text):
# #     experience_headers = ['experience',  'work experience', 'employment history', 'professional experience']
# #     return extract_section(text, experience_headers)

# # def extract_education(text):
# #     education_headers = ['education', 'academic background', 'educational qualifications', 'academic qualifications']
# #     return extract_section(text, education_headers)

# # def extract_certifications(text):
# #     certification_headers = ['certifications', 'certification', 'certificates', 'licenses']
# #     return extract_section(text, certification_headers)

# ###############################################################3
# # def extract_skills(text):
# #     # Improved skill extraction using keyword matching
# #     skills_pattern = re.compile(r'(?i)\b(skill|skills|proficiency|proficient|expert)\b.*')
# #     skills_matches = skills_pattern.findall(text)
# #     return ' '.join(skills_matches)

# # def extract_experience(text):
# #     # Improved experience extraction using keyword matching
# #     experience_pattern = re.compile(r'(?i)\b(experience|work|employment)\b.*')
# #     experience_matches = experience_pattern.findall(text)
# #     return ' '.join(experience_matches)

# # def extract_education(text):
# #     # Improved education extraction using keyword matching
# #     education_pattern = re.compile(r'(?i)\b(education|degree|university|college|school)\b.*')
# #     education_matches = education_pattern.findall(text)
# #     return ' '.join(education_matches)

# # def extract_certifications(text):
# #     # Improved certification extraction using keyword matching
# #     certifications_pattern = re.compile(r'(?i)\b(certification|certified|certificate|license)\b.*')
# #     certifications_matches = certifications_pattern.findall(text)
# #     return ' '.join(certifications_matches)

# #################################################################################
# # def extract_skills(text):
# #     skills = re.findall(r'\b(skill|skills|proficiency|proficient|expert)\b.*', text, re.IGNORECASE)
# #     return ' '.join(skills)

# # def extract_experience(text):
# #     experience = re.findall(r'\b(experience|work|employment)\b.*', text, re.IGNORECASE)
# #     return ' '.join(experience)

# # def extract_education(text):
# #     education = re.findall(r'\b(education|degree|university|college)\b.*', text, re.IGNORECASE)
# #     return ' '.join(education)

# # def extract_certifications(text):
# #     certifications = re.findall(r'\b(certification|certified|certificate)\b.*', text, re.IGNORECASE)
# #     return ' '.join(certifications)

# def get_field_embeddings(field_text, model, tokenizer, device):
#     return get_embeddings(field_text, model, tokenizer, device)

# def get_embeddings(text, model, tokenizer, device):
#     # Tokenize the input text and prepare input tensors
#     inputs = tokenizer(text, return_tensors="pt", max_length=512, truncation=True, padding='max_length')
#     inputs = {key: value.to(device) for key, value in inputs.items()}

#     # Generate embeddings using the model
#     with torch.no_grad():
#         outputs = model(**inputs)
    
#     # Use the mean of the last hidden state as the text embedding
#     embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
#     return embeddings

# def calculate_weighted_similarity(resume_parsed, job_desc_parsed, model, tokenizer, device):
#     field_weights = {
#         'skills': 0.6,
#         # 'experience': 0.3,
#         'education': 0.4,
#         # 'certifications': 0.1,
#     }

#     total_similarity = 0.0

#     for field, weight in field_weights.items():
#         # resume_field_text = resume_parsed.get(field, "")
#         # job_desc_field_text = job_desc_parsed.get(field, "")
#         resume_field_text = ' '.join(resume_parsed.get(field, []))
#         job_desc_field_text = ' '.join(job_desc_parsed.get(field, []))
        
#         if resume_field_text and job_desc_field_text:
#             resume_embedding = get_field_embeddings(resume_field_text, model, tokenizer, device)
#             job_desc_embedding = get_field_embeddings(job_desc_field_text, model, tokenizer, device)
            
#             similarity_score = cosine_similarity(resume_embedding, job_desc_embedding)[0][0]
#             total_similarity += weight * similarity_score

#     return round(total_similarity * 100, 2)

# # For recruiter
# def calculate_similarity_scores(preprocessed_resumes, preprocessed_job_descs):
#     try:

#         device = "cuda" if torch.cuda.is_available() else "cpu"

#         # Load the tokenizer and model from the Hugging Face library
#         model_name = "bert-base-uncased"
#         tokenizer = AutoTokenizer.from_pretrained(model_name)
#         model = AutoModel.from_pretrained(model_name)
#         model.to(device)
        
#         resume_parsed = parse_resume(preprocessed_resumes, preprocessed_job_descs)
#         # job_desc_parsed = parse_job_description(preprocessed_job_descs)

#         # Calculate weighted similarity score
#         similarity_score = calculate_weighted_similarity(resume_parsed, preprocessed_job_descs, model, tokenizer, device)

#         return similarity_score
#         # Generate embeddings for the job description and the resume
#         # job_desc_embedding = get_embeddings(preprocessed_job_descs, model, tokenizer, device)
#         # resume_embedding = get_embeddings(preprocessed_resumes, model, tokenizer, device)

#         # Calculate the cosine similarity between the job description and resume embeddings
#         # similarity_score = cosine_similarity(job_desc_embedding, resume_embedding)[0][0]

#         # return round(similarity_score * 100, 2)

#     except Exception as e:
#         print(f"Error calculating similarity scores 1: {e}")
    
# def calculate_similarity_for_resume(preprocessed_resume, preprocessed_job_descs, top_n=10):
#     try:

#         device = "cuda" if torch.cuda.is_available() else "cpu"

#         # Load the tokenizer and model from the Hugging Face library
#         model_name = "bert-base-uncased"
#         tokenizer = AutoTokenizer.from_pretrained(model_name)
#         model = AutoModel.from_pretrained(model_name)
#         model.to(device)
        
#         # Parse the resume
#         resume_parsed = parse_resume(preprocessed_resume, preprocessed_job_descs)

#         # Parse each job description
#         # parsed_job_descs = [parse_job_description(job_desc) for job_desc in preprocessed_job_descs]

#         # Calculate similarity scores for each job description
#         similarity_scores = []
#         for job_desc in preprocessed_job_descs:
#             similarity_score = calculate_weighted_similarity(resume_parsed, job_desc, model, tokenizer, device)
#             similarity_scores.append(similarity_score)

#         similarity_scores = np.array(similarity_scores)
#         top_matching_indices = similarity_scores.argsort()[-top_n:][::-1]

#         # Prepare the results
#         top_matches = [(index, similarity_scores[index]) for index in top_matching_indices]

#         return top_matches
    
#         # # Generate embeddings for the job description and the resume
#         # job_desc_embeddings = np.array([get_embeddings(job_desc, model, tokenizer, device) for job_desc in preprocessed_job_descs])
#         # resume_embedding = get_embeddings(preprocessed_resume, model, tokenizer, device)
        
#         # # Ensure job_desc_embeddings is a 2D array
#         # if job_desc_embeddings.ndim > 2:
#         #     job_desc_embeddings = job_desc_embeddings.mean(axis=1)

#         # # Calculate the cosine similarity between the job description and resume embeddings
#         # similarity_score = cosine_similarity(resume_embedding, job_desc_embeddings).flatten()
#         # similarity_score = np.around(similarity_score * 100, 2)
        
#         # top_matching_indices = similarity_score.argsort()[-top_n:][::-1]

#         # # Prepare the results
#         # top_matches = [(index, similarity_score[index]) for index in top_matching_indices]

#         # return top_matches

#     except Exception as e:
#         print(f"Error calculating similarity scores 2: {e}")
#         return []

# def find_matching_jobs(preprocessed_resume, top_n):
#     jobs_collection = db.collection('jobListings')  # Assuming your jobs are stored in a 'jobs' collection
#     docs = jobs_collection.stream()

#     # preprocessed_job_desc = []
#     matched_jobs = []
    
#     for doc in docs:
#         job = doc.to_dict()
#         job_id = doc.id

#         # Retrieve and parse job description
#         job_desc_parsed = get_job_description(job_id)
#         print("job desc in func:", job_desc_parsed)

#         # Calculate similarity score
#         similarity_score = calculate_similarity_for_resume(preprocessed_resume, job_desc_parsed, top_n)
#         matched_jobs.append((job, similarity_score))

#     # Sort and get top N matches
#     matched_jobs.sort(key=lambda x: x[1], reverse=True)
#     top_matches = matched_jobs[:top_n]

#     return top_matches
        
#         # full_description = " ".join([job[field] for field in ['title', 'desc', 'qualification', 'req']])
#         # full_description = preprocess_text(full_description)
#         # preprocessed_job_desc.append(full_description)

#     #     matched_jobs.append(job)
        
#     #     # Calculate top matching jobs
#     # top_matches = calculate_similarity_for_resume(preprocessed_resume, preprocessed_job_desc, top_n)

#     # # Select top matching jobs from Firestore data
#     # matched_jobs = [(matched_jobs[index], float(score)) for index, score in top_matches]

#     # return matched_jobs
  
# # def send_email(applicant_email, cc_email, new_status, job_title, company_name, sender_name):
    
# #     base_html = """
# #     <html>
# #         <body>
# #             {content}
# #         </body>
# #     </html>
# #     """
    
# #     if new_status == "Onboard":
# #         subject = f"Successful Application - {job_title}, {company_name}"
# #         message_html = f"""
# #         <div style="font-size: 14px;">
# #         Dear Applicant,
# #         <br><br>We are thrilled to extend an offer to you to join our team at <b>{company_name}</b> as a <b>{job_title}</b>. We were impressed with your skills and experience and believe you will be a valuable addition to our team.
# #         <br><br>We look forward to your response.
# #         <br><br>Best Regards,
# #         <br><br><b>{sender_name}</b>
# #         <br>Hiring Team<br>
# #         <b>{company_name}</b>
# #         </div>"""
        
# #     elif new_status == "Applied":
# #         subject = f"Application Received - {job_title}, {company_name}"
# #         message_html = f"""
# #         <div style="font-size: 14px;">
# #         Dear Applicant,
# #         <br><br>Thank you for applying for the <b>{job_title}</b> position at <b>{company_name}</b>. We have successfully received your application and wanted to confirm that it is currently under review by our recruitment team.
# #         <br><br>We appreciate your interest in joining our team and will be carefully reviewing your application along with the others we have received. We aim to complete this process as quickly as possible and will keep you updated on the status of your application.
# #         <br><br>Best Regards,
# #         <br><b>{sender_name}</b>
# #         <br>Hiring Team<br>
# #         <b>{company_name}</b>
# #         </div>"""
        
# #     elif new_status == "Review":
# #         subject = f"Application Status Update - {job_title}, {company_name}"
# #         message_html = f"""
# #         <div style="font-size: 14px;">
# #         Dear Applicant,
# #         <br><br>We are writing to let you know that your application for the <b>{job_title}</b> position at <b>{company_name}</b> is currently under review. We are carefully considering your skills and experience among our pool of talented candidates.
# #         <br><br>We appreciate your patience during this process and will keep you updated on your application status.
# #         <br><br>Best Regards,
# #         <br><br><b>{sender_name}</b>
# #         <br>Hiring Team
# #         <br><b>{company_name}</b>
# #         </div>"""
        
# #     elif new_status == "Interview":
# #         subject = f"Invitation to Interview - {job_title}, {company_name}"
# #         message_html = f"""
# #         <div style="font-size: 14px;">
# #         Dear Applicant,
# #         <br><br>We are pleased to inform you that after reviewing your application for the <b>{job_title}</b> position at <b>{company_name}</b>, we would like to invite you to the next stage of our recruitment process: interview session.
# #         <br><br>This is a great opportunity for us to learn more about your skills and experiences, as well as for you to understand more about the role and our company.
# #         <br><br>We will be in touch shortly to arrange a convenient time and date for the interview. In the meantime, if you have any questions, please do not hesitate to contact us.
# #         <br><br>Best Regards,
# #         <br><br><b>{sender_name}</b>
# #         <br>Hiring Team
# #         <br><b>{company_name}</b>
# #         </div>"""
        
# #     elif new_status == "Reject":
# #         subject = f"Application Status Update - {job_title}, {company_name}"
# #         message_html = f"""
# #         <div style="font-size: 14px;">
# #         Dear Applicant,
# #         <br><br>We would like to thank you for taking the time to apply for the <b>{job_title}</b> position at <b>{company_name}</b>.
# #         <br><br>After careful consideration, we regret to inform you that we will not be moving forward with your application for this role. This decision does not reflect on your qualifications or experiences, which we found impressive, but rather on the competitive nature of the application process and the specific needs for this position.
# #         <br><br>We encourage you to apply for future openings at <b>{company_name}</b> that match your skills and experience.<br><br>We wish you all the best in your job search and future professional endeavors.
# #         <br><br>Best Regards,
# #         <br><br><b>{sender_name}</b>
# #         <br>Hiring Team
# #         <br><b>{company_name}</b>
# #         </div>"""
  
# #     final_html_content = base_html.format(content=message_html)

# #     msg = Message(subject, sender='recruiteaseofficial@gmail.com', recipients=[applicant_email], cc=[cc_email])

# #     msg.html = final_html_content

# #     mail.send(msg)
