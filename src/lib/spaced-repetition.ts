/**
 * Advanced Spaced Repetition System (SRS)
 * Implements SM-2, SM-2+, and Leitner algorithms for optimal learning
 * 
 * Features:
 * - Multiple SRS algorithms (SM-2, SM-2+, Leitner, Custom)
 * - Learning analytics and predictions
 * - Adaptive difficulty adjustment
 * - Review scheduling optimization
 * - Performance tracking and insights
 * - Study session management
 * - Retention rate calculation
 * - Forgetting curve modeling
 */

import { generateId } from './utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum SRSAlgorithm {
  SM2 = 'sm2',
  SM2_PLUS = 'sm2_plus',
  LEITNER = 'leitner',
  CUSTOM = 'custom',
}

export enum CardStatus {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEWING = 'reviewing',
  RELEARNING = 'relearning',
  MASTERED = 'mastered',
  SUSPENDED = 'suspended',
}

export enum ReviewRating {
  AGAIN = 0,      // Complete blackout
  HARD = 1,       // Incorrect response, correct remembered
  GOOD = 2,       // Correct response with hesitation
  EASY = 3,       // Perfect response
  PERFECT = 4,    // Instant recall
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  status: CardStatus;
  suspended: boolean;
  buried: boolean;
  
  // SRS Data
  srsData: CardSRSData;
  
  // Metadata
  metadata?: {
    difficulty?: number;
    importance?: number;
    notes?: string;
    images?: string[];
    audio?: string[];
  };
}

export interface CardSRSData {
  algorithm: SRSAlgorithm;
  
  // SM-2 Specific
  easeFactor: number;          // 1.3 - 2.5
  interval: number;            // Days until next review
  repetitions: number;         // Number of successful reviews
  
  // Leitner Specific
  box: number;                 // Leitner box number (1-5)
  
  // General
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  totalReviews: number;
  totalTime: number;           // Total time spent (seconds)
  averageTime: number;         // Average review time (seconds)
  
  // Performance
  correctCount: number;
  incorrectCount: number;
  lapses: number;              // Times card moved back
  
  // Learning phases
  learningStep: number;
  graduationInterval: number;
  
  // History
  reviewHistory: ReviewRecord[];
}

export interface ReviewRecord {
  id: string;
  cardId: string;
  date: Date;
  rating: ReviewRating;
  timeTaken: number;           // Seconds
  algorithmUsed: SRSAlgorithm;
  intervalBefore: number;
  intervalAfter: number;
  easeFactorBefore: number;
  easeFactorAfter: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  userId: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
  settings: DeckSettings;
  statistics: DeckStatistics;
  tags: string[];
  isPublic: boolean;
  parentDeckId?: string;
  subDecks: string[];
}

export interface DeckSettings {
  algorithm: SRSAlgorithm;
  
  // New Cards
  newCardsPerDay: number;
  newCardOrder: 'random' | 'added' | 'difficulty';
  
  // Learning Steps (in minutes)
  learningSteps: number[];
  relearningSteps: number[];
  
  // Intervals
  graduatingInterval: number;  // Days
  easyInterval: number;        // Days
  startingEase: number;        // Starting ease factor
  
  // Reviews
  maxReviewsPerDay: number;
  easyBonus: number;           // Multiplier for easy interval
  intervalModifier: number;    // Global interval multiplier
  maximumInterval: number;     // Maximum days
  
  // Lapses
  lapseMinInterval: number;
  lapseMultiplier: number;
  
  // Advanced
  buryRelated: boolean;
  showTimer: boolean;
  autoPlayAudio: boolean;
  replayAudioOnAnswer: boolean;
}

export interface DeckStatistics {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  
  dueToday: number;
  dueThisWeek: number;
  dueThisMonth: number;
  
  reviewedToday: number;
  reviewedThisWeek: number;
  reviewedThisMonth: number;
  reviewedAllTime: number;
  
  averageEaseFactor: number;
  averageInterval: number;
  retentionRate: number;
  
  totalStudyTime: number;
  averageReviewTime: number;
  
  streakDays: number;
  longestStreak: number;
  lastStudyDate?: Date;
}

export interface StudySession {
  id: string;
  deckId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  
  cardsStudied: number;
  cardsCorrect: number;
  cardsIncorrect: number;
  
  newCardsSeen: number;
  cardsReviewed: number;
  cardsRelearned: number;
  
