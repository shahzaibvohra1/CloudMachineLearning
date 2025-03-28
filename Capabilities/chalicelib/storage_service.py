import boto3


class StorageService:
    def __init__(self, storage_location):
        self.client = boto3.client('s3')
        self.bucket_name = storage_location

    def get_storage_location(self):
        return self.bucket_name

    def upload_file(self, file_bytes, file_name):
        """Uploads a file to S3 and returns the file key and public URL."""
        try:
            file_key = f"uploads/{file_name}"  # Ensure the file is placed in a folder
            
            response = self.client.put_object(
                Bucket=self.bucket_name,
                Body=file_bytes,
                Key=file_key,
                ACL='public-read'
            )

           

            return {
                'file_key': file_key,  # Ensure 'file_key' is returned
                'file_url': f"https://{self.bucket_name}.s3.amazonaws.com/{file_key}"
            }

        except Exception as e:
            print(f"Error uploading file to S3: {str(e)}")  # Debugging
            return {"error": str(e)}
