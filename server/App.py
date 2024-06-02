from flask import request, Flask, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
from firebase_config import db, bucket
import firebase_admin
from firebase_admin import auth
from resume_job_match import fetch_pdf_text, find_matching_jobs, calculate_similarity_scores, get_job_description
# from resume_parser import resumeparse
from kNN import predict_categories
from resume_job_match import load_model_components

from flask_mail import Mail, Message
from flask_cors import CORS

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

def get_current_timestamp():
    return int(datetime.now().timestamp())

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
        
        # user_data: {
        #     'email': email,
        #     'role': None,
        #     'status': 'pending_setup'
        # }
        db.collection('users').document(user.uid).set({
            'email': email,
            'role': None,
            'register_status': 'pending_setup'
        })
        # save_user_data(uid, user_data)
        
        return jsonify({'success': True, 'uid': user.uid}), 201

    except auth.EmailAlreadyExistsError:
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# def save_user_data(uid, user_data):
#     try:
#         user_ref = db.collection('users').document(uid)
#         user_ref.set(user_data)
#         print(f'User data for {uid} saved successfully.')
#     except Exception as e:
#         print(f'Failed to save user data for {uid}: {str(e)}')
    
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
            user_role = user_data.get('role', 'unknown')  # Fetch the user role
            user_status = user_data.get('register_status', 'pending')  # Fetch the user status

            # Check if the user is approved to login
            if user_status == 'approved':
                return jsonify({'success': True, 'uid': uid, 'role': user_role, 'register_status': user_status}), 200
            else:
                return jsonify({'error': 'Your account is not yet approved.'}), 403  # User not approved
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
        
        # initial_status = 'approved' if role == 'applicant' else 'pending'
            
        role = user_data.get('role')
        initial_status = 'approved' if role == 'applicant' else 'pending'
        user_data['register_status'] = initial_status
        
        user_ref = db.collection('users').document(uid)
        user_ref.update(user_data)
        
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/update-user', methods=['POST'])
def update_user():
    try:
        uid = request.form['uid']
        role = request.form['role']
        user_data = {
            'firstName': request.form['firstName'],
            'lastName': request.form['lastName'],
            'gender': request.form['gender'],
            'race': request.form['race'],
        }

        if not uid or not user_data:
            return jsonify({'error': 'Missing UID or user data'}), 400
                           
        if role in ['recruiter', 'manager']:
            company_id = request.form.get('companyID')
            position = request.form['position']
            if company_id:
                user_data['companyID'] = company_id
                user_data['position'] = position

        # Handle file upload
        profile_pic = request.files.get('profilePic')
        if profile_pic and profile_pic.filename != '':
            filename = secure_filename(profile_pic.filename)
            # blob = storage.bucket().blob(f'profile_pictures/{uid}')
            blob = bucket.blob(f'profile_pictures/{uid}')
            blob.upload_from_string(profile_pic.read(), content_type=profile_pic.content_type)
            # Get the URL of the uploaded file
            user_data['profilePicUrl'] = blob.public_url
            
        user_ref = db.collection('users').document(uid)
        user_ref.update(user_data)
        
        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/register-company', methods=['POST'])
def register_company():
    try:
        company_data = {
            'companyName': request.form['companyName'],
            'website': request.form['website'],
            'companySize': request.form['companySize'],
            'companyDescription': request.form['companyDescription'],
            # 'adminID': request.form['uid'],
        }

        if not company_data:
            return jsonify({'error': 'Missing company data'}), 400
        
        company_ref = db.collection('company').add(company_data)
        
        company_id = company_ref[1].id

        # Handle file upload
        company_logo = request.files.get('companyLogo')
        if company_logo and company_logo.filename != '':
            filename = secure_filename(company_logo.filename)
            blob = bucket.blob(f'company_logo/{company_id}')
            blob.upload_from_string(company_logo.read(), content_type=company_logo.content_type)
            # Get the URL of the uploaded file
            company_data['companyLogoUrl'] = blob.public_url
       
            company_ref = db.collection('company').document(company_id)
            company_ref.update(company_data)

        # save user data 
        uid = request.form['uid']
        user_data = {
            'companyID': company_id,
            'firstName': request.form['firstName'],
            'lastName': request.form['lastName'],
            'register_status': "approved"
        }
        user_ref = db.collection('users').document(uid)
        user_ref.update(user_data)
        
        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# @app.route('/update-company', methods=['POST'])