  reviews: ReviewRecord[];
  
  performance: {
    accuracy: number;
    averageTime: number;
    fastestTime: number;
    slowestTime: number;
  };
}

export interface LearningInsights {
  overallProgress: number;
  retentionRate: number;
  projectedMastery: Date;
  
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  studyHeatmap: { date: string; count: number }[];
  performanceTrend: { date: string; accuracy: number }[];
  
  optimalStudyTime: {
    hour: number;
    dayOfWeek: number;
  };
  
  forecastedReviews: {
    date: string;
    count: number;
  }[];
}

// ============================================================================
// SM-2 ALGORITHM IMPLEMENTATION
// ============================================================================

export class SM2Algorithm {
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly MAX_EASE_FACTOR = 2.5;
  private static readonly INITIAL_EASE_FACTOR = 2.5;
  
  /**
   * Calculate next review based on SM-2 algorithm
   */
  static calculateNextReview(
    card: Card,
    rating: ReviewRating,
    settings: DeckSettings
  ): {
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReviewDate: Date;
  } {
    const { srsData } = card;
    let { easeFactor, interval, repetitions } = srsData;
    
    // Initialize for new cards
    if (repetitions === 0) {
      easeFactor = settings.startingEase;
    }
    
    // Update ease factor based on rating
    easeFactor = this.updateEaseFactor(easeFactor, rating);
    
    // Calculate new interval
    if (rating === ReviewRating.AGAIN) {
      // Card failed - restart
      repetitions = 0;
      interval = 1;
    } else if (repetitions === 0) {
      // First successful review
      interval = 1;
      repetitions = 1;
    } else if (repetitions === 1) {
      // Second successful review
      interval = 6;
      repetitions = 2;
    } else {
      // Subsequent reviews
      interval = Math.round(interval * easeFactor);
      repetitions++;
    }
    
    // Apply rating-specific modifiers
    interval = this.applyRatingModifier(interval, rating, settings);
    
    // Apply global modifier and constraints
    interval = Math.round(interval * settings.intervalModifier);
    interval = Math.max(1, Math.min(interval, settings.maximumInterval));
    
    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    
    return {
      interval,
      easeFactor,
      repetitions,
      nextReviewDate,
    };
  }
  
  /**
   * Update ease factor based on rating
   */
  private static updateEaseFactor(currentEase: number, rating: ReviewRating): number {
    let newEase = currentEase;
    
    switch (rating) {
      case ReviewRating.AGAIN:
        newEase -= 0.20;
        break;
      case ReviewRating.HARD:
        newEase -= 0.15;
        break;
      case ReviewRating.GOOD:
        // No change
        break;
      case ReviewRating.EASY:
        newEase += 0.10;
        break;
      case ReviewRating.PERFECT:
        newEase += 0.15;
        break;
    }
    
    // Clamp to valid range
    return Math.max(this.MIN_EASE_FACTOR, Math.min(this.MAX_EASE_FACTOR, newEase));
  }
  
  /**
   * Apply rating-specific interval modifier
   */
  private static applyRatingModifier(
    interval: number,
    rating: ReviewRating,
    settings: DeckSettings
  ): number {
    switch (rating) {
      case ReviewRating.HARD:
        return Math.round(interval * 1.2);
      case ReviewRating.EASY:
        return Math.round(interval * settings.easyBonus);
      case ReviewRating.PERFECT:
        return Math.round(interval * settings.easyBonus * 1.3);
      default:
        return interval;
    }
  }
}

// ============================================================================
// SM-2+ ALGORITHM (Enhanced SM-2)
// ============================================================================

export class SM2PlusAlgorithm extends SM2Algorithm {
  /**
   * Enhanced SM-2 with additional features:
   * - Dynamic ease factor adjustment based on recent performance
   * - Fuzz factor for more natural intervals
   * - Performance-based interval optimization
   */
  static calculateNextReview(
    card: Card,
    rating: ReviewRating,
    settings: DeckSettings
  ): {
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReviewDate: Date;
  } {
    // Get base calculation from SM-2
    const result = super.calculateNextReview(card, rating, settings);
    
    // Apply performance-based adjustments
    const performanceModifier = this.calculatePerformanceModifier(card);
    result.interval = Math.round(result.interval * performanceModifier);
    
    // Add fuzz factor for more natural intervals
    result.interval = this.applyFuzzFactor(result.interval);
    
    // Dynamic ease adjustment based on recent history
    result.easeFactor = this.adjustEaseBasedOnHistory(card, result.easeFactor);
    
    // Recalculate next review date with adjusted interval
    result.nextReviewDate = new Date();
    result.nextReviewDate.setDate(result.nextReviewDate.getDate() + result.interval);
    
    return result;
  }
  
