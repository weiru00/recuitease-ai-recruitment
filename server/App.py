import firebase_admin
from firebase_admin import credentials, auth
from firebase_admin import firestore
from flask import request

# Use a relative or absolute path to your Firebase Admin SDK JSON file
cred = credentials.Certificate('recruitease-6b088-firebase-adminsdk-kar6k-61a0f2350b.json')
firebase_admin.initialize_app(cred)

# Now you can use Firestore
db = firestore.client()


from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# @app.route("/jobs", methods=['GET'])
# def get_jobs():
#     doc_ref = db.collection('jobListings').stream()

#     doc = doc_ref.get()
#     if doc.exists:
#         doc_data = doc.to_dict()
#         print(f"Document data: {doc_data}")
#         return jsonify(doc_data)  # Convert the document to a dict and return as JSON
#     else:
#         print("No such document!")
#         return jsonify({"error": "Document not found"}), 404  # Return a 404 error if the document doesn't exist


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
        # The document ID will be the user's UID
        user_ref = db.collection('users').document(uid)
        user_ref.set(user_data)
        print(f'User data for {uid} saved successfully.')
    except Exception as e:
        print(f'Failed to save user data for {uid}: {str(e)}')
    
@app.route('/verifyToken', methods=['POST'])
def verify_token():
    # data = request.get_json()
    # id_token = data.get('idToken')

    # try:
    #     # Verify the ID token while checking if the token is revoked
    #     decoded_token = auth.verify_id_token(id_token, check_revoked=True)

    #     # Get the user's UID from the decoded token
    #     uid = decoded_token['uid']

    #     # Optional: Retrieve user records or perform additional checks
    #     user = auth.get_user(uid)

    #     # Optional: Implement your additional logic here

    #     return jsonify({'success': True, 'uid': uid}), 200
    # except auth.RevokedIdTokenError:
    #     # Token has been revoked. Inform the user to reauthenticate or sign out the user.
    #     return jsonify({'error': 'ID token has been revoked'}), 401
    # except Exception as e:
    #     return jsonify({'error': str(e)}), 500
    data = request.get_json()
    id_token = data.get('idToken')

    try:
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        uid = decoded_token['uid']

        # Retrieve user document from Firestore
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
    
@app.route("/joblistings", methods=['GET'])
def get_jobs():
    job_listings = db.collection('jobListings').stream()
    job_list = []

    for job in job_listings:
        job_data = job.to_dict()
        job_data['id'] = job.id  # Add the document ID to the dictionary
        job_list.append(job_data)
               
    return jsonify(job_list)

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
        # Extract job details from the request body
        job_data = request.json

        # Add a new document to the jobListings collection
        job_ref = db.collection('jobListings').add(job_data)

        # Respond with success message and the new job ID
        return jsonify({"success": True, "id": job_ref[1].id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
    
@app.route("/update-job/<job_id>", methods=['PUT'])
def update_job(job_id):
    try:
        # Extract job details from the request body
        job_data = request.json

        # Reference to the specific job document
        job_ref = db.collection('jobListings').document(job_id)

        # Update the job document with new data
        job_ref.update(job_data)

        return jsonify({"success": True, "message": "Job updated successfully."}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/delete-job/<job_id>", methods=['DELETE'])
def delete_job(job_id):
    try:
        # Attempt to delete the job document from Firestore
        job_ref = db.collection('jobListings').document(job_id)
        job_ref.delete()

        # If deletion was successful, send a success response
        return jsonify({"success": True, "message": "Job deleted successfully"}), 200
    except Exception as e:
        # If an error occurs, send an error response
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/members")
def members():
    return {"members": ["Member1", "Member2"]}

if __name__ == '__main__':
    app.run(debug=True)
