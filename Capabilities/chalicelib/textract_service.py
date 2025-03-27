import boto3
from datetime import datetime

# Initialize Textract client
textract_client = boto3.client("textract")

# Define expense categories and keywords
expense_categories = {
    "groceries": ["walmart", "costco", "real canadian superstore", "no frills", "food basics"],
    "utilities": ["fido", "rogers", "gas bill", "internet", "wifi", "mobile"],
    "restaurants": ["mcdonald’s", "kfc", "subway", "restaurant", "diner", "cafe"],
    "shopping": ["amazon", "ebay", "best buy", "walmart", "target"],
    "healthcare": ["shoppers", "doctor", "hospital", "medicine"],
    "other": []
}

def categorize_expense(merchant_name, items):
    """
    Categorizes the expense based on the merchant name and item descriptions.
    """
    merchant_name = merchant_name.lower()

    # Check merchant name for category match
    for category, keywords in expense_categories.items():
        if any(keyword in merchant_name for keyword in keywords):
            return category

    # If merchant name doesn't match, check items
    for item in items:
        item = item.lower()
        for category, keywords in expense_categories.items():
            if any(keyword in item for keyword in keywords):
                return category

    return "other"  # Default category if no match found

def clean_text(text):
    """Removes newline characters and extra spaces from extracted text."""
    return " ".join(text.split()).strip()

def extract_text_from_receipt(s3_bucket, file_key):
    """
    Extracts date, merchant name, total amount, and item names from a receipt image stored in S3 using Amazon Textract's analyze_expense.
    Prevents saving if total amount is missing.
    """
    try:
        response = textract_client.analyze_expense(
            Document={"S3Object": {"Bucket": s3_bucket, "Name": file_key}}
        )

        merchant_name = "Unknown Merchant"
        receipt_date = None
        total_amount = None  # Changed from 0.00 to None
        items = []

        # Loop through extracted expense fields
        for expense_doc in response.get("ExpenseDocuments", []):
            for summary_field in expense_doc.get("SummaryFields", []):
                label = summary_field.get("Type", {}).get("Text", "").lower()
                value = summary_field.get("ValueDetection", {}).get("Text", "")
                value = clean_text(value)

                if "name" in label:
                    merchant_name = value
                elif "date" in label:
                    print(f"Extracted raw date: {value}") 
                    receipt_date = parse_date(value)  # Use helper function to parse date
                elif "total" in label:
                    try:
                        total_amount = float(value.replace("$", "").replace(",", ""))
                    except ValueError:
                        total_amount = None  # Set to None if invalid

        # 🚨 **Validation: Ensure the receipt has a valid total amount**
        if total_amount is None or total_amount == 0.00:
            print("⚠️ Validation Failed: No total amount detected. This is not a receipt.")
            return {"error": "Invalid receipt."}

        # 🚀 If total exists, proceed with processing
        print(f"✅ Valid receipt detected. Proceeding with saving. Total: {total_amount}")

        # Extract item names from receipt
        for line_item_group in expense_doc.get("LineItemGroups", []):
            for line_item in line_item_group.get("LineItems", []):
                for field in line_item.get("LineItemExpenseFields", []):
                    field_label = field.get("Type", {}).get("Text", "").lower()
                    field_value = field.get("ValueDetection", {}).get("Text", "")

                    if "item" in field_label and field_value:
                        items.append(field_value)

        # Categorize the expense
        category = categorize_expense(merchant_name, items)

        return {
            "merchant_name": merchant_name,
            "date": receipt_date,
            "total_amount": total_amount,
            "items": items,
            "category": category
        }

    except Exception as e:
        return {"error": str(e)}


def parse_date(date_str):
    """
    Parses a date string into an ISO 8601 format (YYYY-MM-DD).
    Handles various date formats that might appear in receipts.
    """
    possible_formats = [
        "%y/%m/%d", # 25/01/11 → 2025-01-11 
        "%b %d, %Y",  # Dec 26, 2024 ✅ (Newly Added)
        "%b %d %Y",   # Mar 31 2025
        "%Y-%m-%d",   # 2025-03-31
        "%m/%d/%Y",   # 03/31/2025
        "%d-%m-%Y",   # 31-03-2025
        "%d %B %Y",   # 31 March 2025
        "%B %d, %Y",  # March 31, 2025
    ]
    
    for fmt in possible_formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            return parsed_date.strftime("%Y-%m-%d")  # Convert to ISO 8601 format
        except ValueError:
            continue

    return "Invalid Date" 