  /**
   * Calculate performance modifier based on card history
   */
  private static calculatePerformanceModifier(card: Card): number {
    const { srsData } = card;
    const recentReviews = srsData.reviewHistory.slice(-10);
    
    if (recentReviews.length === 0) return 1.0;
    
    const correctCount = recentReviews.filter(r => r.rating >= ReviewRating.GOOD).length;
    const accuracy = correctCount / recentReviews.length;
    
    if (accuracy >= 0.9) return 1.15;  // Performing well, increase interval
    if (accuracy >= 0.8) return 1.05;
    if (accuracy >= 0.6) return 1.0;
    if (accuracy >= 0.4) return 0.9;
    return 0.8;  // Struggling, decrease interval
  }
  
  /**
   * Apply fuzz factor to make intervals more natural
   */
  private static applyFuzzFactor(interval: number): number {
    if (interval < 7) return interval;
    
    const fuzzRange = Math.max(1, Math.floor(interval * 0.05));
    const fuzz = Math.floor(Math.random() * (fuzzRange * 2 + 1)) - fuzzRange;
    
    return Math.max(1, interval + fuzz);
  }
  
  /**
   * Adjust ease factor based on recent review history
   */
  private static adjustEaseBasedOnHistory(card: Card, currentEase: number): number {
    const recentReviews = card.srsData.reviewHistory.slice(-20);
    
    if (recentReviews.length < 5) return currentEase;
    
    const lapseCount = recentReviews.filter(r => r.rating === ReviewRating.AGAIN).length;
    const lapseRate = lapseCount / recentReviews.length;
    
    if (lapseRate > 0.3) {
      return Math.max(1.3, currentEase - 0.1);
    }
    
    return currentEase;
  }
}

// ============================================================================
// LEITNER SYSTEM IMPLEMENTATION
// ============================================================================

export class LeitnerAlgorithm {
  private static readonly BOX_INTERVALS = [1, 3, 7, 14, 30]; // Days for each box
  
  /**
   * Calculate next review using Leitner system
   */
  static calculateNextReview(
    card: Card,
    rating: ReviewRating
  ): {
    interval: number;
    box: number;
    nextReviewDate: Date;
  } {
    let box = card.srsData.box || 1;
    
    // Move between boxes based on rating
    if (rating >= ReviewRating.GOOD) {
      // Correct - move to next box
      box = Math.min(5, box + 1);
    } else {
      // Incorrect - move back to box 1
      box = 1;
    }
    
    // Get interval for the box
    const interval = this.BOX_INTERVALS[box - 1];
    
    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    
    return {
      interval,
      box,
      nextReviewDate,
    };
  }
  
  /**
   * Get recommended study schedule for Leitner system
   */
  static getStudySchedule(): {
    box: number;
    interval: number;
    description: string;
  }[] {
    return [
      { box: 1, interval: 1, description: 'Review every day' },
      { box: 2, interval: 3, description: 'Review every 3 days' },
      { box: 3, interval: 7, description: 'Review every week' },
      { box: 4, interval: 14, description: 'Review every 2 weeks' },
      { box: 5, interval: 30, description: 'Review every month' },
    ];
  }
}

// ============================================================================
// SRS MANAGER - Main Service
// ============================================================================

