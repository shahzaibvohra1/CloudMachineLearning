import boto3
from datetime import datetime
from chalicelib.comprehend_service  import categorize_expense_with_comprehend

# Initialize AWS Clients
textract_client = boto3.client("textract")


def clean_text(text):
    """Removes newline characters and extra spaces from extracted text."""
    return " ".join(text.split()).strip()

def extract_text_from_receipt(s3_bucket, file_key):
    """
    Extracts text from a receipt stored in S3 using Amazon Textract.
    Uses Amazon Comprehend to categorize the expense based on full receipt text.
    """
    try:
        response = textract_client.analyze_expense(
            Document={"S3Object": {"Bucket": s3_bucket, "Name": file_key}}
        )

        merchant_name = "Unknown Merchant"
        receipt_date = None
        total_amount = None
        all_text = []  # 🔹 Store full receipt text

        # Extract key receipt fields
        for expense_doc in response.get("ExpenseDocuments", []):
            for summary_field in expense_doc.get("SummaryFields", []):
                label = summary_field.get("Type", {}).get("Text", "").lower()
                value = summary_field.get("ValueDetection", {}).get("Text", "")
                value = clean_text(value)

                if "name" in label:
                    merchant_name = value
                elif "date" in label:
                    print(f"Extracted raw date: {value}") 
                    receipt_date = parse_date(value)
                elif "total" in label:
                    try:
                        total_amount = float(value.replace("$", "").replace(",", ""))
                    except ValueError:
                        total_amount = None

                # 🔹 Add to full text
                if value:
                    all_text.append(value)

        # Extract full line items from receipt
        for line_item_group in expense_doc.get("LineItemGroups", []):
            for line_item in line_item_group.get("LineItems", []):
                for field in line_item.get("LineItemExpenseFields", []):
                    field_value = field.get("ValueDetection", {}).get("Text", "")
                    if field_value:
                        all_text.append(field_value)  # 🔹 Add each item to full text

        # 🚀 Convert full text list to a single string
        full_receipt_text = " ".join(all_text)

        # Validate total amount before proceeding
        if total_amount is None or total_amount == 0.00:
            print("⚠️ Validation Failed: No total amount detected. This is not a receipt.")
            return {"error": "Invalid receipt."}

        print(f"✅ Valid receipt detected. Proceeding with saving. Total: {total_amount}")
        print(f"📝 Full Extracted Text: {full_receipt_text[:500]}...")  # Debugging output

        # 🔹 Use full receipt text for categorization
        category = categorize_expense_with_comprehend(full_receipt_text)

        return {
            "merchant_name": merchant_name,
            "date": receipt_date,
            "total_amount": total_amount,
            #"full_text": full_receipt_text,  # Include full receipt text for reference
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
