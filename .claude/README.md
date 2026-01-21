# Kanji Test Tools Plugin

Tools for managing and validating kanji test files in this Next.js application.

## Features

- **check-duplicates**: Find duplicate answers across kanji test JSON files

## Installation

This plugin is already installed in the `.claude/` directory of this project.

## Usage

### Check for Duplicates

Ask Claude to check for duplicates in your kanji files:

```
Check for duplicates in kanji files
```

You can also specify a specific file:

```
Check for duplicates in public/kanji_grade6.json
```

## Components

### Skills

- `check-duplicates`: Analyzes kanji test JSON files to find questions with duplicate answers

### Scripts

- `check_duplicates.py`: Python utility for detecting duplicate answers in kanji test files