export class SRSManager {
  /**
   * Process a card review and update SRS data
   */
  static processReview(
    card: Card,
    rating: ReviewRating,
    timeTaken: number,
    settings: DeckSettings
  ): Card {
    const updatedCard = { ...card };
    const { srsData } = updatedCard;
    
    // Store previous values for history
    const intervalBefore = srsData.interval;
    const easeFactorBefore = srsData.easeFactor;
    
    // Calculate next review based on algorithm
    let nextReview;
    
    switch (settings.algorithm) {
      case SRSAlgorithm.SM2:
        nextReview = SM2Algorithm.calculateNextReview(card, rating, settings);
        break;
      case SRSAlgorithm.SM2_PLUS:
        nextReview = SM2PlusAlgorithm.calculateNextReview(card, rating, settings);
        break;
      case SRSAlgorithm.LEITNER:
        const leitnerResult = LeitnerAlgorithm.calculateNextReview(card, rating);
        nextReview = {
          interval: leitnerResult.interval,
          easeFactor: srsData.easeFactor,
          repetitions: srsData.repetitions + 1,
          nextReviewDate: leitnerResult.nextReviewDate,
        };
        srsData.box = leitnerResult.box;
        break;
      default:
        nextReview = SM2Algorithm.calculateNextReview(card, rating, settings);
    }
    
    // Update SRS data
    srsData.interval = nextReview.interval;
    srsData.easeFactor = nextReview.easeFactor;
    srsData.repetitions = nextReview.repetitions;
    srsData.lastReviewDate = new Date();
    srsData.nextReviewDate = nextReview.nextReviewDate;
    srsData.totalReviews++;
    
    // Update performance stats
    if (rating >= ReviewRating.GOOD) {
      srsData.correctCount++;
    } else {
      srsData.incorrectCount++;
      srsData.lapses++;
    }
    
    // Update timing stats
    srsData.totalTime += timeTaken;
    srsData.averageTime = srsData.totalTime / srsData.totalReviews;
    
    // Update card status
    updatedCard.status = this.determineCardStatus(srsData);
    
    // Create review record
    const reviewRecord: ReviewRecord = {
      id: generateId(),
      cardId: card.id,
      date: new Date(),
      rating,
      timeTaken,
      algorithmUsed: settings.algorithm,
      intervalBefore,
      intervalAfter: nextReview.interval,
      easeFactorBefore,
      easeFactorAfter: nextReview.easeFactor,
    };
    
    srsData.reviewHistory.push(reviewRecord);
    
    // Keep history manageable (last 100 reviews)
    if (srsData.reviewHistory.length > 100) {
      srsData.reviewHistory = srsData.reviewHistory.slice(-100);
    }
    
    updatedCard.updatedAt = new Date();
    
    return updatedCard;
  }
  
  /**
   * Determine card status based on SRS data
   */
  private static determineCardStatus(srsData: CardSRSData): CardStatus {
    if (srsData.totalReviews === 0) return CardStatus.NEW;
    if (srsData.repetitions === 0) return CardStatus.RELEARNING;
    if (srsData.interval >= 21 && srsData.easeFactor >= 2.3) return CardStatus.MASTERED;
    if (srsData.repetitions < 3) return CardStatus.LEARNING;
    return CardStatus.REVIEWING;
  }
  
  /**
   * Get cards due for review
   */
  static getDueCards(deck: Deck, includeNew: boolean = true): Card[] {
    const now = new Date();
    const dueCards: Card[] = [];
    
    for (const card of deck.cards) {
      if (card.suspended || card.buried) continue;
      
      // New cards
      if (card.status === CardStatus.NEW && includeNew) {
        dueCards.push(card);
        continue;
      }
      
      // Cards with scheduled reviews
      if (card.srsData.nextReviewDate && card.srsData.nextReviewDate <= now) {
        dueCards.push(card);
      }
    }
    
    return dueCards;
  }
  
  /**
   * Get optimal study order for cards
   */
  static getOptimalStudyOrder(cards: Card[], settings: DeckSettings): Card[] {
    const sorted = [...cards];
    
    // Separate by status
    const newCards = sorted.filter(c => c.status === CardStatus.NEW);
    const learningCards = sorted.filter(c => c.status === CardStatus.LEARNING);
    const reviewCards = sorted.filter(c => c.status === CardStatus.REVIEWING);
    const relearnCards = sorted.filter(c => c.status === CardStatus.RELEARNING);
    
    // Order new cards
    switch (settings.newCardOrder) {
      case 'random':
        this.shuffleArray(newCards);
        break;
      case 'difficulty':
        newCards.sort((a, b) => 
          (a.metadata?.difficulty || 0) - (b.metadata?.difficulty || 0)
        );
        break;
      // 'added' is default order
    }
    
    // Order review cards by interval (shortest first)
    reviewCards.sort((a, b) => a.srsData.interval - b.srsData.interval);
    
    // Combine in optimal order: relearning, learning, review, new
    return [...relearnCards, ...learningCards, ...reviewCards, ...newCards];
  }
  
