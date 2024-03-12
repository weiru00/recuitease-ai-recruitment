import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a relative or absolute path to your Firebase Admin SDK JSON file
cred = credentials.Certificate('recruitease-6b088-firebase-adminsdk-kar6k-61a0f2350b.json')
firebase_admin.initialize_app(cred)

# Now you can use Firestore
db = firestore.client()


from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/jobs")
def get_data():
    doc_ref = db.collection('jobListings').document("1tQudMuPeZF2FqDSlkIe")

    doc = doc_ref.get()
    if doc.exists:
        doc_data = doc.to_dict()
        print(f"Document data: {doc_data}")
        return jsonify(doc_data)  # Convert the document to a dict and return as JSON
    else:
        print("No such document!")
        return jsonify({"error": "Document not found"}), 404  # Return a 404 error if the document doesn't exist


@app.route("/members")
def members():
    return {"members": ["Member1", "Member2"]}

if __name__ == '__main__':
    app.run(debug=True)
