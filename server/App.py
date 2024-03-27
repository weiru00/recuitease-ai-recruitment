import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
from flask import request
from werkzeug.utils import secure_filename
from datetime import datetime

from flask import Flask, jsonify
from flask_cors import CORS

import re
import io
import nltk
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

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        user_data = data.get('userData')

        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400

        user = auth.create_user(email=email, password=password)
        uid = user.uid
        
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
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
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
        profile_pic = request.files['profilePic']
        if profile_pic:
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
        company_logo = request.files['companyLogo']
        if company_logo:
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
        # If there's an error in the process, return a 500 error with the error message
        return jsonify({'error': str(e)}), 500

@app.route('/user-data', methods=['GET'])
def get_user_data():
    user_id = request.args.get('uid')

    try:
        # Fetch user-specific data from Firestore using user_id
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
    
# Resume-Job Matching Score

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
            print("Score ", score)

            # Add additional data to application data
            app_data.update({
                'resume': resume_url,
                'appliedAt': datetime.utcnow().isoformat(),
                'applicantID': uid,
                'jobID': jobId,
                'score':score,
            })

            app_ref = db.collection('applications').add(app_data)

            return jsonify({"success": True, "id": app_ref[1].id, "resumeUrl": resume_url}), 201
        else:
            return jsonify({"success": False, "error": "Invalid file format"}), 400

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Function to fetch and preprocess text from a PDF in Firebase Storage
def fetch_pdf_text(file_path):
    try:
        # bucket = storage.bucket('recruitease-6b088.appspot.com')
        bucket = storage.bucket()
        blob = bucket.blob(file_path)
    #     print("blob:",blob)
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
#         resume_url = resume_url.replace(f"gs://{bucket.name}/", "")

        if resume_url:
            try:
                resume_content = fetch_pdf_text(resume_url)
                resumes.append(resume_content)
            except Exception as e:
                print(f"Error fetching resume content for application {doc.id}: {e}")
        else:
            print(f"No resume found for application {doc.id}")

    return resumes

# def get_job_description(job_id):
#     doc_ref = db.collection('jobListings').document(job_id)
#     doc = doc_ref.get()
    
#     job_desc = []
#     if doc.exists:
#         doc_data = doc.to_dict()
#         # Concatenate multiple fields to form the full job description
#         full_description = " ".join([doc_data[field] for field in ['title', 'desc', 'qualification', 'req']])
#         full_description = preprocess_text(full_description)
#         job_desc.append(full_description)
#         return job_desc
#     else:
#         print("No such job listing document!")
#         return ""

def get_job_description(job_id):
    doc_ref = db.collection('jobListings').document(job_id)
    doc = doc_ref.get()
    
    if doc.exists:
        doc_data = doc.to_dict()
        # Concatenate multiple fields to form the full job description
        full_description = " ".join([doc_data[field] for field in ['title', 'desc', 'qualification', 'req']])
        # Preprocess the full job description to a clean string
        full_description = preprocess_text(full_description)
        return full_description  # Return the string directly
    else:
        print("No such job listing document!")
        return ""
    
def calculate_similarity_scores(preprocessed_resumes, preprocessed_job_descs):
    try:
        vectorizer = TfidfVectorizer()

        # for job_index, preprocessed_job_desc in enumerate(preprocessed_job_descs, start=1):
        #     scores = []
        # Combine the current job description with all resumes
        documents = [preprocessed_job_descs , preprocessed_resumes]
        tfidf_matrix = vectorizer.fit_transform(documents)
        
        cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        similarity_score = cos_sim[0, 0]

        return round(similarity_score * 100, 2)
    
    except Exception as e:
        # Log the error
        print(f"Error calculating similarity scores: {e}")
        # # First document is the job description, the rest are resumes
        # for resume_index, _ in enumerate(preprocessed_resumes, start=1):
        #     cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[resume_index:resume_index+1])
        #     similarity_score = cos_sim[0, 0]  # Score between job desc and this resume
        #     scores.append((resume_index, similarity_score))
        
        # # Sort scores in descending order
        # scores.sort(key=lambda x: x[1], reverse=True)

        # print(f"Ranking for Job Posting {job_index}:")
        # for rank, (resume_index, score) in enumerate(scores, start=1):
        #     print(f"{rank}. Resume {resume_index} - Score: {score}")
        # print("\n")  # New line for readability between job postings


if __name__ == '__main__':
    app.run(debug=True)
