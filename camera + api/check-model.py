import requests
import os
import json

# --- Configuration ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.")

# URL to list available models
list_models_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"

print("Checking for available models with your API key...")

try:
    # Make the GET request
    response = requests.get(list_models_url)
    response.raise_for_status()  # Raise an exception for bad status codes

    # Parse and print the JSON response
    models = response.json()
    print("\n--- Successfully retrieved models ---")

    # Pretty-print the JSON for readability
    print(json.dumps(models, indent=2))

    print("\n--- End of list ---")
    print("\nPlease look for a model name that includes 'vision' in the list above.")


except requests.exceptions.RequestException as e:
    print(f"\n--- Error ---")
    print(f"Failed to call the API: {e}")
    # Try to print detailed error from Google if available
    try:
        print(f"API Error Details: {e.response.json()}")
    except:
        pass
