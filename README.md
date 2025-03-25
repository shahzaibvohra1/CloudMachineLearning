# CloudMachineLearning
Cloud Machine Learning Project

## Run backend
1.⁠ Create and acticate environmetn, isntall boto3, chalice, etc. </br>
2.⁠ E⁠dit the .env file:
  * STORAGE_BUCKET=your-bucket
  * DYNAMODB_TABLE=ExpenseRecords (same as your table name on dynamodb)

3.⁠ ⁠⁠Create your dynamodb table. Check the env file for the dynamodb name.
  * Partition key is ExpenseID</br>

4.⁠ ⁠Run the server with chalice local</br>

To Fetch data from dynamodb table</br>
5.⁠ ⁠⁠You need to upload receipt via postman or curl with upload endpoint (The index.html in TestApp folder is easy to test api)
