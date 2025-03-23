import boto3
import uuid
import os
from datetime import datetime
from decimal import Decimal  # Import Decimal module
from boto3.dynamodb.conditions import Key  

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")

# Load table name from environment variable
TABLE_NAME = os.getenv("DYNAMODB_TABLE", "ExpenseRecords")

def save_to_dynamodb(expense_data):
    """
    Saves the extracted expense data into an AWS DynamoDB table.
    
    :param expense_data: A dictionary containing extracted receipt data.
    :return: A response from DynamoDB.
    """
    try:
        # Reference the DynamoDB table
        table = dynamodb.Table(TABLE_NAME)

        # Generate a unique Expense ID
        expense_id = str(uuid.uuid4())

        # Convert float values to Decimal
        total_amount = Decimal(str(expense_data.get("total_amount", 0.00)))  # Ensure Decimal type
        items = expense_data.get("items", [])

        # Prepare the data for insertion
        item = {
            "ExpenseID": expense_id,  # Unique Identifier
            "MerchantName": expense_data.get("merchant_name", "Unknown"),
            "Date": expense_data.get("date", "Unknown"),
            "TotalAmount": total_amount,  # Ensure it's stored as Decimal
            "Items": items,  # List of items
            "Category": expense_data.get("category", "Uncategorized"),
            "CreatedAt": datetime.utcnow().isoformat()  # Timestamp for sorting
        }

        # Insert into DynamoDB
        response = table.put_item(Item=item)

        return {
            "status": "success",
            "message": "Expense saved successfully",
            "ExpenseID": expense_id
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def fetch_from_dynamodb(expense_id=None, merchant_name=None, date=None):
    """
    Fetches expense data from DynamoDB based on ExpenseID, MerchantName, or Date.
    
    :param expense_id: The unique identifier for the expense (optional).
    :param merchant_name: The name of the merchant (optional).
    :param date: The date of the expense (optional).
    :return: A list of matching expense records.
    """
    try:
        # Reference the DynamoDB table
        table = dynamodb.Table(TABLE_NAME)

        # Query based on the provided parameters
        if expense_id:
            # Fetch by ExpenseID (primary key)
            response = table.get_item(Key={"ExpenseID": expense_id})
            if "Item" in response:
                return [response["Item"]]
            else:
                return []
        elif merchant_name or date:
            # Query based on MerchantName or Date (secondary index or filter)
            filter_expression = None
            if merchant_name and date:
                filter_expression = Key("MerchantName").eq(merchant_name) & Key("Date").eq(date)
            elif merchant_name:
                filter_expression = Key("MerchantName").eq(merchant_name)
            elif date:
                filter_expression = Key("Date").eq(date)

            if filter_expression:
                response = table.scan(FilterExpression=filter_expression)
                return response.get("Items", [])
            else:
                return []
        else:
            # No query parameters provided, return all items
            response = table.scan()
            return response.get("Items", [])

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }