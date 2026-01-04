/**
 * FSRS Storage Utility
 * Manages user learning data in localStorage using FSRS algorithm
 */

import { Card, createEmptyCard, Rating, State } from "ts-fsrs";

// Storage keys
const STORAGE_KEYS = {
  CARDS: "kanji_fsrs_cards",
  REVIEWS: "kanji_reviews",
  VERSION: "kanji_data_version",
} as const;

const CURRENT_VERSION = "1.0";

/**
 * Card data structure for a single kanji question
 * Extends FSRS Card with our custom properties
 */
export interface KanjiCard {
  // Question identifiers
  questionId: number;
  grade: number; // 3 or 6

  // FSRS card data
  card: Card;

  // Metadata
  firstReviewedAt?: string; // ISO timestamp
  lastReviewedAt?: string; // ISO timestamp
  totalReviews: number;
}

/**
 * Review log entry for a single review session
 */
export interface ReviewLog {
  id: string; // Unique review session ID
  questionId: number;
  grade: number;
  rating: Rating; // 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
  timestamp: string; // ISO timestamp

  // User's answer data
  userAnswer?: string; // What user typed (optional)
  isCorrect: boolean; // Whether the answer was correct

  // FSRS state at time of review
  state: State;
  stability: number;
  difficulty: number;

  // Scheduling info
  scheduledDays: number; // Days until next review
  nextReviewDate: string; // ISO timestamp
}

/**
 * Statistics summary for display
 */
export interface ReviewStatistics {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;

  totalReviews: number;
  correctReviews: number;
  successRate: number;

  dueToday: number;
  dueThisWeek: number;

  streakDays: number;
  lastReviewDate?: string;
}

/**
 * Initialize storage with default data
 */
export function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const version = localStorage.getItem(STORAGE_KEYS.VERSION);

  if (!version || version !== CURRENT_VERSION) {
    // Initialize or migrate data
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);

    if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
    }
  }
}

/**
 * Get or create a card for a question
 */
export function getOrCreateCard(questionId: number, grade: number): KanjiCard {
  if (typeof window === "undefined") {
    return createNewCard(questionId, grade);
  }

  const cards = getAllCards();
  const key = `${grade}-${questionId}`;

  if (cards[key]) {
    return cards[key];
  }

  return createNewCard(questionId, grade);
}

/**
 * Create a new card for a question
 */
function createNewCard(questionId: number, grade: number): KanjiCard {
  return {
    questionId,
    grade,
    card: createEmptyCard(),
    totalReviews: 0,
  };
}

/**
 * Get all cards from storage
 */
export function getAllCards(): Record<string, KanjiCard> {
  if (typeof window === "undefined") return {};

  const data = localStorage.getItem(STORAGE_KEYS.CARDS);
  if (!data) return {};

  try {
    const parsed = JSON.parse(data);
    // Convert stored card data back to Card objects
    Object.keys(parsed).forEach((key) => {
      if (parsed[key].card) {
        parsed[key].card = { ...parsed[key].card };
      }
    });
    return parsed;
  } catch (error) {
    console.error("Error parsing cards from localStorage:", error);
    return {};
  }
}

/**
 * Save a card to storage
 */
export function saveCard(card: KanjiCard): void {
  if (typeof window === "undefined") return;

  const cards = getAllCards();
  const key = `${card.grade}-${card.questionId}`;
  cards[key] = card;

  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
}

/**
 * Save multiple cards at once
 */
export function saveCards(cardsToSave: KanjiCard[]): void {
  if (typeof window === "undefined") return;

  const cards = getAllCards();

  cardsToSave.forEach((card) => {
    const key = `${card.grade}-${card.questionId}`;
    cards[key] = card;
  });

  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
}

/**
 * Get all review logs
 */
export function getAllReviews(): ReviewLog[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing reviews from localStorage:", error);
    return [];
  }
}

/**
 * Add a new review log
 */
export function addReviewLog(log: ReviewLog): void {
  if (typeof window === "undefined") return;

  const reviews = getAllReviews();
  reviews.push(log);

  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

/**
 * Get review logs for a specific question
 */
export function getQuestionReviews(
  questionId: number,
  grade: number
): ReviewLog[] {
  return getAllReviews().filter(
    (review) => review.questionId === questionId && review.grade === grade
  );
}

/**
 * Get review statistics
 */
export function getReviewStatistics(grade?: number): ReviewStatistics {
  const cards = getAllCards();
  const reviews = getAllReviews();

  // Filter by grade if specified
  const filteredCards = grade
    ? Object.values(cards).filter((c) => c.grade === grade)
    : Object.values(cards);

  const filteredReviews = grade
    ? reviews.filter((r) => r.grade === grade)
    : reviews;

  // Count cards by state
  const newCards = filteredCards.filter(
    (c) => c.card.state === State.New
  ).length;
  const learningCards = filteredCards.filter(
    (c) => c.card.state === State.Learning || c.card.state === State.Relearning
  ).length;
  const reviewCards = filteredCards.filter(
    (c) => c.card.state === State.Review
  ).length;

  // Calculate success rate
  const correctReviews = filteredReviews.filter((r) => r.isCorrect).length;
  const successRate =
    filteredReviews.length > 0
      ? (correctReviews / filteredReviews.length) * 100
      : 0;

  // Count due cards
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const dueToday = filteredCards.filter((c) => {
    const dueDate = new Date(c.card.due);
    return dueDate <= today;
  }).length;

  const dueThisWeek = filteredCards.filter((c) => {
    const dueDate = new Date(c.card.due);
    return dueDate <= weekFromNow;
  }).length;

  // Calculate streak
  const streakDays = calculateStreakDays(filteredReviews);
  const lastReview =
    filteredReviews.length > 0
      ? filteredReviews[filteredReviews.length - 1].timestamp
      : undefined;

  return {
    totalCards: filteredCards.length,
    newCards,
    learningCards,
    reviewCards,
    totalReviews: filteredReviews.length,
    correctReviews,
    successRate,
    dueToday,
    dueThisWeek,
    streakDays,
    lastReviewDate: lastReview,
  };
}

/**
 * Calculate consecutive days with reviews
 */
function calculateStreakDays(reviews: ReviewLog[]): number {
  if (reviews.length === 0) return 0;

  // Sort reviews by timestamp (newest first)
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < sortedReviews.length; i++) {
    const reviewDate = new Date(sortedReviews[i].timestamp);
    reviewDate.setHours(0, 0, 0, 0);

    if (reviewDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (reviewDate.getTime() < currentDate.getTime()) {
      // Gap in reviews, streak broken
      break;
    }
  }

  return streak;
}

/**
 * Clear all data (for testing/reset)
 */
export function clearAllData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEYS.CARDS);
  localStorage.removeItem(STORAGE_KEYS.REVIEWS);
  localStorage.removeItem(STORAGE_KEYS.VERSION);
}

/**
 * Export data for backup
 */
export function exportData(): string {
  const cards = getAllCards();
  const reviews = getAllReviews();

  return JSON.stringify(
    {
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      cards,
      reviews,
    },
    null,
    2
  );
}

/**
 * Import data from backup
 */
export function importData(jsonData: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const data = JSON.parse(jsonData);

    if (!data.cards || !data.reviews) {
      throw new Error("Invalid data format");
    }

    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(data.cards));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(data.reviews));
    localStorage.setItem(STORAGE_KEYS.VERSION, data.version || CURRENT_VERSION);

    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
}
