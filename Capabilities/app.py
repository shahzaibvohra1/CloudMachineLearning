from chalice import Chalice, Response
from chalicelib import storage_service, textract_service,dynamo_service

import base64
import json
import imghdr
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Chalice app configuration
app = Chalice(app_name='Capabilities')
app.debug = True

# Services initialization
# storage_location = "contentcen301375673.aws.ai"
storage_location = os.getenv("STORAGE_BUCKET")
if not storage_location:
    raise ValueError("STORAGE_BUCKET is not set in .env file")

storage_service = storage_service.StorageService(storage_location)

@app.route('/upload', methods=['POST'], cors=True)
def process_receipt():
    """Uploads an image, extracts text, saves data to DynamoDB, and returns structured info."""
    try:
        # Parse the request body
        request_data = json.loads(app.current_request.raw_body)
        file_name = request_data.get('filename')
        file_bytes = base64.b64decode(request_data.get('filebytes', ''))

        # Validate input
        if not file_name or not file_bytes:
            return Response(body={"error": "Invalid request. Filename and filebytes are required."},
                            status_code=400)

        # Check if the file is a valid image (JPEG or PNG only)
        file_type = imghdr.what(None, file_bytes)
        if file_type not in ['jpeg', 'png']:
            return Response(body={"error": "Invalid file type. Only JPEG and PNG files are allowed."},
                            status_code=400)

        # Upload the file to S3
        upload_info = storage_service.upload_file(file_bytes, file_name)
        file_key = upload_info.get('file_key')

        # Extract text from the uploaded receipt
        extracted_data = textract_service.extract_text_from_receipt(storage_service.get_storage_location(), file_key)

    #     # Save the extracted data into DynamoDB
        save_response = dynamo_service.save_to_dynamodb(extracted_data)

        return Response(body={
            "message": "File uploaded, text extracted, and data saved successfully.",
            "file_key": upload_info,
            "extracted_data": extracted_data,
            "dynamodb_response": save_response
        }, status_code=200)

    except Exception as e:
        return Response(body={"error": str(e)}, status_code=500)
  


@app.route('/fetch/by-expense-id', methods=['GET'], cors=True)
def fetch_by_expense_id():
    """Fetches expense data by ExpenseID."""
    try:
        # Get the ExpenseID from query parameters
        expense_id = app.current_request.query_params.get('expense_id')
        if not expense_id:
            return Response(body={"error": "ExpenseID is required."}, status_code=400)

        # Fetch data from DynamoDB
        result = dynamo_service.fetch_from_dynamodb(expense_id=expense_id)
        return Response(body={
            "message": "Data fetched successfully.",
            "data": result
        }, status_code=200)

    except Exception as e:
        return Response(body={"error": str(e)}, status_code=500)

@app.route('/fetch/by-merchant-name', methods=['GET'], cors=True)
def fetch_by_merchant_name():
    """Fetches expense data by MerchantName."""
    try:
        # Get the MerchantName from query parameters
        merchant_name = app.current_request.query_params.get('merchant_name')
        if not merchant_name:
            return Response(body={"error": "MerchantName is required."},status_code=400)

        # Fetch data from DynamoDB
        result = dynamo_service.fetch_from_dynamodb(merchant_name=merchant_name)
        return Response({
            "message": "Data fetched successfully.",
            "data": result
        },status_code=200)

    except Exception as e:
        return Response(body={"error": str(e)}, status_code=500, cors=True)

@app.route('/fetch/by-date', methods=['GET'], cors=True)
def fetch_by_date():
    """Fetches expense data by Date."""
    try:
        # Get the Date from query parameters
        date = app.current_request.query_params.get('date')
        if not date:
            return Response(body={"error": "Date is required."},status_code=400)

        # Fetch data from DynamoDB
        result = dynamo_service.fetch_from_dynamodb(date=date)
        return Response(body={
            "message": "Data fetched successfully.",
            "data": result
        },status_code=200)

    except Exception as e:
        return Response(body={"error": str(e)}, status_code=500)
    
@app.route('/fetch/all', methods=['GET'], cors=True)
def fetch_all():
    """Fetches all expense data from DynamoDB."""
    try:
        # Fetch all data from DynamoDB
        result = dynamo_service.fetch_all_from_dynamodb()
        return Response(body={
            "message": "All data fetched successfully.",
            "data": result
        }, status_code=200)

    except Exception as e:
        return Response(body={"error": str(e)}, status_code=500)

@app.route('/fetch/by-category', methods=['GET'], cors=True)
def fetch_by_category():
    """Fetches expense data by Category."""
    try:
        # Get the Category from query parameters
        category = app.current_request.query_params.get('category')
        if not category:
            return Response(body={"error": "Category is required."}, status_code=400)
        # Fetch data from DynamoDB
        result = dynamo_service.fetch_from_dynamodb(category=category)
        return Response(body={
            "message": "Data fetched successfully.",
            "data": result
        }, status_code=200)
    except Exception as e:
        return Response(body={"error": str(e)}, status_code=500)