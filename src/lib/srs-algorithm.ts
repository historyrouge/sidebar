
export interface CardReview {
  cardId: string;
  difficulty: 0 | 1 | 2 | 3 | 4 | 5; // 0=again, 5=perfect
  timestamp: number;
}

export interface CardSchedule {
  cardId: string;
  interval: number; // days until next review
  easeFactor: number; // 1.3 - 2.5
  repetitions: number;
  nextReviewDate: number; // timestamp
}

// SM-2 Algorithm implementation
export function calculateNextReview(
  currentSchedule: CardSchedule | null,
  review: CardReview
): CardSchedule {
  
  if (!currentSchedule || review.difficulty < 3) {
    // If the answer is incorrect or the card is new, reset the schedule
    return {
      cardId: review.cardId,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 1,
      nextReviewDate: Date.now() + 24 * 60 * 60 * 1000 // 1 day from now
    };
  }
  
  let newRepetitions: number;
  let newEaseFactor: number;
  let newInterval: number;

  if (currentSchedule.repetitions === 0) {
    newInterval = 1;
    newRepetitions = 1;
  } else if (currentSchedule.repetitions === 1) {
    newInterval = 6;
    newRepetitions = 2;
  } else {
    newInterval = Math.round(currentSchedule.interval * currentSchedule.easeFactor);
    newRepetitions = currentSchedule.repetitions + 1;
  }

  // Adjust ease factor
  newEaseFactor = currentSchedule.easeFactor + (0.1 - (5 - review.difficulty) * (0.08 + (5 - review.difficulty) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const nextReviewDate = Date.now() + newInterval * millisecondsInDay;

  return {
    cardId: review.cardId,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate: nextReviewDate
  };
}

    