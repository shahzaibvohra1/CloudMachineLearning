from chalice import Chalice
from chalicelib import storage_service
from chalicelib import recognition_service
from chalicelib import translation_service


import uuid
import base64
import json
import boto3
from io import BytesIO
from chalice import Response



#####
# chalice app configuration
#####
app = Chalice(app_name='Capabilities')
app.debug = True

#####
# services initialization
#####
storage_location = ''
storage_service = storage_service.StorageService(storage_location)
recognition_service = recognition_service.RecognitionService(storage_service)
translation_service = translation_service.TranslationService()

polly_client = boto3.client('polly', region_name='us-east-1')
s3 = boto3.client('s3')
file_key = ''



@app.route('/images', methods = ['POST'], cors = True)
def upload_image():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    file_name = request_data['filename']
    file_bytes = base64.b64decode(request_data['filebytes'])

    image_info = storage_service.upload_file(file_bytes, file_name)
    

    return image_info


@app.route('/headlines', methods=['POST'], cors=True)
def translate_image_text():
    """Detects and translates text in the specified image."""
    try:
        # Parse JSON data from the request body
        request_data = app.current_request.json_body
        if not request_data:
            return {"error": "No JSON data provided"}, 400

        from_lang = request_data.get('fromLang')
        to_lang = request_data.get('toLang')

        # Fetch file content from S3
        response = s3.get_object(Bucket=storage_location, Key=file_key)
        file_content = response['Body'].read().decode('utf-8')

       
        lines = file_content.split('\r\n')

        translated_lines = []
        for line in lines:
            if line.strip():  # Skip empty lines
                translated_line = translation_service.translate_text(line, from_lang, to_lang)
                translated_lines.append({
                    "original": line,
                    "translated": translated_line
                })

        # Prepare the result
        result = {
            "translatedLines": translated_lines,
            "original": lines
        }

        return result
    except Exception as e:
        return {"error": str(e)}, 500




@app.route('/generate-audio', methods=['POST'], cors=True)
def generate_audio():
    request_data = app.current_request.json_body
    text = request_data.get('text')

    if not text:
        return {'error': 'Text not provided'}

    try:
        # Use Polly to generate audio
        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId='Joanna'
        )

        audio_stream = response.get("AudioStream")
    
        
        if audio_stream:
            # Read the audio stream into a BytesIO object
            audio_bytes = audio_stream.read()

            # Return the audio file as a binary response
            return Response(
                body=audio_bytes,
                status_code=200,
                headers={'Content-Type': 'audio/mpeg'}
            )

        return {'error': 'Failed to generate audio'}



    except Exception as e:
        return {'error': str(e)}