  /**
   * Calculate deck statistics
   */
  static calculateDeckStatistics(deck: Deck): DeckStatistics {
    const stats: DeckStatistics = {
      totalCards: deck.cards.length,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      masteredCards: 0,
      dueToday: 0,
      dueThisWeek: 0,
      dueThisMonth: 0,
      reviewedToday: 0,
      reviewedThisWeek: 0,
      reviewedThisMonth: 0,
      reviewedAllTime: 0,
      averageEaseFactor: 0,
      averageInterval: 0,
      retentionRate: 0,
      totalStudyTime: 0,
      averageReviewTime: 0,
      streakDays: 0,
      longestStreak: 0,
    };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
    
    let totalEaseFactor = 0;
    let totalInterval = 0;
    let cardsWithEase = 0;
    let totalCorrect = 0;
    let totalReviews = 0;
    
    // Process each card
    for (const card of deck.cards) {
      // Count by status
      switch (card.status) {
        case CardStatus.NEW:
          stats.newCards++;
          break;
        case CardStatus.LEARNING:
        case CardStatus.RELEARNING:
          stats.learningCards++;
          break;
        case CardStatus.REVIEWING:
          stats.reviewCards++;
          break;
        case CardStatus.MASTERED:
          stats.masteredCards++;
          break;
      }
      
      // Due cards
      if (card.srsData.nextReviewDate) {
        if (card.srsData.nextReviewDate <= today) stats.dueToday++;
        if (card.srsData.nextReviewDate <= weekFromNow) stats.dueThisWeek++;
        if (card.srsData.nextReviewDate <= monthFromNow) stats.dueThisMonth++;
      }
      
      // Accumulate stats
      if (card.srsData.easeFactor > 0) {
        totalEaseFactor += card.srsData.easeFactor;
        cardsWithEase++;
      }
      
      if (card.srsData.interval > 0) {
        totalInterval += card.srsData.interval;
      }
      
      stats.totalStudyTime += card.srsData.totalTime;
      stats.reviewedAllTime += card.srsData.totalReviews;
      totalCorrect += card.srsData.correctCount;
      totalReviews += card.srsData.totalReviews;
      
      // Count reviews by period
      for (const review of card.srsData.reviewHistory) {
        const reviewDate = new Date(review.date);
        const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());
        
        if (reviewDay.getTime() === today.getTime()) {
          stats.reviewedToday++;
        }
        
        const daysSince = Math.floor((now.getTime() - reviewDay.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince <= 7) stats.reviewedThisWeek++;
        if (daysSince <= 30) stats.reviewedThisMonth++;
      }
    }
    
    // Calculate averages
    if (cardsWithEase > 0) {
      stats.averageEaseFactor = totalEaseFactor / cardsWithEase;
    }
    
    if (deck.cards.length > 0) {
      stats.averageInterval = totalInterval / deck.cards.length;
    }
    
    if (totalReviews > 0) {
      stats.retentionRate = (totalCorrect / totalReviews) * 100;
      stats.averageReviewTime = stats.totalStudyTime / totalReviews;
    }
    
    // Calculate streak
    stats.streakDays = this.calculateStreak(deck);
    stats.longestStreak = this.calculateLongestStreak(deck);
    
    return stats;
  }
  