# def update_company():
#     try:
#         uid = request.form['uid']
#         user_data = {
#             'companyName': request.form['companyName'],
#             'website': request.form['website'],
#             'companySize': request.form['companySize'],
#             'companyDescription': request.form['companyDescription'],
#             'firstName': request.form['firstName'],
#             'lastName': request.form['lastName'],
#         }

#         if not uid or not user_data:
#             return jsonify({'error': 'Missing UID or user data'}), 400

#         # Handle file upload
#         company_logo = request.files.get('companyLogo')
#         if company_logo and company_logo.filename != '':
#             filename = secure_filename(company_logo.filename)
#             blob = storage.bucket().blob(f'company_logo/{uid}')
#             blob.upload_from_string(company_logo.read(), content_type=company_logo.content_type)
#             # Get the URL of the uploaded file
#             user_data['companyLogoUrl'] = blob.public_url
            
#         user_ref = db.collection('users').document(uid)
#         user_ref.update(user_data)
        
#         return jsonify({'success': True}), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/invite-user', methods=['POST'])
def invite_user():
    data = request.json
    user_email = data['email']
    user_role = data['role']
    company_id = data['company_id']

    try:
        # Create the user with Firebase Auth
        user = auth.create_user(email=user_email)
        # Store user details in Firestore
        db.collection('users').document(user.uid).set({
            'email': user_email,
            'role': user_role,
            'company_id': company_id
        })
        # Send an invitation email (logic to be implemented)
        send_invitation_email(user_email)
        return jsonify({'message': 'Invitation sent successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/get-company-users', methods=['GET'])
def get_company_users():
    uid = request.args.get('uid')
    try:
        # Retrieve the company ID from the user's document
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        
        company_id = user_doc.to_dict().get('companyID')
        if not company_id:
            return jsonify({'error': 'Company ID not found'}), 404

        # Retrieve all users from the same company
        users_ref = db.collection('users').where('companyID', '==', company_id)
        users = users_ref.stream()
        
        manager_counter = 0
        hr_counter = 0
        
        users_data = []
        
        for user in users:
            role = user.to_dict().get('role', '')
            register_status = user.to_dict().get('register_status', '')
            if register_status == "approved":
                if role == "manager":
                    manager_counter += 1
                elif role == "recruiter":
                    hr_counter += 1
                
            users_data.append({**user.to_dict(), 'uid': user.id})
        
        result_data = {
            'number_of_managers': manager_counter,
            'number_of_hrs': hr_counter,
            'users': users_data
        }
        return jsonify(result_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/approve_user', methods=['POST'])
def approve_user():
    data = request.json
    uid = data.get('uid')
    status = data.get('status')

    try:
        user_ref = db.collection('users').document(uid)
        user_ref.update({'register_status': status})
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        
        email = user_doc.to_dict().get('email')
        if not email:
            return jsonify({'error': 'Email not found'}), 404
        send_status_email(email, status)
        
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def send_status_email(email, status):
    base_html = """
    <html>
        <body>
            {content}
        </body>
    </html>
    """
    
    if status == "approved":
        subject = f"Account Registration Success "
        message_html = f"""
        <div style="font-size: 14px;">
        Dear User,
        <br><br>Your account has been approved by your company admin.
        <br><br>You may log in to RecruitEase using the email and password registered.
        <br><br><br><b>RecruitEase</b>
        </div>"""
        
    if status == "decline":
        subject = f"Account Registration Failed "
        message_html = f"""
        <div style="font-size: 14px;">
        Dear User,
        <br><br>Unfortunately, your account registration has been rejected by your company admin.
        <br><br>Kindly sign up again through our platform and make sure your info is accurate.
        <br><br><br><b>RecruitEase</b>
        </div>"""

    try:
        final_html_content = base_html.format(content=message_html)

        msg = Message(subject, sender='recruiteaseofficial@gmail.com', recipients=[email])

        msg.html = final_html_content

        mail.send(msg)
            
    except Exception as e:
        print(str(e))

@app.route('/delete-user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        db.collection('users').document(user_id).delete()
        auth.delete_user(user_id)
        
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/update-profile', methods=['POST'])
def update_profile():
    try:
        uid = request.form.get('uid')
        if not uid:
            return jsonify({'error': 'UID is required'}), 400

        # Fetch user document
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        # Prepare user data update
        user_data = {
            'firstName': request.form.get('firstName', ''),
            'lastName': request.form.get('lastName', ''),
            'gender': request.form.get('gender', ''),
            'race': request.form.get('race', ''),
            'gender': request.form.get('gender', ''),
            'position': request.form.get('position', ''),
        }

        role = request.form.get('role')
        if role == "admin":
            # Admin uploads company logo
            company_id = user_doc.to_dict().get('companyID')
            if company_id:
                company_ref = db.collection('company').document(company_id)
                company_data = {
                    'companyName': request.form.get('companyName', ''),
                    'website': request.form.get('website', ''),
                    'companySize': request.form.get('companySize', ''),
                    'companyDescription': request.form.get('companyDescription', ''),
                }

                # Handling company logo upload
                company_logo = request.files.get('companyLogo')
                if company_logo and company_logo.filename != '':
                    filename = secure_filename(company_logo.filename)
                    blob = bucket.blob(f'company_logo/{company_id}')
                    blob.upload_from_string(company_logo.read(), content_type=company_logo.content_type)
                    company_data['companyLogoUrl'] = blob.public_url

                company_ref.update(company_data)
            else:
                return jsonify({'error': 'No company associated with this user'}), 400
        else:
            # Non-admin uploads profile picture
            profile_pic = request.files.get('profilePic')
            if profile_pic and profile_pic.filename != '':
                filename = secure_filename(profile_pic.filename)
                blob = bucket.blob(f'profile_pictures/{uid}')
                blob.upload_from_string(profile_pic.read(), content_type=profile_pic.content_type)
                user_data['profilePicUrl'] = blob.public_url

        # Update user document
        user_ref.update(user_data)

        return jsonify({'success': True, 'message': 'Profile updated successfully'}), 200

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
            # job_data['companyName'] = recruiter_data.get('companyName', 'Unknown Company')
            
            company_id = recruiter_data.get('companyID')
            if company_id:
                company_doc = db.collection('company').document(company_id).get()
                if company_doc.exists:
                    company_data = company_doc.to_dict()
                    job_data['companyName'] = company_data.get('companyName', 'Unavailable')
                    job_data['companyLogoUrl'] = company_data.get('companyLogoUrl', 'Logo Unavailable')
                else:
                    job_data['companyLogoUrl'] = 'Logo Unavailable'
                    job_data['companyName'] = 'Unknown Company'
            else:
                job_data['companyLogoUrl'] = 'Logo Unavailable'
        else:
            job_data['companyLogoUrl'] = 'Logo Unavailable' 
                   
        job_list.append(job_data)
        
    return jsonify(job_list)

@app.route('/job-details/<job_id>', methods=['GET'])
def get_job_details(job_id):
    try:
        job_ref = db.collection('jobListings').document(job_id)
        job_doc = job_ref.get()
      
        if job_doc.exists:
            job_details = job_doc.to_dict()
            
            recruiter_id = job_details.get('recruiterID')
            user_doc = db.collection('users').document(recruiter_id).get()
            
            if user_doc.exists:
                user_details = user_doc.to_dict()
                company_id = user_details.get('companyID')
                
                company_doc = db.collection('company').document(company_id).get()
                if company_doc.exists:
                    company_details = company_doc.to_dict()
                    job_details['companyName'] = company_details.get('companyName')

        else:
            return jsonify({'error': 'Job not found'}), 404
        
        return jsonify(job_details), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/user-info', methods=['GET'])
def get_user_info():
    user_id = request.args.get('uid')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    try:
        # Retrieve the user document by user_id
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            company_id = user_data.get('companyID')

            # Check if company ID is available
            if company_id:
                company_doc = db.collection('company').document(company_id).get()  # Make sure collection name is 'companies'
                
                if company_doc.exists:
                    company_data = company_doc.to_dict()
                    response_data = {
                        'user_info': user_data,
                        'company_info': company_data
                    }
                else:
                    # Company ID is present but the document does not exist
                    response_data = {
                        'user_info': user_data,
                        'company_info': None,
                        'company_error': 'Company not found'
                    }
            else:
                # No company ID found in the user's document
                response_data = {
                    'user_info': user_data,
                    'company_info': None,
                    'company_error': 'No company ID associated with the user'
                }
            return jsonify(response_data), 200

        else:
            return jsonify({'error': 'User not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user-data', methods=['GET'])
def get_user_data():
    user_id = request.args.get('uid')
    
    try:
        user_docs = db.collection('users').document(user_id).get()
        if user_docs.exists:
            # Get all applications for the user
            apps_ref = db.collection('applications').where('applicantID', '==', user_id)
            apps = apps_ref.stream()
            
            # Initialize counters
            job_applied_counter = 0
            job_offer_counter = 0
            job_reject_counter = 0
            interview_counter = 0

            # Process each application
            for app in apps:
                job_applied_counter += 1
                status = app.to_dict().get('status', '')
                if status == "Offer":
                    job_offer_counter += 1
                elif status == "Reject":
                    job_reject_counter += 1
                elif status == "Interview":
                    interview_counter += 1
            
            # Construct the response object
            response_data = {
                'number_of_applications': job_applied_counter,
                'number_of_offers': job_offer_counter,
                'number_of_rejections': job_reject_counter,
                'number_of_interviews': interview_counter,
            }
            response_data.update(user_docs.to_dict())  # Merge user details into the response
            
            return jsonify(response_data), 200
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
        
        jobs_ref = db.collection('jobListings').where('recruiterID', '==', recruiter_id)
        jobs = jobs_ref.stream()

        applications = []
        for job in jobs:
            job_id = job.id
            job_data = job.to_dict()  # Get job data
            job_title = job_data.get('title', 'Unknown Job Title')
            
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
                
                # Fetch manager details
                manager_id = app_data.get('managerID')
                if manager_id:
                    user_ref = db.collection('users').document(manager_id)
                    user_doc = user_ref.get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        app_data['managerFName'] = user_data.get('firstName', 'Unknown') 
                        app_data['managerLName'] = user_data.get('lastName', 'Unknown')
                        app_data['managerPosition'] = user_data.get('position', 'Unknown')

                applications.append(app_data)

        race_counts = [{"race": race, "count": count} for race, count in race_counter.items()]
        gender_counts = [{"gender": gender, "count": count} for gender, count in gender_counter.items()]
        status_counts = [{"status": status, "count": count} for status, count in status_counter.items()]

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
                        company_id = user_details.get('companyID')
                        
                        if company_id:
                            company_doc = db.collection('company').document(company_id).get()
                            if company_doc.exists:
                                company_details= company_doc.to_dict()
                                application['companyName'] = company_details.get('companyName')                            
                        
                    else:
                        company_id = 'Unavailable company ID'
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

    try:
        # Extract application ID and new status from the request body
        data = request.get_json()
        application_id = data.get('applicationID')
        new_status = data.get('status')
        meeting_link = data.get('meetingLink', None)
        meeting_date = data.get('meetingDate', None)
        meeting_time = data.get('meetingTime', None)
        subject = "Application Status Update"  # Default subject
        message_text = "Your application status has been updated."  # Default message

        # Validate input
        if not application_id or not new_status:
            return jsonify({'error': 'Missing applicationId or status'}), 400

        recruiter_ref = db.collection('users').document(recruiter_id)
        recruiter_doc = recruiter_ref.get()
        if recruiter_doc.exists:
            recruiter_data = recruiter_doc.to_dict()
            sender_email = recruiter_data.get('email', None)
            sender_name =  recruiter_data.get('firstName', None)
            company_id =  recruiter_data.get('companyID', None)
            position = recruiter_data.get('position', None)
        else:
            return jsonify({'error': 'Recruiter not found'}), 404
        
        company_ref = db.collection('company').document(company_id)
        company_doc = company_ref.get()
        if company_doc.exists:
            company_data = company_doc.to_dict()
            company_name = company_data.get('companyName', None)

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
                                 
            if new_status == "Interview" or new_status == "Reschedule":
                # interview_ref = application_ref.collection('interview').document('details')
                application_ref.update({
                    'meetingLink': meeting_link,
                    'meetingDate': meeting_date,
                    'meetingTime': meeting_time
                })
                
            send_email(applicant_email, sender_email, new_status, job_title, position, company_name, sender_name, meeting_link, meeting_date, meeting_time)

            return jsonify({'message': 'Application status updated successfully', 'success': True}), 200
        else:
            return jsonify({'error': 'Application not found', 'success': False}), 404    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
@app.route('/forward-application', methods=['POST'])
def forward_application():
    try:
        applicationID = request.form['applicationID']

        if not applicationID:
            return jsonify({'error': 'Missing application ID'}), 400

        forward_data = {        
            'managerID' : request.form['managerID'],
            'feedbackHR' : request.form['feedbackHR'],
        }
                                       
        application_ref = db.collection('applications').document(applicationID)
        application_ref.update(forward_data)
        
        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/get-forwarded-applications', methods=['GET'])
def get_forwarded_applications():
    try:
        manager_id = request.args.get('uid')
        if not manager_id:
            return jsonify({"error": "Missing manager ID parameter"}), 400
        
        app_list = []
        apps_ref = db.collection('applications').where('managerID', '==', manager_id)
        applications = apps_ref.stream()

        for app in applications:
            app_id = app.id
            app_data = app.to_dict()
            app_data['applicationID'] = app_id

            # Get job details
            job_id = app_data.get('jobID')
            if job_id:
                job_ref = db.collection('jobListings').document(job_id)
                job_doc = job_ref.get()
                if job_doc.exists:
                    job_data = job_doc.to_dict()
                    recruiter_id = job_data.get('recruiterID', 'Unknown')
                    app_data['jobTitle'] = job_data.get('title', 'Unknown Title')

            if recruiter_id:
                user_ref = db.collection('users').document(recruiter_id)
                user_doc = user_ref.get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    company_id = user_data.get('companyID', 'Unknown')
                    app_data['recruiterFName'] = user_data.get('firstName', 'Unknown') 

            if company_id:
                company_ref = db.collection('company').document(company_id)
                company_doc = company_ref.get()
                if company_doc.exists:
                    company_data = company_doc.to_dict()
                    app_data['companyName'] = company_data.get('companyName', 'Unknown') 

                
            # Get applicant details
            applicant_id = app_data.get('applicantID')

            if applicant_id:
                user_ref = db.collection('users').document(applicant_id)
                user_doc = user_ref.get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    app_data['applicantFName'] = user_data.get('firstName', 'Unknown') 
                    app_data['applicantLName'] = user_data.get('lastName', 'Unknown')
                    app_data['applicantPic'] = user_data.get('profilePicUrl', 'Unavailable')
                    app_data['email'] = user_data.get('email', 'Unknown')
                            
            app_list.append(app_data)

        return jsonify(app_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/preview_email', methods=['POST'])
def preview_email():
    
    data = request.json
    new_status = data.get('status')
    meeting_link = data.get('meeting_link')
    meeting_date = data.get('meeting_date')
    meeting_time = data.get('meeting_time')
    application_id = data.get('applicationID')
    
    # Fetch application, recruiter, and job details
    application_ref = db.collection('applications').document(application_id)
    doc = application_ref.get()
    if not doc.exists:
        return jsonify({'error': 'Application not found'}), 404

    current_app = doc.to_dict()
    job_id = current_app.get('jobID', None)
    applicant_id = current_app.get('applicantID', None)
    manager_id = current_app.get('managerID', None)

    job_ref = db.collection('jobListings').document(job_id)
    job_doc = job_ref.get()
    if job_doc.exists:    
        job_data = job_doc.to_dict()
        job_title = job_data.get('title', None)
    else:
        return jsonify({'error': 'Job not found'}), 404


    manager_ref = db.collection('users').document(manager_id)
    manager_doc = manager_ref.get()
    if not manager_doc.exists:
        return jsonify({'error': 'Manager not found'}), 404

    manager_data = manager_doc.to_dict()
    sender_name = manager_data.get('firstName', None)
    company_id = manager_data.get('companyID', None)
    position = manager_data.get('position', None)
    
    company_ref = db.collection('company').document(company_id)
    company_doc = company_ref.get()
    if not company_doc.exists:
        return jsonify({'error': 'Company not found'}), 404

    company_data = company_doc.to_dict()
    company_name = company_data.get('companyName', None)

    email_content = generate_email_content(new_status, job_title, position, company_name, sender_name, meeting_link, meeting_date, meeting_time)

    return jsonify({'email_content': email_content})

@app.route('/preview_offer_email', methods=['POST'])
def preview_offer_email():
    
    data = request.json
    new_status = data.get('status')
    application_id = data.get('applicationID')
    
    # Fetch application, recruiter, and job details
    application_ref = db.collection('applications').document(application_id)
    doc = application_ref.get()
    if not doc.exists:
        return jsonify({'error': 'Application not found'}), 404

    current_app = doc.to_dict()
    job_id = current_app.get('jobID', None)
    applicant_id = current_app.get('applicantID', None)
    manager_id = current_app.get('managerID', None)

    job_ref = db.collection('jobListings').document(job_id)
    job_doc = job_ref.get()
    if job_doc.exists:    
        job_data = job_doc.to_dict()
        job_title = job_data.get('title', None)
    else:
        return jsonify({'error': 'Job not found'}), 404

    manager_ref = db.collection('users').document(manager_id)
    manager_doc = manager_ref.get()
    if not manager_doc.exists:
        return jsonify({'error': 'Manager not found'}), 404

    manager_data = manager_doc.to_dict()
    sender_name = manager_data.get('firstName', None)
    company_id = manager_data.get('companyID', None)
    position = manager_data.get('position', None)
    
    company_ref = db.collection('company').document(company_id)
    company_doc = company_ref.get()
    if not company_doc.exists:
        return jsonify({'error': 'Company not found'}), 404

    company_data = company_doc.to_dict()
    company_name = company_data.get('companyName', None)

    email_content = generate_email_content(new_status, job_title, position, company_name, sender_name, meeting_link, meeting_date, meeting_time)

    return jsonify({'email_content': email_content})


def send_email(applicant_email, cc_email, new_status, job_title, position, company_name, sender_name,  meeting_link=None, meeting_date=None, meeting_time=None):
    try:
        email_content = generate_email_content(new_status, job_title, position, company_name, sender_name, meeting_link, meeting_date, meeting_time)

        print("Generated Email Content:\n", email_content)
        
        subject = f"Application Status Update - {job_title}, {company_name}"
        
        msg = Message(subject, sender='recruiteaseofficial@gmail.com', recipients=[applicant_email], cc=[cc_email])
        msg.html = email_content

        mail.send(msg)
        print("Email successfully sent")
    except Exception as e:
        print(f"An error occurred while sending the email: {str(e)}")

def generate_email_content(new_status, job_title, position, company_name, sender_name, meeting_link=None, meeting_date=None, meeting_time=None):
    base_html = """
    <html>
        <body>
            {content}
        </body>
    </html>
    """

    if new_status == "Offered":
        subject = f"Successful Application - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We are thrilled to extend an offer to you to join our team at <b>{company_name}</b> as a <b>{job_title}</b>. We were impressed with your skills and experience and believe you will be a valuable addition to our team.
        <br><br>We look forward to your response.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>{position}<br>
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
        <br>{position}<br>
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
        <br>{position}
        <br><b>{company_name}</b>
        </div>"""

    elif new_status == "Interview":
        subject = f"Invitation to Interview - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We are pleased to inform you that after reviewing your application for the <b>{job_title}</b> position at <b>{company_name}</b>, we would like to invite you to the next stage of our recruitment process: interview session.
        <br><br>This is a great opportunity for us to learn more about your skills and experiences, as well as for you to understand more about the role and our company.
        <br><br>Meeting Link: {meeting_link}
        <br>Meeting Date: {meeting_date}
        <br>Meeting Time: {meeting_time}
        <br><br>We will be in touch shortly to arrange a convenient time and date for the interview. In the meantime, if you have any questions, please do not hesitate to contact us.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>{position}
        <br><b>{company_name}</b>
        </div>"""
        
    elif new_status == "Reschedule":
        subject = f"Interview Rescheduled - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We hope this message finds you well. We are writing to inform you that your interview for the position of {job_title} at {company_name} has been rescheduled.
        <br><br>We apologize for any inconvenience this may cause and appreciate your flexibility in accommodating the new schedule.
        <br><br>Here are the new details for your interview:
        <br><br>Meeting Link: {meeting_link}
        <br>Meeting Date: {meeting_date}
        <br>Meeting Time: {meeting_time}
        <br><br>We look forward to speaking with you and learning more about your qualifications and experiences. If you have any questions or need further assistance, please do not hesitate to contact us.
        <br><br>Thank you for your understanding.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>{position}
        <br><b>{company_name}</b>
        </div>"""

        
    elif new_status == "Cancel Interview":
        subject = f"Interview Cancelled - {job_title}, {company_name}"
        message_html = f"""
        <div style="font-size: 14px;">
        Dear Applicant,
        <br><br>We regret to inform you that your scheduled interview for the position of {job_title} at {company_name} has been cancelled due to unforeseen circumstances.
        <br><br>We apologize for any inconvenience this may cause. We value your interest in our company and appreciate the time you have invested in the application process.
        <br><br>We will make a quick arrangement on rescheduling a new interview session, please do not hesitate to contact us.
        <br><br>Thank you for your understanding.
        <br><br>Best Regards,
        <br><br><b>{sender_name}</b>
        <br>{position}
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
        <br>{position}
        <br><b>{company_name}</b>
        </div>"""

    final_html_content = base_html.format(content=message_html)
    return final_html_content
     
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
            blob = bucket.blob(f'resumes/{uid}/{filename}')
            blob.upload_from_string(
                resume_file.read(), content_type=resume_file.content_type
            )
            blob.make_public()
            resume_url = blob.public_url
            
            # Preprocessed
            resume_text = fetch_pdf_text(blob.name)
            job_desc_text = get_job_description(jobId)
            
            knn_model, vectorizer, label_encoder = load_model_components()
            predicted_category = predict_categories([resume_text], knn_model, vectorizer, label_encoder)

            job_doc = db.collection('jobListings').document(jobId).get()
            job_category = job_doc.to_dict().get('category', '')
            
            scores = calculate_similarity_scores([resume_text], job_desc_text, predicted_category, job_category, similarity_weight=0.6, category_weight=0.4)
            score = scores[0]
            # score = calculate_similarity_scores([resume_text], job_desc_text)
            # print("Score here", score)

            # Add additional data to application data
            app_data.update({
                'resume': resume_url,
                'appliedAt': datetime.utcnow().isoformat(),
                'applicantID': uid,
                'jobID': jobId,
                'status':"Applied",
                'score':score,
                'predicted_category':predicted_category.tolist(),
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
        
        # bucket = storage.bucket()
        blob = bucket.blob(f'tempResumes/{uid}/{filename}')
        blob.upload_from_string(
            resume_file.read(), content_type=resume_file.content_type
        )
        blob.make_public()
        resume_url = blob.public_url
        
        # Preprocess the resume text
        resume_text = fetch_pdf_text(blob.name)
        # resume_text = resumeparse.read_file(blob.name)
        # print("resume parse in App.py: ", resume_text)
        knn_model, vectorizer, label_encoder = load_model_components()
        predicted_category = predict_categories([resume_text], knn_model, vectorizer, label_encoder)

        # Retrieve jobs from Firestore and match
        matched_jobs = find_matching_jobs([resume_text], predicted_category, top_n=10)
        # print("matched jobs: ", matched_jobs)

        response_data = {
            'matched_jobs':matched_jobs,
            'predicted_category': predicted_category.tolist(),
        }
        
        print(response_data)
        return jsonify(response_data)
  

if __name__ == '__main__':
    app.run(debug=True)
