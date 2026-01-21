#!/usr/bin/env python3
"""
Check for duplicate answers in kanji test JSON files.

Usage:
    python check_duplicates.py <file_path>
    python check_duplicates.py  # checks all kanji_grade*.json in public/
"""

import json
import sys
from pathlib import Path
from collections import defaultdict


def find_duplicates(file_path):
    """Find duplicate answers in a kanji test JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading {file_path}: {e}")
        return None

    if 'questions' not in data:
        print(f"Error: 'questions' field not found in {file_path}")
        return None

    questions = data['questions']

    # Map answers to their occurrences
    answer_map = defaultdict(list)

    for question in questions:
        if 'answer' not in question or 'id' not in question or 'question' not in question:
            continue

        answer = question['answer']
        question_id = question['id']
        question_text = question['question']

        answer_map[answer].append({
            'id': question_id,
            'question': question_text
        })

    # Find duplicates (answers appearing more than once)
    duplicates = {answer: occurrences
                  for answer, occurrences in answer_map.items()
                  if len(occurrences) > 1}

    return {
        'file': file_path,
        'total_questions': len(questions),
        'unique_answers': len(answer_map),
        'duplicates': duplicates
    }


def format_results(results):
    """Format results for display."""
    if not results:
        return

    print(f"\nChecking: {results['file']}")
    print("=" * 50)
    print(f"Total questions: {results['total_questions']}")
    print(f"Unique answers: {results['unique_answers']}")

    duplicates = results['duplicates']

    if not duplicates:
        print("\n✓ No duplicate answers found!")
        return

    print(f"\nDuplicate answers found:")
    print("-" * 50)

    duplicate_question_count = 0
    for answer, occurrences in sorted(duplicates.items()):
        print(f"\n{answer} ({len(occurrences)} occurrences):")
        for occurrence in occurrences:
            print(f"  - ID {occurrence['id']}: {occurrence['question']}")
            duplicate_question_count += 1

    print(f"\nTotal duplicates: {duplicate_question_count} questions with {len(duplicates)} unique duplicate answers")


def main():
    if len(sys.argv) > 1:
        # Check specific file
        file_path = sys.argv[1]
        results = find_duplicates(file_path)
        format_results(results)
    else:
        # Check all kanji_grade*.json files in public/
        public_dir = Path('public')
        if not public_dir.exists():
            print("Error: public/ directory not found")
            sys.exit(1)

        kanji_files = sorted(public_dir.glob('kanji_grade*.json'))

        if not kanji_files:
            print("No kanji_grade*.json files found in public/")
            sys.exit(1)

        print(f"Found {len(kanji_files)} kanji test files")

        for file_path in kanji_files:
            results = find_duplicates(str(file_path))
            format_results(results)
            print()


if __name__ == '__main__':
    main()
