import pandas as pd
import os
import re
import nltk
import numpy as np
import joblib
from nltk.stem import WordNetLemmatizer, PorterStemmer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GridSearchCV

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

def preprocess(resumeText):
    lemmatizer = WordNetLemmatizer()
    resumeText = re.sub('http\S+\s*', ' ', resumeText)  # remove URLs
    resumeText = re.sub('RT|cc', ' ', resumeText)  # remove RT and cc
    resumeText = re.sub('#\S+', '', resumeText)  # remove hashtags
    resumeText = re.sub('@\S+', '  ', resumeText)  # remove mentions
    resumeText = re.sub('[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', resumeText)  # remove punctuations
    resumeText = re.sub(r'[^\x00-\x7f]', r' ', resumeText)  # remove non-ASCII characters
    resumeText = re.sub('\s+', ' ', resumeText)  # remove extra whitespace

    tokens = word_tokenize(resumeText)
    tokens = [word for word in tokens if word not in stopwords.words('english')]
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return ' '.join(tokens)

# Load and preprocess dataset
def load_and_preprocess_data(file_path):
    df = pd.read_csv(file_path, encoding='utf-8')
    df['cleaned_resume'] = df['Resume'].apply(preprocess)
    return df

# Train and save the kNN model, vectorizer, and label encoder
def train_and_save_model(df, model_path, vectorizer_path, label_encoder_path):
    vectorizer = TfidfVectorizer(stop_words='english', max_features=2000)
    X = vectorizer.fit_transform(df['cleaned_resume'])
    
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df['Category'])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=42)

    knn = KNeighborsClassifier(n_neighbors=5)
    knn.fit(X_train, y_train)

    y_val_pred = knn.predict(X_val)
    val_accuracy = accuracy_score(y_val, y_val_pred)
    print(f'Validation Accuracy: {val_accuracy}')

    param_grid = {'n_neighbors': np.arange(1, 31)}
    knn_gscv = GridSearchCV(knn, param_grid, cv=5)
    knn_gscv.fit(X_train, y_train)
    print(f'Best k: {knn_gscv.best_params_["n_neighbors"]}')

    knn_optimal = KNeighborsClassifier(n_neighbors=knn_gscv.best_params_['n_neighbors'])
    knn_optimal.fit(X_train, y_train)

    y_test_pred = knn_optimal.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_test_pred)
    print(f'Test Accuracy: {test_accuracy}')
    
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    os.makedirs(os.path.dirname(vectorizer_path), exist_ok=True)
    os.makedirs(os.path.dirname(label_encoder_path), exist_ok=True)

    joblib.dump(knn_optimal, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(label_encoder, label_encoder_path)

# Load the kNN model, vectorizer, and label encoder
def load_model(model_path, vectorizer_path, label_encoder_path):
    knn_model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    label_encoder = joblib.load(label_encoder_path)
    return knn_model, vectorizer, label_encoder

# Predict categories for resumes
def predict_categories(resumes, knn_model, vectorizer, label_encoder):
    cleaned_resumes = [preprocess(resume) for resume in resumes]
    resume_vectors = vectorizer.transform(cleaned_resumes)
    predicted_categories = knn_model.predict(resume_vectors)
    decoded_categories = label_encoder.inverse_transform(predicted_categories)
    return decoded_categories

if __name__ == "__main__":
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, 'input', 'ResumeDataSet.csv')
    model_path = os.path.join(base_dir, 'models', 'knn_model.pkl')
    vectorizer_path = os.path.join(base_dir, 'models', 'tfidf_vectorizer.pkl')
    label_encoder_path = os.path.join(base_dir, 'models', 'label_encoder.pkl')

    df = load_and_preprocess_data(data_path)
    train_and_save_model(df, model_path, vectorizer_path, label_encoder_path)
