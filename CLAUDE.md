# Kanji Test App - Next.js Project

## Project Overview

- **Framework**: Next.js 16
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS v4
- **Code Formatting**: Prettier
- **Dev Server Port**: 3000 (preferred)

## Development Commands

### Package Management

```bash
pnpm install              # Install dependencies
pnpm add <package>        # Add new dependency
pnpm add -D <package>     # Add dev dependency
```

### Development

```bash
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run start            # Start production server
pnpm run clean            # Remove build artifacts and caches
```

### Code Quality

```bash
pnpm run lint             # Run ESLint (deprecated in Next.js 16)
pnpm run lint:fix         # Fix ESLint issues
pnpm run format           # Format code with Prettier
pnpm run format:check     # Check code formatting
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                     # Root page — grade selection and test launch
│   ├── globals.css
│   └── components/
│       ├── KanjiTest.tsx            # Test runner (grid + flashcard modes)
│       ├── QuestionSelector.tsx     # Question selection with FSRS / manual toggle
│       ├── FlashCard.tsx            # Flashcard with flip animation
│       ├── TestGrid.tsx             # Grid layout for multi-question view
│       ├── ReviewStats.tsx          # Stats dashboard
│       ├── AnswerPopup.tsx
│       ├── Header.tsx
│       ├── QuestionItem.tsx
│       ├── Question.tsx
│       ├── AnswerBox.tsx
│       └── SettingsModal.tsx
└── lib/
    ├── fsrsScheduler.ts             # FSRS scheduling logic
    └── fsrsStorage.ts               # localStorage adapter for cards and reviews

public/
├── kanji_grade3.json
├── kanji_grade6.json
└── kanji_grade7.json
```

## Development Notes

- Use Next.js App Router architecture
- Follow React Server Components patterns
- Use Tailwind CSS v4 for styling
- Format code with Prettier before committing
- Port 3000 is preferred for development server
- All learning state is persisted in localStorage (no backend)
- FSRS scheduling via `ts-fsrs` — see `src/lib/fsrsScheduler.ts`

## Playwright

When using Playwright MCP to take screenshots, always save them inside `.playwright-mcp/` so they stay out of git (the directory is gitignored). Example path: `.playwright-mcp/my-screenshot.png`.
