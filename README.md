# Kanji Test App

A kanji learning and testing app built with Next.js. Supports spaced-repetition scheduling (FSRS) to surface due reviews and new questions, with both flashcard and printable grid test modes.

## Features

- **Grade levels**: 3年生, 6年生, 中1
- **FSRS scheduling**: Automatically selects due reviews and new questions based on learning progress
- **Test modes**: Flashcard (one question at a time) and grid (multiple questions per page)
- **Print support**: Grid mode renders across A4 landscape sheets
- **Manual selection**: Desktop users can hand-pick questions by group
- **Question exclusion**: Mark questions to skip in future FSRS recommendations
- **Study stats**: Due today, new, learning, and review counts with success rates
- **No backend**: All state persisted in localStorage

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **[ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)** — Free Spaced Repetition Scheduling algorithm

## Getting Started

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Root page — grade selection and test launch
│   └── components/
│       ├── KanjiTest.tsx        # Test runner (grid + flashcard modes)
│       ├── QuestionSelector.tsx # Question selection with FSRS / manual toggle
│       ├── FlashCard.tsx        # Flashcard with flip animation
│       ├── TestGrid.tsx         # Grid layout for multi-question view
│       └── ReviewStats.tsx      # Stats dashboard
└── lib/
    ├── fsrsScheduler.ts         # FSRS scheduling logic
    └── fsrsStorage.ts           # localStorage adapter for cards and reviews

public/
├── kanji_grade3.json
├── kanji_grade6.json
└── kanji_grade7.json
```

## Question Data Format

```json
{
  "groups": [
    {
      "groupId": 1,
      "questions": [
        { "id": 1, "question": "湖に紅葉した山が<うつる>", "answer": "映る" }
      ]
    }
  ]
}
```

The `<>` brackets mark the target word the user must write as kanji.

## How Question Selection Works

In FSRS mode, `getRecommendedQuestions()` fills the session in priority order:

1. **Due reviews** — questions past their scheduled review date (up to 30)
2. **New questions** — never-reviewed questions (up to 30)

The combined list is capped at 30. Excluded questions are filtered out before selection. Selected questions are shuffled with Fisher-Yates before the test starts.

## Development Commands

```bash
pnpm run dev          # Start dev server (port 3000)
pnpm run build        # Production build
pnpm run format       # Format with Prettier
pnpm run lint         # Run ESLint
pnpm run clean        # Remove build artifacts
```
