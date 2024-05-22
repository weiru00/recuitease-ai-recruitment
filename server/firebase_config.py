import firebase_admin
from firebase_admin import credentials, auth, firestore, storage

cred = credentials.Certificate('recruitease-6b088-firebase-adminsdk-kar6k-61a0f2350b.json')
firebase_admin.initialize_app(cred, {
        'storageBucket': 'recruitease-6b088.appspot.com'
    })

db = firestore.client()

bucket = storage.bucket()
