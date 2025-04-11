

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json
import tempfile
import google.generativeai as genai
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your React app

API_KEY = "AIzaSyDSWginf-Spn_wnydu2GpQk6aE6IxlDVH0"  # Replace with your actual API key
genai.configure(api_key=API_KEY)

@app.route('/extract', methods=['POST'])
def extract_mcqs():
    # Check if file is present in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Save file to temporary location
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)
    
    try:
        # Read the image file bytes
        with open(temp_path, "rb") as img_file:
            img_bytes = img_file.read()
        
        # Create Gemini model
        model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest")
        
        # Prompt for extracting MCQs
        prompt = (
            "Extract only the questions, their options, and the correct answer from this image. "
            "Return the output strictly as a JSON list like this:\n\n"
            "[\n"
            "  {\n"
            "    \"question\": \"What is 2+2?\",\n"
            "    \"options\": [\"2\", \"3\", \"4\", \"5\"],\n"
            "    \"answer_index\": 2  // 0-based index of correct option\n"
            "  },\n"
            "  ...\n"
            "]\n"
            "Do not include any explanation, just the JSON array."
        )

        
        # Generate content
        response = model.generate_content(
            contents=[
                {"mime_type": "image/jpeg", "data": img_bytes},
                prompt
            ]
        )
        
        # Parse the JSON response
        try:
            # Clean up any extra text that might be around the JSON
            response_text = response.text

            # Extract JSON using regular expression to find JSON array
            json_match = re.search(r'\[\s*{.*?}\s*\]', response_text, re.DOTALL)
            if not json_match:
                return jsonify({'error': 'Could not find JSON in the response.'}), 500

            json_str = json_match.group(0)

            # Parse it safely
            extracted_data = json.loads(json_str)
            return jsonify(extracted_data)
        except Exception as e:
            return jsonify({'error': f'Failed to parse JSON response: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Error processing document: {str(e)}'}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)