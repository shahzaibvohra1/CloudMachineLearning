import boto3

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
    """
    try:
        response = textract_client.analyze_expense(
            Document={"S3Object": {"Bucket": s3_bucket, "Name": file_key}}
        )

        merchant_name = "Unknown Merchant"
        receipt_date = "Unknown Date"
        total_amount = 0.00
        items = []

        print("\n=== Debug: Extracted Fields ===")

        # Loop through extracted expense fields
        for expense_doc in response.get("ExpenseDocuments", []):
            for summary_field in expense_doc.get("SummaryFields", []):
                label = summary_field.get("Type", {}).get("Text", "").lower()
                value = summary_field.get("ValueDetection", {}).get("Text", "")
                value = clean_text(value)

                if "name" in label:
                    merchant_name = value
                elif "date" in label:
                    receipt_date = value
                elif "total" in label:
                    try:
                        total_amount = float(value.replace("$", "").replace(",", ""))
                    except ValueError:
                        total_amount = 0.00

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
