import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
from flask import request, Flask, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime

from flask_mail import Mail, Message
from flask_cors import CORS

import re
import io
import os
import nltk
import numpy as np
nltk.download('punkt')
nltk.download('stopwords')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pypdf import PdfReader

cred = credentials.Certificate('recruitease-6b088-firebase-adminsdk-kar6k-61a0f2350b.json')
firebase_admin.initialize_app(cred, {
        'storageBucket': 'recruitease-6b088.appspot.com'
    })

db = firestore.client()

app = Flask(__name__)
CORS(app)

# Flask-Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'recruiteaseofficial@gmail.com'
app.config['MAIL_PASSWORD'] = 'dcyn dapl htlf jehq'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

mail = Mail(app)

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        user_data = data.get('userData', {})

        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400

        user = auth.create_user(email=email, password=password)
        uid = user.uid
        
        user_data['email'] = email
        
        save_user_data(uid, user_data)
        
        return jsonify({'success': True, 'uid': user.uid}), 201

    except auth.EmailAlreadyExistsError:
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def save_user_data(uid, user_data):
    try:
        user_ref = db.collection('users').document(uid)
        user_ref.set(user_data)
        print(f'User data for {uid} saved successfully.')
    except Exception as e:
        print(f'Failed to save user data for {uid}: {str(e)}')
    
