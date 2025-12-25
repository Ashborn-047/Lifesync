
import json
import sys
import os
from pathlib import Path

# Add src to path
sys.path.append(os.path.join(os.getcwd(), 'src'))

from scorer import score_answers

def test_scoring():
    # Load smart 30 questions
    with open('data/question_bank/smart_30.json', 'r') as f:
        smart_30 = json.load(f)
        question_ids = smart_30['question_ids']

    print(f"Loaded {len(question_ids)} questions from smart_30.json")

    # User's actual payload
    responses = {
        "Q043":1,"Q001":2,"Q049":3,"Q007":4,"Q115":5,"Q145":1,"Q133":2,"Q061":3,"Q067":4,"Q073":5,
        "Q091":1,"Q151":2,"Q121":3,"Q163":4,"Q139":5,"Q097":5,"Q109":4,"Q169":3,"Q175":2,"Q031":1,
        "Q025":5,"Q019":4,"Q085":3,"Q157":2,"Q103":1,"Q055":5,"Q079":4,"Q013":3,"Q037":2,"Q127":1
    }
    
    # Score
    result = score_answers(responses)
    
    print("\n--- Scoring Results ---")
    print("Traits:")
    for trait, score in result['traits'].items():
        print(f"  {trait}: {score}")

if __name__ == "__main__":
    test_scoring()
