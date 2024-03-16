import firebase_admin
from firebase_admin import credentials
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

@app.route("/joblistings", methods=['GET'])
def get_jobs():
    job_listings = db.collection('jobListings').stream()
    job_list = []

    for job in job_listings:
        job_list.append(job.to_dict())
               
    return jsonify(job_list)

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
    

@app.route("/members")
def members():
    return {"members": ["Member1", "Member2"]}

if __name__ == '__main__':
    app.run(debug=True)