@app.route('/verifyToken', methods=['POST'])
def verify_token():
    data = request.get_json()
    id_token = data.get('idToken')

    try:
        decoded_token = auth.verify_id_token(id_token, check_revoked=True, clock_skew_seconds=60)
        uid = decoded_token['uid']

        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_role = user_data.get('role', 'unknown')  # Assuming the role field is 'role'
            return jsonify({'success': True, 'uid': uid, 'role': user_role}), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    except auth.RevokedIdTokenError:
        return jsonify({'error': 'ID token has been revoked'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/update-user-role', methods=['POST'])
def update_user_role():
    try:
        data = request.json
        uid = data.get('uid')
        user_data = data.get('userData')

        if not uid or not user_data:
            return jsonify({'error': 'Missing UID or user data'}), 400
            
        user_ref = db.collection('users').document(uid)
        user_ref.update(user_data)
        
        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/update-user', methods=['POST'])
def update_user():
    try:
        uid = request.form['uid']
        user_data = {
            'firstName': request.form['firstName'],
            'lastName': request.form['lastName'],
            'gender': request.form['gender'],
            'race': request.form['race'],
        }

        if not uid or not user_data:
            return jsonify({'error': 'Missing UID or user data'}), 400

        # Handle file upload
        profile_pic = request.files.get('profilePic')
        if profile_pic and profile_pic.filename != '':
            filename = secure_filename(profile_pic.filename)
            blob = storage.bucket().blob(f'profile_pictures/{uid}')
            blob.upload_from_string(profile_pic.read(), content_type=profile_pic.content_type)
            # Get the URL of the uploaded file
            user_data['profilePicUrl'] = blob.public_url
            
        user_ref = db.collection('users').document(uid)
        user_ref.update(user_data)
        
        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-company', methods=['POST'])
def update_company():
    try:
        uid = request.form['uid']
        user_data = {
            'companyName': request.form['companyName'],
            'website': request.form['website'],
            'companySize': request.form['companySize'],
            'companyDescription': request.form['companyDescription'],
            'firstName': request.form['firstName'],
            'lastName': request.form['lastName'],
        }

        if not uid or not user_data:
            return jsonify({'error': 'Missing UID or user data'}), 400

        # Handle file upload
        company_logo = request.files.get('companyLogo')
        if company_logo and company_logo.filename != '':
            filename = secure_filename(company_logo.filename)
            blob = storage.bucket().blob(f'company_logo/{uid}')
            blob.upload_from_string(company_logo.read(), content_type=company_logo.content_type)
            # Get the URL of the uploaded file
            user_data['companyLogoUrl'] = blob.public_url
            
        user_ref = db.collection('users').document(uid)
        user_ref.update(user_data)
        
        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
@app.route("/joblistings", methods=['GET'])
def get_jobs():

    role = request.args.get('role')
    uid = request.args.get('uid')
    job_list = []

    if role == 'applicant':
        # Fetch all jobs for applicants
        job_listings = db.collection('jobListings').stream()
    elif role == 'recruiter':
        # Fetch only jobs posted by the logged-in recruiter
        job_listings = db.collection('jobListings').where('recruiterID', '==', uid).stream()
    else:
        return jsonify({'error': 'Invalid role'}), 400

    for job in job_listings:
        job_data = job.to_dict()
        job_data['id'] = job.id  # Add the document ID to the dictionary
        recruiter_doc = db.collection('users').document(job_data['recruiterID']).get()
        if recruiter_doc.exists:
            recruiter_data = recruiter_doc.to_dict()
            job_data['companyName'] = recruiter_data.get('companyName', 'Unknown Company')
            job_data['companyLogoUrl'] = recruiter_data.get('companyLogoUrl', 'Unavailable Logo')
            print(recruiter_data.get('companyLogoUrl', 'Unavailable Logo')) 
        else:
            job_data['companyName'] = 'Unknown Company'  # Default value in case recruiter document is not found
        
        job_list.append(job_data)
        

    return jsonify(job_list)

@app.route('/job-details/<job_id>', methods=['GET'])
def get_job_details(job_id):
    try:
        job_ref = db.collection('jobListings').document(job_id)
        job_doc = job_ref.get()

        if job_doc.exists:
            # If the document exists, return its data
            return jsonify(job_doc.to_dict()), 200
        else:
            # If the document does not exist, return a 404 error
            return jsonify({'error': 'Job not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user-data', methods=['GET'])
def get_user_data():
    user_id = request.args.get('uid')

    try:
        user_docs = db.collection('users').document(user_id).get()
        if user_docs.exists:
            return jsonify(user_docs.to_dict()), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/create-job", methods=['POST'])
def create_job():
    try:
        job_data = request.json
        job_ref = db.collection('jobListings').add(job_data)

        return jsonify({"success": True, "id": job_ref[1].id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
    
@app.route("/update-job/<job_id>", methods=['PUT'])
def update_job(job_id):
    try:
        job_data = request.json
        job_ref = db.collection('jobListings').document(job_id)

        job_ref.update(job_data)

        return jsonify({"success": True, "message": "Job updated successfully."}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/delete-job/<job_id>", methods=['DELETE'])
def delete_job(job_id):
    try:
        job_ref = db.collection('jobListings').document(job_id)
        job_ref.delete()

        return jsonify({"success": True, "message": "Job deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


from collections import Counter

@app.route('/get-applications', methods=['GET'])
def get_applications():
    try:
        recruiter_id = request.args.get('recruiterID')  # Get recruiterID from query string
        if not recruiter_id:
            return jsonify({"error": "Missing recruiterID parameter"}), 400

        race_counter = Counter()
        gender_counter = Counter()
        status_counter = Counter()
        
        # Fetch all job IDs posted by the recruiter
        jobs_ref = db.collection('jobListings').where('recruiterID', '==', recruiter_id)
        jobs = jobs_ref.stream()

        applications = []
        # For each job, fetch applications
        for job in jobs:
            job_id = job.id
            job_data = job.to_dict()  # Get job data
            job_title = job_data.get('title', 'Unknown Job Title')
            # status_counter[job_data.get('status', 'Not Stated')] += 1
            
            apps_ref = db.collection('applications').where('jobID', '==', job_id)
            apps = apps_ref.stream()

            for app in apps:
                app_data = app.to_dict()
                app_data['applicationID'] = app.id  # Include the application ID in the data
                app_data['jobTitle'] = job_title
                status_counter[app_data.get('status', 'Not Stated')] += 1
                
                # Fetch applicant details
                applicant_id = app_data.get('applicantID')
                if applicant_id:
                    user_ref = db.collection('users').document(applicant_id)
                    user_doc = user_ref.get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        app_data['applicantFName'] = user_data.get('firstName', 'Unknown') 
                        app_data['applicantLName'] = user_data.get('lastName', 'Unknown')
                        app_data['applicantPic'] = user_data.get('profilePicUrl', 'Unavailable')
                        
                        race_counter[user_data.get('race', 'Not Stated')] += 1
                        gender_counter[user_data.get('gender', 'Not Stated')] += 1
                        
                applications.append(app_data)

        race_counts = [{"race": race, "count": count} for race, count in race_counter.items()]
        gender_counts = [{"gender": gender, "count": count} for gender, count in gender_counter.items()]
        status_counts = [{"status": status, "count": count} for status, count in status_counter.items()]

        print(status_counts)
        return jsonify({"success": True, "applications": applications, "raceCounts": race_counts,"genderCounts": gender_counts, "statusCounts": status_counts}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/track-applications', methods=['GET'])
def track_applications():
    applicantID = request.args.get('uid')
    if not applicantID:
        return jsonify({'error': 'Missing uid parameter'}), 400

    try:
        applications_ref = db.collection('applications')
        query_ref = applications_ref.where('applicantID', '==', applicantID).stream()

        applications = []
        for doc in query_ref:
            application = doc.to_dict()
            application['id'] = doc.id  # Include the application ID

            # Fetch job details based on jobID in the application
            jobID = application.get('jobID')
            if jobID:
                job_doc = db.collection('jobListings').document(jobID).get()
                if job_doc.exists:
                    job_details = job_doc.to_dict()
                    # Extract required job details
                    application['jobTitle'] = job_details.get('title')
                    application['salary'] = job_details.get('salary')
                    application['jobMode'] = job_details.get('jobMode')
                    
                    # get company name
                    recruiter_id = job_details.get('recruiterID')
                    user_doc = db.collection('users').document(recruiter_id).get()
                    if user_doc.exists:
                        user_details = user_doc.to_dict()
                        application['companyName'] = user_details.get('companyName')
                        
                    else:
                        application['companyName'] = 'Unavailable company name'
                else:
                    application['jobTitle'] = 'Job no longer exists'
                    application['jobType'] = 'Unavailable'
                    application['jobMode'] = 'Unavailable'

            applications.append(application)

        return jsonify(applications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-application-status', methods=['POST'])
def update_application_status():
    recruiter_id = request.args.get('uid')
    print("recruiter: ", recruiter_id)

    try:
        # Extract application ID and new status from the request body
        data = request.get_json()
        application_id = data.get('applicationID')
        new_status = data.get('status')
        subject = "Application Status Update"  # Default subject
        message_text = "Your application status has been updated."  # Default message

        # Validate input
        if not application_id or not new_status:
            return jsonify({'error': 'Missing applicationId or status'}), 400

        # Retrieve sender's (recruiter's) email from Firestore
        recruiter_ref = db.collection('users').document(recruiter_id)
        recruiter_doc = recruiter_ref.get()
        if recruiter_doc.exists:
            recruiter_data = recruiter_doc.to_dict()
            sender_email = recruiter_data.get('email', None)
            sender_name =  recruiter_data.get('firstName', None)
            company_name =  recruiter_data.get('companyName', None)
        else:
            return jsonify({'error': 'Recruiter not found'}), 404
        
        # Update the status in Firestore
        application_ref = db.collection('applications').document(application_id)
        # Fetch the current document to get the existing status
        doc = application_ref.get()
        if doc.exists:
            current_app = doc.to_dict()
            current_status = current_app.get('status', None)
            applicant_id = current_app.get('applicantID', None)
            job_id = current_app.get('jobID', None)
            
            # Retrieve job title from Firestore
            job_ref = db.collection('jobListings').document(job_id)
            job_doc = job_ref.get()
            if job_doc.exists:
                job_data = job_doc.to_dict()
                job_title = job_data.get('title', None)
            else:
                return jsonify({'error': 'Job not found'}), 404

            # Retrieve applicant's email from Firestore
            applicant_ref = db.collection('users').document(applicant_id)
            applicant_doc = applicant_ref.get()
            if applicant_doc.exists:
                applicant_data = applicant_doc.to_dict()
                applicant_email = applicant_data.get('email', None)
            else:
                return jsonify({'error': 'Applicant not found'}), 404
            
            # Update the document with the new status and store the previous status
            application_ref.update({
                'prevStatus': current_status,  # Store the current status as previous
                'status': new_status  # Update to the new status
            })
        
                # Based on the new status, customize the email message
            # if new_status == "Onboard":
            #     subject = "Congratulations on your successful application!"
            #     message_text = "We are pleased to inform you that you have been hired."
            # elif new_status == "Review":
            #     subject = "Application Status Update"
            #     message_text = "Your Application is currently under review."
            # elif new_status == "Interview":
            #     subject = "Application Status Update"
            #     message_text = "You are invited to an interview session."
            # elif new_status == "Reject":
            #     subject = "Application Status Update"
            #     message_text = "We regret to inform you that your application has not been successful."
            # Add more conditions based on your status types
            
            # Send the email
            send_email(applicant_email, sender_email, new_status, job_title, company_name, sender_name )

            return jsonify({'message': 'Application status updated successfully'}), 200
        else:
            return jsonify({'error': 'Application not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
################### Resume-Job Matching Score ###################

@app.route("/apply-job", methods=['POST'])
def apply_job():
    try:
        # Get form data
        app_data = request.form.to_dict()
        resume_file = request.files['resume']
        uid = request.form['applicantID']  # Applicant's UID
        jobId = request.form['jobID']  # Job ID

        if resume_file and resume_file.filename.endswith('.pdf'):
            filename = secure_filename(resume_file.filename)
            # Upload the resume to Firebase Storage
            bucket = storage.bucket()
            blob = bucket.blob(f'resumes/{uid}/{filename}')
            blob.upload_from_string(
                resume_file.read(), content_type=resume_file.content_type
            )
            blob.make_public()
            resume_url = blob.public_url
            
            # Preprocess the resume text
            resume_text = fetch_pdf_text(blob.name)
            
            job_desc_text = get_job_description(jobId)
            
            score = calculate_similarity_scores(resume_text, job_desc_text)
            print("Score here", score)

            # Add additional data to application data
            app_data.update({
                'resume': resume_url,
                'appliedAt': datetime.utcnow().isoformat(),
                'applicantID': uid,
                'jobID': jobId,
                'status':"Applied",
                'score':score,
            })

            app_ref = db.collection('applications').add(app_data)

            return jsonify({"success": True, "id": app_ref[1].id, "resumeUrl": resume_url}), 201
        else:
            return jsonify({"success": False, "error": "Invalid file format"}), 400

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    
    resume_file = request.files['resume']
    uid = request.form['applicantID']
    if resume_file and resume_file.filename.endswith('.pdf'):

        filename = secure_filename(resume_file.filename)
        
        bucket = storage.bucket()
        blob = bucket.blob(f'tempResumes/{uid}/{filename}')
        blob.upload_from_string(
            resume_file.read(), content_type=resume_file.content_type
        )
        blob.make_public()
        resume_url = blob.public_url
        
        # Preprocess the resume text
        resume_text = fetch_pdf_text(blob.name)
        
        # Retrieve jobs from Firestore and match
        matched_jobs = find_matching_jobs(resume_text, top_n=10)
        print("matched jobs: ", matched_jobs)

        return jsonify(matched_jobs)

# Function to fetch and preprocess text from a PDF in Firebase Storage
def fetch_pdf_text(file_path):
    try:
        bucket = storage.bucket()
        blob = bucket.blob(file_path)
        pdf_bytes = blob.download_as_bytes()

        pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text() + ' '
        return preprocess_text(text)

    except Exception as e:
        print(f"Error fetching PDF text: {e}")
        return ""

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stopwords.words('english')]
    return ' '.join(tokens)

def fetch_resumes_for_job(job_id):
    applications_ref = db.collection('applications')
    query = applications_ref.where('jobID', '==', job_id)
    results = query.stream()

    resumes = []
    for doc in results:
        application = doc.to_dict()
        resume_url = application.get('resume')

        if resume_url:
            try:
                resume_content = fetch_pdf_text(resume_url)
                resumes.append(resume_content)
            except Exception as e:
                print(f"Error fetching resume content for application {doc.id}: {e}")
        else:
            print(f"No resume found for application {doc.id}")

    return resumes

from transformers import AutoTokenizer, AutoModel
import torch

def get_job_description(job_id):
    doc_ref = db.collection('jobListings').document(job_id)
    doc = doc_ref.get()
    
    if doc.exists:
        doc_data = doc.to_dict()
        full_description = " ".join([doc_data[field] for field in ['title', 'desc', 'qualification', 'req']])
        # Preprocess the full job description to a clean string
        full_description = preprocess_text(full_description)
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

# For recruiter
def calculate_similarity_scores(preprocessed_resumes, preprocessed_job_descs):
    try:

        device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load the tokenizer and model from the Hugging Face library
        model_name = "bert-base-uncased"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        model.to(device)

        # Generate embeddings for the job description and the resume
        job_desc_embedding = get_embeddings(preprocessed_job_descs, model, tokenizer, device)
        resume_embedding = get_embeddings(preprocessed_resumes, model, tokenizer, device)

        # Calculate the cosine similarity between the job description and resume embeddings
        similarity_score = cosine_similarity(job_desc_embedding, resume_embedding)[0][0]

        return round(similarity_score * 100, 2)

    except Exception as e:
        print(f"Error calculating similarity scores: {e}")
    
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

# For recruiter
# def calculate_similarity_scores(preprocessed_resumes, preprocessed_job_descs):
#     try:
#         vectorizer = TfidfVectorizer()

#         # Combine the current job description with all resumes
#         documents = [preprocessed_job_descs , preprocessed_resumes]
#         tfidf_matrix = vectorizer.fit_transform(documents)
        
#         cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
#         similarity_score = cos_sim[0, 0]

#         return round(similarity_score * 100, 2)
    
#     except Exception as e:
#         print(f"Error calculating similarity scores: {e}")


# def calculate_similarity_for_resume(preprocessed_resume, preprocessed_job_descs, top_n=2):
#     vectorizer = TfidfVectorizer()
    
#     # Combine the resume with all job descriptions
#     documents = [preprocessed_resume] + preprocessed_job_descs
#     tfidf_matrix = vectorizer.fit_transform(documents)
    
#     # The first vector in tfidf_matrix is the resume, the rest are job descriptions
#     cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
    
#     # Get similarity scores for all jobs
#     similarity_scores = cos_sim.flatten()
    
#     # Get indices of top_n matching jobs
#     top_matching_indices = similarity_scores.argsort()[-top_n:][::-1]
    
#     # Prepare the results
#     top_matches = [(index, similarity_scores[index]) for index in top_matching_indices]
    
#     return top_matches

def find_matching_jobs(preprocessed_resume, top_n):
    jobs_collection = db.collection('jobListings')  # Assuming your jobs are stored in a 'jobs' collection
    docs = jobs_collection.stream()

    preprocessed_job_desc = []
    matched_jobs = []
    
    for doc in docs:
        job = doc.to_dict()
        full_description = " ".join([job[field] for field in ['title', 'desc', 'qualification', 'req']])
        full_description = preprocess_text(full_description)
        preprocessed_job_desc.append(full_description)

        matched_jobs.append(job)
        
        # Calculate top matching jobs
    top_matches = calculate_similarity_for_resume(preprocessed_resume, preprocessed_job_desc, top_n)

    # Select top matching jobs from Firestore data
    matched_jobs = [(matched_jobs[index], float(score)) for index, score in top_matches]

    return matched_jobs

# def send_email(applicant_email, subject, message_text, cc_email):
#   msg = Message(subject, sender ='recruiteaseofficial@gmail.com', recipients=[applicant_email], cc=[cc_email])
#   msg.body = message_text
#   mail.send(msg)
  
def send_email(applicant_email, cc_email, new_status, job_title, company_name, sender_name):
    
    base_html = """
    <html>
        <body>
            {content}
        </body>
    </html>
    """
    
    if new_status == "Onboard":
        subject = f"Successful Application - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We are thrilled to extend an offer to you to join our team at <b>{company_name}</b> as a <b>{job_title}</b>. We were impressed with your skills and experience and believe you will be a valuable addition to our team.
        <br><br>We look forward to your response.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>Hiring Team<br>
        <b>{company_name}</b>
        </div>"""
        
    elif new_status == "Applied":
        subject = f"Application Received - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>Thank you for applying for the <b>{job_title}</b> position at <b>{company_name}</b>. We have successfully received your application and wanted to confirm that it is currently under review by our recruitment team.
        <br><br>We appreciate your interest in joining our team and will be carefully reviewing your application along with the others we have received. We aim to complete this process as quickly as possible and will keep you updated on the status of your application.
        <br><br>Best Regards,
        <br><b>{sender_name}</b>
        <br>Hiring Team<br>
        <b>{company_name}</b>
        </div>"""
        
    elif new_status == "Review":
        subject = f"Application Status Update - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We are writing to let you know that your application for the <b>{job_title}</b> position at <b>{company_name}</b> is currently under review. We are carefully considering your skills and experience among our pool of talented candidates.
        <br><br>We appreciate your patience during this process and will keep you updated on your application status.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>Hiring Team
        <br><b>{company_name}</b>
        </div>"""
        
    elif new_status == "Interview":
        subject = f"Invitation to Interview - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We are pleased to inform you that after reviewing your application for the <b>{job_title}</b> position at <b>{company_name}</b>, we would like to invite you to the next stage of our recruitment process: interview session.
        <br><br>This is a great opportunity for us to learn more about your skills and experiences, as well as for you to understand more about the role and our company.
        <br><br>We will be in touch shortly to arrange a convenient time and date for the interview. In the meantime, if you have any questions, please do not hesitate to contact us.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>Hiring Team
        <br><b>{company_name}</b>
        </div>"""
        
    elif new_status == "Reject":
        subject = f"Application Status Update - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We would like to thank you for taking the time to apply for the <b>{job_title}</b> position at <b>{company_name}</b>.
        <br><br>After careful consideration, we regret to inform you that we will not be moving forward with your application for this role. This decision does not reflect on your qualifications or experiences, which we found impressive, but rather on the competitive nature of the application process and the specific needs for this position.
        <br><br>We encourage you to apply for future openings at <b>{company_name}</b> that match your skills and experience.<br><br>We wish you all the best in your job search and future professional endeavors.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>Hiring Team
        <br><b>{company_name}</b>
        </div>"""


    # if new_status == "Onboard":
    #     subject = f"Successful Application - {job_title}, {company_name}"
    #     message_text = f"Dear Applicant,\n\nWe are thrilled to extend an offer to you to join our team at {company_name} as a {job_title}. We were impressed with your skills and experience and believe you will be a valuable addition to our team.\n\nWe look forward to your response.\n\nBest Regards,\n{sender_name}\nHiring Team\n{company_name}"
    # elif new_status == "Applied":
    #     subject = f"Application Received - {job_title}, {company_name}"
    #     message_text = f"Dear Applicant,\n\nThank you for applying for the {job_title} position at {company_name}. We have successfully received your application and wanted to confirm that it is currently under review by our recruitment team.\nWe appreciate your interest in joining our team and will be carefully reviewing your application along with the others we have received. We aim to complete this process as quickly as possible and will keep you updated on the status of your application.\n\nBest Regards,\n{sender_name}\nHiring Team\n{company_name}"
    # elif new_status == "Review":
    #     subject = f"Application Status Update - {job_title}, {company_name}"
    #     message_text = f"Dear Applicant,\n\nWe are writing to let you know that your application for the {job_title} position at {company_name} is currently under review. We are carefully considering your skills and experience among our pool of talented candidates.\n\nWe appreciate your patience during this process and will keep you updated on your application status.\n\nBest Regards,\n{sender_name}\nHiring Team\n{company_name}"
    # elif new_status == "Interview":
    #     subject = f"Invitation to Interview - {job_title}, {company_name}"
    #     message_text = f"Dear Applicant,\n\nWe are pleased to inform you that after reviewing your application for the {job_title} position at {company_name}, we would like to invite you to the next stage of our recruitment process: interview session.\n\nThis is a great opportunity for us to learn more about your skills and experiences, as well as for you to understand more about the role and our company.\n\nWe will be in touch shortly to arrange a convenient time and date for the interview. In the meantime, if you have any questions, please do not hesitate to contact us.\n\nBest Regards,\n{sender_name}\nHiring Team\n{company_name}"
    # elif new_status == "Reject":
    #     subject = f"Application Status Update - {job_title}, {company_name}"
    #     message_text = f"Dear Applicant,\n\nWe would like to thank you for taking the time to apply for the {job_title} position at {company_name}.\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application for this role. This decision does not reflect on your qualifications or experiences, which we found impressive, but rather on the competitive nature of the application process and the specific needs for this position.\n\nWe encourage you to apply for future openings at {company_name} that match your skills and experience.\n\nWe wish you all the best in your job search and future professional endeavors.\n\nBest Regards,\n{sender_name}\nHiring Team\n{company_name}"
  
    final_html_content = base_html.format(content=message_html)

    msg = Message(subject, sender='recruiteaseofficial@gmail.com', recipients=[applicant_email], cc=[cc_email])

    msg.html = final_html_content

    mail.send(msg)
    # msg = Message(subject, sender ='recruiteaseofficial@gmail.com', recipients=[applicant_email], cc=[cc_email])
    # msg.body = message_text
    # mail.send(msg)

if __name__ == '__main__':
    app.run(debug=True)
