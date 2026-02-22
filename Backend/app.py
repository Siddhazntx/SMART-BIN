import flask
import requests
import base64
import os
from datetime import datetime
import json

# Initialize the Flask application
app = flask.Flask(__name__)

# --- Configuration ---
# Your API key should be set as an environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.")

# This is the correct model name confirmed to be available for your key
MODEL_NAME = "gemini-2.5-flash-preview-05-20"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"

# --- Create a directory to save images if it doesn't exist ---
if not os.path.exists('received_images'):
    os.makedirs('received_images')


@app.route('/classify', methods=['POST'])
def classify_image():
    """
    Receives an image, saves it, sends it to the Gemini API with an advanced prompt,
    and returns the classification result.
    """
    try:
        image_bytes = flask.request.get_data()
        if not image_bytes:
            return flask.jsonify({"error": "No image data received"}), 400

        # --- Save the received image ---
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"received_images/image_{timestamp}.jpg"
        with open(filename, 'wb') as f:
            f.write(image_bytes)
        print(f"Image saved to: {filename}")

        # Encode the image to base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # --- THE FIX: Advanced "Chain-of-Thought" Prompt ---
        # This prompt guides the AI to reason before answering.
        prompt = """
        You are an expert waste management classification system for a smart trash bin.
        Your task is to analyze the provided image by following these steps:
        1. Identify the primary object in the image.
        2. Determine the main materials of that object (e.g., plastic, metal, paper, fruit, vegetable).
        3. Based on the materials, classify the object as either 'organic' or 'inorganic'.

        Respond with ONLY a single word: 'organic' or 'inorganic'. Do not add any other explanation.
        """

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image_base64
                            }
                        }
                    ]
                }
            ]
        }

        # Make the request to the Gemini API
        response = requests.post(GEMINI_API_URL, json=payload)

        # Check for non-200 status code
        if response.status_code != 200:
            print(f"Error: Gemini API returned status code {response.status_code}")
            try:
                # Try to print the detailed error from the API response
                error_details = response.json()
                print("Gemini API Error Details:", json.dumps(error_details, indent=2))
                return flask.jsonify({"error": f"Gemini API error", "details": error_details}), 500
            except json.JSONDecodeError:
                print("Gemini API Error (could not decode JSON):", response.text)
                return flask.jsonify({"error": "Gemini API error", "details": response.text}), 500

        # Extract the text from the successful response
        result = response.json()

        # Add robust error checking for the response structure
        if 'candidates' not in result or not result['candidates']:
            print("Error: 'candidates' key missing or empty in API response.")
            return flask.jsonify({"error": "Invalid API response structure"}), 500

        first_candidate = result['candidates'][0]
        if 'content' not in first_candidate or 'parts' not in first_candidate['content'] or not \
        first_candidate['content']['parts']:
            print("Error: 'content' or 'parts' key missing in API response.")
            return flask.jsonify({"error": "Invalid API response structure"}), 500

        classification_text = first_candidate['content']['parts'][0]['text'].strip().lower()

        # Clean the response to be only one word
        if "inorganic" in classification_text:
            classification = "inorganic"
        elif "organic" in classification_text:
            classification = "organic"
        else:
            # If the model gives an unexpected response, default to unknown
            classification = "unknown"
            print(f"Warning: Unexpected response from API: '{classification_text}'")

        print(f"Classification result: {classification}")
        return classification, 200, {'Content-Type': 'text/plain'}

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        return flask.jsonify({"error": f"Failed to call Gemini API: {e}"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return flask.jsonify({"error": f"An internal server error occurred: {e}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

