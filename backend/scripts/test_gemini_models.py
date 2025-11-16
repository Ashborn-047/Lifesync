"""Test different Gemini model names"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.llm_provider import get_gemini_key
from src.llm.gemini_provider import GeminiProvider

models_to_try = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

working_models = []

api_key = get_gemini_key()
if not api_key:
    print("[ERROR] Gemini API key not found")
    sys.exit(1)

print("Testing Gemini model names...")
print(f"API Key: {api_key[:20]}...")
print("")

for model_name in models_to_try:
    try:
        print(f"Testing: {model_name}...", end=" ")
        provider = GeminiProvider(model_name=model_name, api_key=api_key)
        # Try a simple generation
        result = provider.generate_content("Say hello in one word", max_retries=1)
        print(f"[OK] Works! Response: {result[:50]}")
        working_models.append(model_name)
        break
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg or "not found" in error_msg.lower():
            print(f"[SKIP] Model not found")
        elif "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            print(f"[OK] Model exists but quota exceeded (model name is correct!)")
            working_models.append(model_name)
            # Continue to try other models
        else:
            print(f"[ERROR] {error_msg[:100]}")

print("")
if working_models:
    print(f"Working models found: {', '.join(working_models)}")
    print(f"Recommended: {working_models[0]}")
else:
    print("No working models found. Check API key and quota.")

