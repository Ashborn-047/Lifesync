"""Test safe JSON utilities"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.safe_json import safe_load_json, extract_json, repair_json

# Test 1: Valid JSON
test1 = '{"summary": "test", "steps": ["step1"]}'
result1 = safe_load_json(test1)
print(f"Test 1 (valid JSON): {'PASS' if 'summary' in result1 and 'error' not in result1 else 'FAIL'}")

# Test 2: JSON with extra text
test2 = 'Some text before {"summary": "test"} and after'
result2 = safe_load_json(test2)
print(f"Test 2 (extract JSON): {'PASS' if 'summary' in result2 and 'error' not in result2 else 'FAIL'}")

# Test 3: Malformed JSON (trailing comma)
test3 = '{"summary": "test", "steps": ["step1"],}'
result3 = safe_load_json(test3)
print(f"Test 3 (repair JSON): {'PASS' if 'summary' in result3 and 'error' not in result3 else 'FAIL'}")

# Test 4: Totally broken
test4 = 'This is not JSON at all'
result4 = safe_load_json(test4)
print(f"Test 4 (broken JSON): {'PASS' if 'error' in result4 else 'FAIL'}")

print("\nAll safe JSON tests completed!")

