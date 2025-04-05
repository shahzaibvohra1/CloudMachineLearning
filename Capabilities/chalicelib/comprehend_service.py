import boto3
comprehend_client = boto3.client("comprehend")

def categorize_expense_with_comprehend(full_text):
    """
    Uses Amazon Comprehend to analyze full receipt text and classify it into an expense category.
    """
    try:
        # Use Comprehend for key phrase extraction
        response = comprehend_client.detect_key_phrases(Text=full_text, LanguageCode="en")
        detected_phrases = [phrase["Text"].lower() for phrase in response["KeyPhrases"]]

        print(f"🔍 Detected Key Phrases: {detected_phrases}")  # Debugging

        # Category mapping
        category_mapping = {
            "groceries": ["grocery", "supermarket", "food basics", "walmart", "costco", "no frills", "fruit", "apple", "banana", "food", "superstore", "kg"],
            "restaurants": ["restaurant", "fast food", "mcdonalds", "kfc", "subway", "burger king", "diner", "cafe"],
            "shopping": ["shopping", "retail", "amazon", "best buy", "ebay", "clothing", "electronics","dollarama"],
            "healthcare": ["pharmacy", "hospital", "shoppers drug mart", "medicine", "doctor"],
            "utilities": ["mobile", "internet", "electricity", "power", "hydro", "gas", "water", "billing", "toronto hydro", "fido", "rogers", "enbridge"]
        }

        # Confidence-based category scoring
        category_scores = {category: 0 for category in category_mapping}

        for phrase in detected_phrases:
            for category, keywords in category_mapping.items():
                for keyword in keywords:
                    if keyword in phrase:
                        category_scores[category] += 1  # Increment score

        # Find the category with the highest confidence score
        best_category = max(category_scores, key=category_scores.get)

        # If no matches, return "other"
        if category_scores[best_category] == 0:
            return "other"

        return best_category

    except Exception as e:
        print(f"❌ Error using Comprehend: {e}")
        return "other"
