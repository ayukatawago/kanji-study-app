/**
 * FSRS Scheduler
 * Handles scheduling logic using the FSRS algorithm
 */

import { FSRS, Grade, Rating, State } from "ts-fsrs";
import {
  KanjiCard,
  ReviewLog,
  getOrCreateCard,
  saveCard,
  addReviewLog,
  getAllCards,
} from "./fsrsStorage";

// Initialize FSRS with default parameters
const fsrs = new FSRS({});

/** Fisher-Yates shuffle (returns a new array) */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Record a review for a question
 * Returns the updated card and scheduling information
 */
export function recordReview(
  questionId: number,
  grade: number,
  rating: Rating,
  isCorrect: boolean,
  userAnswer?: string
): { card: KanjiCard; nextReviewDate: Date } {
  // Get or create the card
  const kanjiCard = getOrCreateCard(questionId, grade);

  // Schedule the card with FSRS
  const now = new Date();
  const schedulingCards = fsrs.repeat(kanjiCard.card, now);

  // Get the appropriate scheduling based on rating
  // The repeat method returns an object with keys 1-4 for Again, Hard, Good, Easy
  const selectedSchedule = schedulingCards[rating as Grade];

  // Update the card
  const updatedCard: KanjiCard = {
    ...kanjiCard,
    card: selectedSchedule.card,
    lastReviewedAt: now.toISOString(),
    firstReviewedAt: kanjiCard.firstReviewedAt || now.toISOString(),
    totalReviews: kanjiCard.totalReviews + 1,
  };

  // Save the updated card
  saveCard(updatedCard);

  // Create review log
  const reviewLog: ReviewLog = {
    id: `${questionId}-${grade}-${now.getTime()}`,
    questionId,
    grade,
    rating,
    timestamp: now.toISOString(),
    userAnswer,
    isCorrect,
    state: selectedSchedule.card.state,
    stability: selectedSchedule.card.stability,
    difficulty: selectedSchedule.card.difficulty,
    scheduledDays: selectedSchedule.card.scheduled_days,
    nextReviewDate: selectedSchedule.card.due.toISOString(),
  };

  // Save the review log
  addReviewLog(reviewLog);

  return {
    card: updatedCard,
    nextReviewDate: selectedSchedule.card.due,
  };
}

/**
 * Get questions that are due for review
 * Sorted by priority (most overdue first)
 */
export function getDueQuestions(
  grade?: number,
  limit?: number
): Array<{ questionId: number; grade: number; daysOverdue: number }> {
  const cards = getAllCards();
  const now = new Date();

  const dueCards = Object.values(cards)
    .filter((card) => {
      // Filter by grade if specified
      if (grade && card.grade !== grade) return false;

      // Check if card is due
      const dueDate = new Date(card.card.due);
      return dueDate <= now;
    })
    .map((card) => {
      const dueDate = new Date(card.card.due);
      const daysOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        questionId: card.questionId,
        grade: card.grade,
        daysOverdue,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue); // Most overdue first

  // Shuffle within each same-daysOverdue group so equal-priority items are random
  const randomized: typeof dueCards = [];
  let i = 0;
  while (i < dueCards.length) {
    let j = i + 1;
    while (
      j < dueCards.length &&
      dueCards[j].daysOverdue === dueCards[i].daysOverdue
    )
      j++;
    randomized.push(...shuffleArray(dueCards.slice(i, j)));
    i = j;
  }

  return limit ? randomized.slice(0, limit) : randomized;
}

/**
 * Get new questions (never reviewed)
 * Returns questions that don't have cards yet
 */
export function getNewQuestions(
  allQuestionIds: number[],
  grade: number,
  limit?: number
): number[] {
  const cards = getAllCards();

  const newQuestions = allQuestionIds.filter((qId) => {
    const key = `${grade}-${qId}`;
    return !cards[key] || cards[key].card.state === State.New;
  });

  // All new questions are at the same level — shuffle for variety
  const shuffled = shuffleArray(newQuestions);

  return limit ? shuffled.slice(0, limit) : shuffled;
}

/**
 * Get recommended questions for today's study session
 * Mix of due reviews and new questions
 */
export function getRecommendedQuestions(
  allQuestionIds: number[],
  grade: number,
  options: {
    maxReviews?: number;
    maxNew?: number;
    totalLimit?: number;
  } = {}
): number[] {
  const { maxReviews = 20, maxNew = 10, totalLimit = 20 } = options;

  // Get due questions (up to maxReviews)
  const allDueQuestions = getDueQuestions(grade);

  // IMPORTANT: Filter due questions to only include those in allQuestionIds
  // (this excludes any questions that have been marked as excluded)
  const allowedQuestionIds = new Set(allQuestionIds);
  const dueQuestionIds = allDueQuestions
    .map((q) => q.questionId)
    .filter((id) => allowedQuestionIds.has(id))
    .slice(0, maxReviews); // Apply limit after filtering

  // Calculate how many new questions we need to reach totalLimit
  const remainingSlots = Math.max(0, totalLimit - dueQuestionIds.length);
  const newQuestionsLimit = Math.min(maxNew, remainingSlots);

  // Get new questions to fill remaining slots
  const newQuestions = getNewQuestions(
    allQuestionIds,
    grade,
    newQuestionsLimit
  );

  return [...dueQuestionIds, ...newQuestions];
}

/**
 * Get card info for a question
 */
export function getCardInfo(questionId: number, grade: number) {
  const card = getOrCreateCard(questionId, grade);

  const now = new Date();
  const dueDate = new Date(card.card.due);
  const isDue = dueDate <= now;
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    card,
    isDue,
    daysUntilDue,
    isNew: card.card.state === State.New,
    state: card.card.state,
    stability: card.card.stability,
    difficulty: card.card.difficulty,
  };
}

/**
 * Convert user's correctness to FSRS Rating
 * This is a helper function to map boolean correctness to Rating
 */
export function mapCorrectnessToRating(
  isCorrect: boolean,
  confidence: "low" | "medium" | "high" = "medium"
): Rating {
  if (!isCorrect) {
    return Rating.Again; // Wrong answer
  }

  // Correct answer - map confidence to rating
  switch (confidence) {
    case "low":
      return Rating.Hard; // Correct but struggled
    case "medium":
      return Rating.Good; // Correct with normal effort
    case "high":
      return Rating.Easy; // Correct and very confident
    default:
      return Rating.Good;
  }
}

/**
 * Get study statistics for display
 */
export function getStudyStats(grade?: number) {
  const cards = getAllCards();
  const filteredCards = grade
    ? Object.values(cards).filter((c) => c.grade === grade)
    : Object.values(cards);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dueToday = filteredCards.filter(
    (c) => new Date(c.card.due) <= today
  ).length;
  const newCards = filteredCards.filter(
    (c) => c.card.state === State.New
  ).length;
  const learning = filteredCards.filter(
    (c) => c.card.state === State.Learning || c.card.state === State.Relearning
  ).length;
  const review = filteredCards.filter(
    (c) => c.card.state === State.Review
  ).length;

  return {
    dueToday,
    newCards,
    learning,
    review,
    total: filteredCards.length,
  };
}
