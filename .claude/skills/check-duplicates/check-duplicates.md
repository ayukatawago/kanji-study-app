---
name: check-duplicates
description: This skill should be used when the user asks to "check for duplicates in kanji files", "find duplicate answers", "check for duplicate answers in kanji test", "validate kanji test data", or mentions duplicate detection in kanji JSON files. Analyzes kanji test files to identify questions with identical answers.
version: 1.0.0
---

# Check Duplicates in Kanji Test Files

Analyze kanji test JSON files to identify questions that have duplicate answers. This ensures test quality by detecting when different questions accidentally share the same answer.

## Purpose

This skill helps maintain kanji test data integrity by:

- Detecting duplicate answers across questions
- Identifying potential test quality issues
- Ensuring each question has a unique answer

## When to Use

Use this skill when:

- User requests duplicate checking in kanji files
- Validating kanji test data quality
- After editing or adding new kanji questions
- Reviewing test file integrity

## How to Check for Duplicates

### Basic Workflow

1. **Run script and provide summary**: Execute the script and present a high-level summary
2. **Show details if needed**: Present detailed information when duplicates are found

### Running the Script

Use the Python utility script included with this skill for duplicate detection:

**Check all kanji files:**

```bash
cd /Users/taku/workspace/web/kanji-test-app
python .claude/skills/check-duplicates/scripts/check_duplicates.py
```

**Check specific file:**

```bash
python .claude/skills/check-duplicates/scripts/check_duplicates.py public/kanji_grade6.json
```

### Output Format

The script provides structured output:

1. **Summary section:**
   - File being checked
   - Total number of questions
   - Number of unique answers

2. **Duplicate details** (if found):
   - Each duplicate answer with occurrence count
   - Question ID and text for each occurrence
   - Total count of affected questions

### Example Output

```
Checking: public/kanji_grade6.json
==================================================
Total questions: 250
Unique answers: 246

Duplicate answers found:
--------------------------------------------------

体裁 (2 occurrences):
  - ID 27: <テイサイ>を気にする
  - ID 197: 必死に<テイサイ>をとりつくろう

歓声 (2 occurrences):
  - ID 71: <カンセイ>が湧き上がる会場
  - ID 139: <カンセイ>を呼ぶ名演技

Total duplicates: 4 questions with 2 unique duplicate answers
```

## Presenting Results to User

### If No Duplicates Found

Present a clean, positive message:

```
Checked public/kanji_grade6.json:
✓ No duplicate answers found (250 questions, 250 unique answers)
```

### If Duplicates Found

1. **Start with summary:**

   ```
   Checked public/kanji_grade6.json:
   Found 4 questions with 2 unique duplicate answers (250 total questions)
   ```

2. **Show details:**
   - List each duplicate answer
   - Include question IDs and text
   - Format clearly for readability

3. **Offer next steps:**
   - Ask if user wants to review/fix duplicates
   - Suggest which questions might need adjustment

## File Format

Kanji test files should have this structure:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Question text with <placeholder>",
      "answer": "答え"
    }
  ]
}
```

The script validates this structure and reports errors if format is incorrect.

## Additional Resources

### Scripts

- **`scripts/check_duplicates.py`** - Python utility for duplicate detection
  - Can check single file or all kanji_grade\*.json files
  - Provides formatted output with detailed information
  - Handles JSON parsing errors gracefully

## Notes

- Be thorough in checking all questions
- Provide clear, actionable output
- Present summary first, then details if duplicates exist
- Duplicate answers may be intentional in some cases (ask user if unclear)
