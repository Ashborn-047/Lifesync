"""
Test script for Grok provider
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from src.llm.providers.grok_provider import GrokProvider
from src.config.llm_provider import get_grok_key

def test_grok_provider():
    """Test Grok provider initialization and basic functionality"""
    print("Testing Grok Provider...")
    print("=" * 60)
    
    # Check API key
    grok_key = get_grok_key()
    if not grok_key or grok_key.startswith("YOUR"):
        print("[SKIP] GROK_API_KEY not configured in .env")
        print("Add GROK_API_KEY to .env file to test")
        return
    
    print(f"API Key: {grok_key[:20]}...")
    print()
    
    try:
        # Initialize provider
        print("1. Initializing Grok provider...")
        provider = GrokProvider(model_name="grok-beta", api_key=grok_key)
        print("[OK] Provider initialized")
        print()
        
        # Test simple content generation
        print("2. Testing content generation...")
        try:
            result = provider.generate_content(
                prompt="Say hello in one word",
                system_prompt="You are a helpful assistant."
            )
            print(f"[OK] Content generated: {result[:100]}")
        except Exception as e:
            print(f"[ERROR] Content generation failed: {e}")
            print("This might be due to API quota or network issues")
        
        print()
        print("3. Testing explanation generation...")
        print("(This requires full assessment data)")
        print("[INFO] Use the API endpoint to test full explanation generation")
        
    except Exception as e:
        print(f"[ERROR] Provider initialization failed: {e}")
        import traceback
        traceback.print_exc()
    
    print()
    print("=" * 60)
    print("Test completed!")

if __name__ == "__main__":
    test_grok_provider()