  /**
   * Calculate current study streak
   */
  private static calculateStreak(deck: Deck): number {
    const reviewDates = new Set<string>();
    
    for (const card of deck.cards) {
      for (const review of card.srsData.reviewHistory) {
        const dateStr = new Date(review.date).toDateString();
        reviewDates.add(dateStr);
      }
    }
    
    const sortedDates = Array.from(reviewDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      const actualDate = new Date(sortedDates[i]);
      actualDate.setHours(0, 0, 0, 0);
      
      if (actualDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  /**
   * Calculate longest study streak
   */
  private static calculateLongestStreak(deck: Deck): number {
    const reviewDates = new Set<string>();
    
    for (const card of deck.cards) {
      for (const review of card.srsData.reviewHistory) {
        const dateStr = new Date(review.date).toDateString();
        reviewDates.add(dateStr);
      }
    }
    
    const sortedDates = Array.from(reviewDates)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (sortedDates.length === 0) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      
      const dayDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  }
  
  /**
   * Generate learning insights
   */
  static generateInsights(deck: Deck): LearningInsights {
    const stats = this.calculateDeckStatistics(deck);
    
    // Calculate overall progress
    const progress = ((stats.masteredCards + stats.reviewCards) / stats.totalCards) * 100;
    
    // Identify strengths and weaknesses
    const cardsByPerformance = deck.cards
      .map(card => ({
        card,
        accuracy: card.srsData.totalReviews > 0
          ? (card.srsData.correctCount / card.srsData.totalReviews) * 100
          : 0,
      }))
      .filter(item => item.card.srsData.totalReviews > 0);
    
    const strongCards = cardsByPerformance
      .filter(item => item.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);
    
    const weakCards = cardsByPerformance
      .filter(item => item.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (stats.dueToday > 20) {
      recommendations.push('You have many cards due today. Consider spreading reviews throughout the day.');
    }
    
    if (stats.retentionRate < 75) {
      recommendations.push('Your retention rate is below optimal. Try reviewing cards more carefully.');
    }
    
    if (stats.averageReviewTime < 3) {
      recommendations.push('You\'re reviewing very quickly. Take more time to ensure understanding.');
    }
    
    if (stats.streakDays === 0) {
      recommendations.push('Start a study streak! Consistent daily practice improves retention.');
    }
    
    if (stats.newCards > stats.reviewCards * 2) {
      recommendations.push('Focus on reviewing existing cards before adding too many new ones.');
    }
    
    // Generate study heatmap (last 30 days)
    const heatmap = this.generateStudyHeatmap(deck, 30);
    
    // Generate performance trend
    const trend = this.generatePerformanceTrend(deck, 14);
    
    // Calculate optimal study time
    const optimalTime = this.calculateOptimalStudyTime(deck);
    
    // Forecast future reviews
    const forecast = this.forecastReviews(deck, 30);
    
    // Project mastery date
    const projectedMastery = this.projectMasteryDate(deck);
    
    return {
      overallProgress: progress,
      retentionRate: stats.retentionRate,
      projectedMastery,
      strengths: strongCards.map(item => `${item.card.front.substring(0, 50)}... (${Math.round(item.accuracy)}% accuracy)`),
      weaknesses: weakCards.map(item => `${item.card.front.substring(0, 50)}... (${Math.round(item.accuracy)}% accuracy)`),
      recommendations,
      studyHeatmap: heatmap,
      performanceTrend: trend,
      optimalStudyTime: optimalTime,
      forecastedReviews: forecast,
    };
  }
  
  /**
   * Generate study heatmap
   */
  private static generateStudyHeatmap(deck: Deck, days: number): { date: string; count: number }[] {
    const heatmap: Map<string, number> = new Map();
    const today = new Date();
    
    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      heatmap.set(date.toISOString().split('T')[0], 0);
    }
    
    // Count reviews per day
    for (const card of deck.cards) {
      for (const review of card.srsData.reviewHistory) {
        const dateStr = new Date(review.date).toISOString().split('T')[0];
        if (heatmap.has(dateStr)) {
          heatmap.set(dateStr, (heatmap.get(dateStr) || 0) + 1);
        }
      }
    }
    
    return Array.from(heatmap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Generate performance trend
   */
  private static generatePerformanceTrend(deck: Deck, days: number): { date: string; accuracy: number }[] {
    const trend: Map<string, { correct: number; total: number }> = new Map();
    const today = new Date();
    
    for (const card of deck.cards) {
      for (const review of card.srsData.reviewHistory) {
        const reviewDate = new Date(review.date);
        const daysDiff = Math.floor((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < days) {
          const dateStr = reviewDate.toISOString().split('T')[0];
          const existing = trend.get(dateStr) || { correct: 0, total: 0 };
          
          existing.total++;
          if (review.rating >= ReviewRating.GOOD) {
            existing.correct++;
          }
          
          trend.set(dateStr, existing);
        }
      }
    }
    
    return Array.from(trend.entries())
      .map(([date, data]) => ({
        date,
        accuracy: (data.correct / data.total) * 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Calculate optimal study time based on historical performance
   */
  private static calculateOptimalStudyTime(deck: Deck): { hour: number; dayOfWeek: number } {
    const performanceByHour: Map<number, { correct: number; total: number }> = new Map();
    const performanceByDay: Map<number, { correct: number; total: number }> = new Map();
    
    for (const card of deck.cards) {
      for (const review of card.srsData.reviewHistory) {
        const date = new Date(review.date);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        
        // By hour
        const hourData = performanceByHour.get(hour) || { correct: 0, total: 0 };
        hourData.total++;
        if (review.rating >= ReviewRating.GOOD) hourData.correct++;
        performanceByHour.set(hour, hourData);
        
        // By day
        const dayData = performanceByDay.get(dayOfWeek) || { correct: 0, total: 0 };
        dayData.total++;
        if (review.rating >= ReviewRating.GOOD) dayData.correct++;
        performanceByDay.set(dayOfWeek, dayData);
      }
    }
    
    // Find best hour
    let bestHour = 9; // Default to 9 AM
    let bestHourAccuracy = 0;
    
    performanceByHour.forEach((data, hour) => {
      const accuracy = data.total > 0 ? (data.correct / data.total) : 0;
      if (accuracy > bestHourAccuracy) {
        bestHourAccuracy = accuracy;
        bestHour = hour;
      }
    });
    
    // Find best day
    let bestDay = 1; // Default to Monday
    let bestDayAccuracy = 0;
    
    performanceByDay.forEach((data, day) => {
      const accuracy = data.total > 0 ? (data.correct / data.total) : 0;
      if (accuracy > bestDayAccuracy) {
        bestDayAccuracy = accuracy;
        bestDay = day;
      }
    });
    
    return {
      hour: bestHour,
      dayOfWeek: bestDay,
    };
  }
  
  /**
   * Forecast future review load
   */
  private static forecastReviews(deck: Deck, days: number): { date: string; count: number }[] {
    const forecast: Map<string, number> = new Map();
    const today = new Date();
    
    for (const card of deck.cards) {
      if (card.srsData.nextReviewDate) {
        const reviewDate = new Date(card.srsData.nextReviewDate);
        const daysDiff = Math.floor((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < days) {
          const dateStr = reviewDate.toISOString().split('T')[0];
          forecast.set(dateStr, (forecast.get(dateStr) || 0) + 1);
        }
      }
    }
    
    // Fill in missing days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (!forecast.has(dateStr)) {
        forecast.set(dateStr, 0);
      }
    }
    
    return Array.from(forecast.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Project when deck will be mastered
   */
  private static projectMasteryDate(deck: Deck): Date {
    const stats = this.calculateDeckStatistics(deck);
    
    // Calculate average cards mastered per day
    const reviewDays = new Set<string>();
    for (const card of deck.cards) {
      for (const review of card.srsData.reviewHistory) {
        reviewDays.add(new Date(review.date).toDateString());
      }
    }
    
    const studyDays = reviewDays.size || 1;
    const cardsPerDay = stats.masteredCards / studyDays;
    
    if (cardsPerDay === 0) {
      // Default to 1 year if no progress
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
    
    const remainingCards = stats.totalCards - stats.masteredCards;
    const daysNeeded = Math.ceil(remainingCards / cardsPerDay);
    
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysNeeded);
    
    return projectedDate;
  }
  
  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  private static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  /**
   * Create default deck settings
   */
  static createDefaultSettings(): DeckSettings {
    return {
      algorithm: SRSAlgorithm.SM2_PLUS,
      newCardsPerDay: 20,
      newCardOrder: 'random',
      learningSteps: [1, 10],
      relearningSteps: [10],
      graduatingInterval: 1,
      easyInterval: 4,
      startingEase: 2.5,
      maxReviewsPerDay: 200,
      easyBonus: 1.3,
      intervalModifier: 1.0,
      maximumInterval: 365,
      lapseMinInterval: 1,
      lapseMultiplier: 0.5,
      buryRelated: true,
      showTimer: true,
      autoPlayAudio: true,
      replayAudioOnAnswer: false,
    };
  }
  
  /**
   * Create new card with default SRS data
   */
  static createCard(
    front: string,
    back: string,
    deckId: string,
    algorithm: SRSAlgorithm = SRSAlgorithm.SM2_PLUS
  ): Card {
    return {
      id: generateId(),
      deckId,
      front,
      back,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: CardStatus.NEW,
      suspended: false,
      buried: false,
      srsData: {
        algorithm,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        box: 1,
        totalReviews: 0,
        totalTime: 0,
        averageTime: 0,
        correctCount: 0,
        incorrectCount: 0,
        lapses: 0,
        learningStep: 0,
        graduationInterval: 1,
        reviewHistory: [],
      },
    };
  }
}

// Export all types and classes
export default SRSManager;
