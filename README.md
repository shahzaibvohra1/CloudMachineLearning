# ☁️ Cloud Machine Learning Project

## 📌 Project Description
Cloud Machine Learning is an AI-powered **Expense Manager** that helps users track, categorize, and manage their expenses using **machine learning**. This project utilizes **AWS cloud services**, including **Amazon Textract** for OCR-based receipt scanning, **Amazon Comprehend** for categorizing the receipts, and **Amazon DynamoDb** for storing the extracted data. The system provides a **user-friendly dashboard** for expense visualization and financial insights. 🚀



## 🚀 Run Backend

### 1️⃣ Create and activate environment, install necessary dependencies:
```bash
pipenv --python 3.10
pipenv install boto3 chalice
pipenv shell
```

### 2️⃣ Create the `.env` file to include:
```ini
STORAGE_BUCKET=your-bucket-name
DYNAMODB_TABLE=ExpenseRecords
```
- Ensure that `ExpenseRecords` matches your actual DynamoDB table name.
- save it on the app.py level location

### 3️⃣ Create your DynamoDB table:
```bash
aws dynamodb create-table \
 --table-name ExpenseRecords \
 --attribute-definitions AttributeName=ExpenseID,AttributeType=S \
 --key-schema AttributeName=ExpenseID,KeyType=HASH \
 --billing-mode PAY_PER_REQUEST \
 --region us-east-1
```

### 4️⃣ Run the server locally using Chalice:
```bash
chalice local
```

## 💻 Run Frontend

### 5️⃣ (To be completed)

## 👥 Authors

**Group 4**
- **Lei Cao**  
- **Kirstin Megga Ramos**  
- **Joan Suaverdez**  
- **Muhammad Shahzaib Vohra**  
- **Ruolan Wang**  
