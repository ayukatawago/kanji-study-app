# Kanji Test App - Next.js Project

## Project Overview

- **Framework**: Next.js 15
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
├── app/                  # App Router directory
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
```

## Development Notes

- Use Next.js App Router architecture
- Follow React Server Components patterns
- Use Tailwind CSS v4 for styling
- Format code with Prettier before committing
- Port 3000 is preferred for development server
