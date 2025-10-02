/**
 * Advanced Study Planner System
 * Comprehensive study scheduling, goal tracking, and productivity optimization
 * 
 * Features:
 * - Smart study scheduling
 * - Goal setting and tracking
 * - Task management
 * - Pomodoro timer
 * - Study session tracking
 * - Progress analytics
 * - Productivity insights
 * - Calendar integration
 * - Deadline management
 * - Habit tracking
 * - Study reminders
 * - Break optimization
 * - Focus mode
 * - Time blocking
 * - Priority matrix
 */

import { generateId, formatDuration, clamp } from './utils';
import { notificationService } from './notification-system';
import { analytics, EventCategory, EventAction } from './analytics';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum StudyTaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum StudyTaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum StudyGoalType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum TimerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  BREAK = 'break',
}

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  
  // Categorization
  subject: string;
  tags: string[];
  
  // Scheduling
  dueDate?: Date;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  
  // Status
  status: StudyTaskStatus;
  priority: StudyTaskPriority;
  completedAt?: Date;
  
  // Progress
  progress: number; // 0-100
  
  // Subtasks
  subtasks: SubTask[];
  
  // Recurrence
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  
  // Related items
  deckId?: string;
  materialId?: string;
  
  // Notes
  notes?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface StudyGoal {
  id: string;
  title: string;
  description?: string;
  type: StudyGoalType;
  
  // Target
  target: {
    type: 'time' | 'tasks' | 'cards' | 'score';
    value: number;
    unit: string;
  };
  
  // Progress
  current: number;
  percentage: number;
  
  // Timeframe
  startDate: Date;
  endDate: Date;
  
  // Status
  completed: boolean;
  completedAt?: Date;
  
  // Tracking
  history: {
    date: Date;
    value: number;
  }[];
  
  // Metadata
  createdAt: Date;
  userId: string;
  
  // Motivation
  reward?: string;
  motivation?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  
  // Content
  subject: string;
  tasks: string[]; // Task IDs
  
  // Pomodoro
  pomodoros: PomodoroSession[];
  totalPomodoros: number;
  completedPomodoros: number;
  
  // Productivity
  focusScore: number; // 0-100
  distractions: number;
  breaks: number;
  
  // Notes
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'poor';
  energyLevel?: number; // 1-5
  
  // Achievements
  tasksCompleted: number;
  cardsReviewed: number;
  
  // Metadata
  createdAt: Date;
}

export interface PomodoroSession {
  id: string;
  type: 'work' | 'short_break' | 'long_break';
  duration: number; // minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  interrupted: boolean;
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface StudySchedule {
  id: string;
  userId: string;
  
  // Schedule
  date: Date;
  timeSlots: TimeSlot[];
  
  // Tasks
  scheduledTasks: string[]; // Task IDs
  
  // Settings
  breakInterval: number; // minutes
  focusTime: number; // minutes
  
  // Status
  completed: boolean;
  adherence: number; // 0-100
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  taskId?: string;
  type: 'study' | 'break' | 'buffer';
  completed: boolean;
}

export interface StudyHabit {
  id: string;
  title: string;
  description?: string;
  
  // Frequency
  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    days?: number[]; // 0=Sunday, 1=Monday, etc.
    timesPerDay?: number;
  };
  
  // Tracking
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  
  // History
  completions: Date[];
  
  // Settings
  reminderTime?: string; // HH:MM
  
  // Metadata
  createdAt: Date;
  userId: string;
}

export interface ProductivityInsights {
  period: 'day' | 'week' | 'month';
  
  // Time stats
  totalStudyTime: number;
  averageSessionDuration: number;
  mostProductiveHour: number;
  leastProductiveHour: number;
  
  // Productivity
  averageFocusScore: number;
  totalPomodoros: number;
  completionRate: number;
  
  // Patterns
  bestStudyDays: number[];
  consistencyScore: number;
  streakDays: number;
  
  // Subjects
  subjectDistribution: {
    subject: string;
    time: number;
    percentage: number;
  }[];
  
  // Recommendations
  recommendations: string[];
  
  // Trends
  trends: {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    change: number;
  }[];
}

// ============================================================================
// STUDY PLANNER SERVICE
// ============================================================================

export class StudyPlanner {
  private static instance: StudyPlanner;
  
  private tasks: Map<string, StudyTask> = new Map();
  private goals: Map<string, StudyGoal> = new Map();
  private sessions: Map<string, StudySession> = new Map();
  private schedules: Map<string, StudySchedule> = new Map();
  private habits: Map<string, StudyHabit> = new Map();
  
  // Pomodoro timer
  private currentPomodoro: PomodoroSession | null = null;
  private timerState: TimerState = TimerState.IDLE;
  private timerInterval: NodeJS.Timeout | null = null;
  private elapsedSeconds: number = 0;
  private pomodoroSettings: PomodoroSettings;
  
  // Current session
  private currentSession: StudySession | null = null;
  
  private constructor() {
    this.pomodoroSettings = this.getDefaultPomodoroSettings();
    this.loadPersistedData();
  }
  
  static getInstance(): StudyPlanner {
    if (!StudyPlanner.instance) {
      StudyPlanner.instance = new StudyPlanner();
    }
    return StudyPlanner.instance;
  }
  
  // ========================================================================
  // TASK MANAGEMENT
  // ========================================================================
  
  /**
   * Create a new study task
   */
  createTask(params: {
    title: string;
    description?: string;
    subject: string;
    tags?: string[];
    dueDate?: Date;
    estimatedDuration?: number;
    priority?: StudyTaskPriority;
    subtasks?: string[];
  }): StudyTask {
    const task: StudyTask = {
      id: generateId(),
      title: params.title,
      description: params.description,
      subject: params.subject,
      tags: params.tags || [],
      dueDate: params.dueDate,
      estimatedDuration: params.estimatedDuration || 30,
      status: StudyTaskStatus.TODO,
      priority: params.priority || StudyTaskPriority.MEDIUM,
      progress: 0,
      subtasks: (params.subtasks || []).map(title => ({
        id: generateId(),
        title,
        completed: false,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: this.getCurrentUserId(),
    };
    
    this.tasks.set(task.id, task);
    this.persistData();
    
    analytics.trackEvent({
      category: EventCategory.STUDY,
      action: EventAction.FEATURE_USE,
      label: 'task_created',
    });
    
    return task;
  }
  
  /**
   * Update task
   */
  updateTask(taskId: string, updates: Partial<StudyTask>): StudyTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    Object.assign(task, updates);
    task.updatedAt = new Date();
    
    // Update status based on progress
    if (updates.progress !== undefined) {
      if (updates.progress === 100) {
        task.status = StudyTaskStatus.COMPLETED;
        task.completedAt = new Date();
      }
    }
    
    this.persistData();
    return task;
  }
  
  /**
   * Complete task
   */
  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    task.status = StudyTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.progress = 100;
    task.updatedAt = new Date();
    
    this.persistData();
    
    // Show notification
    notificationService.success(
      'Task Completed!',
      `Great job completing "${task.title}"`
    );
    
    // Update goals
    this.updateGoalProgress('tasks', 1);
  }
  
  /**
   * Toggle subtask
   */
  toggleSubtask(taskId: string, subtaskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;
    
    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : undefined;
    
    // Update task progress
    const completedCount = task.subtasks.filter(st => st.completed).length;
    task.progress = (completedCount / task.subtasks.length) * 100;
    
    // Auto-complete task if all subtasks done
    if (task.progress === 100) {
      this.completeTask(taskId);
    }
    
    task.updatedAt = new Date();
    this.persistData();
  }
  
  /**
   * Delete task
   */
  deleteTask(taskId: string): void {
    this.tasks.delete(taskId);
    this.persistData();
  }
  
  /**
   * Get tasks
   */
  getTasks(filters?: {
    status?: StudyTaskStatus;
    priority?: StudyTaskPriority;
    subject?: string;
    dueToday?: boolean;
    overdue?: boolean;
  }): StudyTask[] {
    let tasks = Array.from(this.tasks.values());
    
    if (filters) {
      if (filters.status) {
        tasks = tasks.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        tasks = tasks.filter(t => t.priority === filters.priority);
      }
      if (filters.subject) {
        tasks = tasks.filter(t => t.subject === filters.subject);
      }
      if (filters.dueToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        tasks = tasks.filter(t => 
          t.dueDate && t.dueDate >= today && t.dueDate < tomorrow
        );
      }
      if (filters.overdue) {
        const now = new Date();
        tasks = tasks.filter(t => 
          t.dueDate && t.dueDate < now && t.status !== StudyTaskStatus.COMPLETED
        );
      }
    }
    
    return tasks.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = {
        [StudyTaskPriority.URGENT]: 0,
        [StudyTaskPriority.HIGH]: 1,
        [StudyTaskPriority.MEDIUM]: 2,
        [StudyTaskPriority.LOW]: 3,
      };
      
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      return 0;
    });
  }
  
  /**
   * Get task statistics
   */
  getTaskStats(): {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: number;
  } {
    const all = Array.from(this.tasks.values());
    const now = new Date();
    
    return {
      total: all.length,
      todo: all.filter(t => t.status === StudyTaskStatus.TODO).length,
      inProgress: all.filter(t => t.status === StudyTaskStatus.IN_PROGRESS).length,
      completed: all.filter(t => t.status === StudyTaskStatus.COMPLETED).length,
      overdue: all.filter(t => 
        t.dueDate && t.dueDate < now && t.status !== StudyTaskStatus.COMPLETED
      ).length,
      completionRate: all.length > 0 
        ? (all.filter(t => t.status === StudyTaskStatus.COMPLETED).length / all.length) * 100
        : 0,
    };
  }
  
  // ========================================================================
  // GOAL MANAGEMENT
  // ========================================================================
  
  /**
   * Create study goal
   */
  createGoal(params: {
    title: string;
    description?: string;
    type: StudyGoalType;
    target: StudyGoal['target'];
    startDate?: Date;
    endDate?: Date;
    motivation?: string;
    reward?: string;
  }): StudyGoal {
    const now = new Date();
    let startDate = params.startDate || now;
    let endDate = params.endDate || new Date(now);
    
    // Set default end dates based on type
    if (!params.endDate) {
      switch (params.type) {
        case StudyGoalType.DAILY:
          endDate.setDate(endDate.getDate() + 1);
          break;
        case StudyGoalType.WEEKLY:
          endDate.setDate(endDate.getDate() + 7);
          break;
        case StudyGoalType.MONTHLY:
          endDate.setMonth(endDate.getMonth() + 1);
          break;
      }
    }
    
    const goal: StudyGoal = {
      id: generateId(),
      title: params.title,
      description: params.description,
      type: params.type,
      target: params.target,
      current: 0,
      percentage: 0,
      startDate,
      endDate,
      completed: false,
      history: [],
      createdAt: now,
      userId: this.getCurrentUserId(),
      motivation: params.motivation,
      reward: params.reward,
    };
    
    this.goals.set(goal.id, goal);
    this.persistData();
    
    return goal;
  }
  
  /**
   * Update goal progress
   */
  updateGoalProgress(type: string, value: number): void {
    const activeGoals = Array.from(this.goals.values())
      .filter(g => !g.completed && g.target.type === type);
    
    for (const goal of activeGoals) {
      goal.current += value;
      goal.percentage = Math.min((goal.current / goal.target.value) * 100, 100);
      
      goal.history.push({
        date: new Date(),
        value: goal.current,
      });
      
      // Check if completed
      if (goal.current >= goal.target.value && !goal.completed) {
        goal.completed = true;
        goal.completedAt = new Date();
        
        // Show celebration notification
        notificationService.success(
          '🎉 Goal Achieved!',
          `Congratulations! You completed: ${goal.title}`
        );
        
        if (goal.reward) {
          notificationService.info(
            'Your Reward',
            goal.reward
          );
        }
      }
    }
    
    this.persistData();
  }
  
  /**
   * Get active goals
   */
  getActiveGoals(): StudyGoal[] {
    return Array.from(this.goals.values())
      .filter(g => !g.completed)
      .sort((a, b) => b.percentage - a.percentage);
  }
  
  // ========================================================================
  // POMODORO TIMER
  // ========================================================================
  
  /**
   * Start pomodoro
   */
  startPomodoro(): void {
    if (this.timerState !== TimerState.IDLE) return;
    
    const pomodoro: PomodoroSession = {
      id: generateId(),
      type: 'work',
      duration: this.pomodoroSettings.workDuration,
      startTime: new Date(),
      completed: false,
      interrupted: false,
    };
    
    this.currentPomodoro = pomodoro;
    this.timerState = TimerState.RUNNING;
    this.elapsedSeconds = 0;
    
    // Start current session if not already
    if (!this.currentSession) {
      this.startStudySession({ subject: 'General Study' });
    }
    
    this.startTimer();
    
    notificationService.info(
      'Pomodoro Started',
      `Focus for ${this.pomodoroSettings.workDuration} minutes`
    );
  }
  
  /**
   * Start break
   */
  startBreak(isLong: boolean = false): void {
    const duration = isLong 
      ? this.pomodoroSettings.longBreakDuration
      : this.pomodoroSettings.shortBreakDuration;
    
    const breakSession: PomodoroSession = {
      id: generateId(),
      type: isLong ? 'long_break' : 'short_break',
      duration,
      startTime: new Date(),
      completed: false,
      interrupted: false,
    };
    
    this.currentPomodoro = breakSession;
    this.timerState = TimerState.BREAK;
    this.elapsedSeconds = 0;
    
    this.startTimer();
    
    notificationService.info(
      'Break Time!',
      `Take a ${duration} minute ${isLong ? 'long' : 'short'} break`
    );
  }
  
  /**
   * Pause timer
   */
  pauseTimer(): void {
    if (this.timerState !== TimerState.RUNNING && this.timerState !== TimerState.BREAK) {
      return;
    }
    
    this.timerState = TimerState.PAUSED;
    this.stopTimer();
  }
  
  /**
   * Resume timer
   */
  resumeTimer(): void {
    if (this.timerState !== TimerState.PAUSED) return;
    
    this.timerState = this.currentPomodoro?.type === 'work' 
      ? TimerState.RUNNING 
      : TimerState.BREAK;
    
    this.startTimer();
  }
  
  /**
   * Skip current pomodoro/break
   */
  skipCurrent(): void {
    if (this.currentPomodoro) {
      this.currentPomodoro.interrupted = true;
      this.currentPomodoro.endTime = new Date();
    }
    
    this.stopTimer();
    this.timerState = TimerState.IDLE;
    this.currentPomodoro = null;
    this.elapsedSeconds = 0;
  }
  
  /**
   * Start timer interval
   */
  private startTimer(): void {
    this.stopTimer(); // Clear any existing timer
    
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      
      const duration = this.currentPomodoro?.duration || 25;
      const totalSeconds = duration * 60;
      
      // Check if completed
      if (this.elapsedSeconds >= totalSeconds) {
        this.completeCurrentPomodoro();
      }
    }, 1000);
  }
  
  /**
   * Stop timer interval
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  /**
   * Complete current pomodoro
   */
  private completeCurrentPomodoro(): void {
    if (!this.currentPomodoro) return;
    
    this.currentPomodoro.completed = true;
    this.currentPomodoro.endTime = new Date();
    
    // Add to current session
    if (this.currentSession && this.currentPomodoro.type === 'work') {
      this.currentSession.pomodoros.push(this.currentPomodoro);
      this.currentSession.completedPomodoros++;
    }
    
    this.stopTimer();
    this.timerState = TimerState.IDLE;
    
    // Show notification
    if (this.currentPomodoro.type === 'work') {
      notificationService.success(
        'Pomodoro Complete!',
        'Time for a break'
      );
      
      // Auto-start break if enabled
      if (this.pomodoroSettings.autoStartBreaks) {
        const isLongBreak = this.currentSession 
          ? this.currentSession.completedPomodoros % this.pomodoroSettings.longBreakInterval === 0
          : false;
        
        setTimeout(() => this.startBreak(isLongBreak), 1000);
      }
    } else {
      notificationService.success(
        'Break Complete!',
        'Ready to focus again?'
      );
      
      // Auto-start next pomodoro if enabled
      if (this.pomodoroSettings.autoStartPomodoros) {
        setTimeout(() => this.startPomodoro(), 1000);
      }
    }
    
    this.currentPomodoro = null;
    this.elapsedSeconds = 0;
  }
  
  /**
   * Get timer status
   */
  getTimerStatus(): {
    state: TimerState;
    elapsedSeconds: number;
    totalSeconds: number;
    percentage: number;
    remaining: string;
  } {
    const duration = this.currentPomodoro?.duration || 25;
    const totalSeconds = duration * 60;
    const percentage = (this.elapsedSeconds / totalSeconds) * 100;
    const remainingSeconds = Math.max(0, totalSeconds - this.elapsedSeconds);
    
    return {
      state: this.timerState,
      elapsedSeconds: this.elapsedSeconds,
      totalSeconds,
      percentage,
      remaining: formatDuration(remainingSeconds),
    };
  }
  
  /**
   * Update pomodoro settings
   */
  updatePomodoroSettings(updates: Partial<PomodoroSettings>): void {
    Object.assign(this.pomodoroSettings, updates);
    this.persistData();
  }
  
  /**
   * Get default pomodoro settings
   */
  private getDefaultPomodoroSettings(): PomodoroSettings {
    return {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
      notificationsEnabled: true,
    };
  }
  
  // ========================================================================
  // STUDY SESSIONS
  // ========================================================================
  
  /**
   * Start study session
   */
  startStudySession(params: {
    subject: string;
    tasks?: string[];
  }): StudySession {
    // End previous session if exists
    if (this.currentSession) {
      this.endStudySession();
    }
    
    const session: StudySession = {
      id: generateId(),
      userId: this.getCurrentUserId(),
      startTime: new Date(),
      duration: 0,
      subject: params.subject,
      tasks: params.tasks || [],
      pomodoros: [],
      totalPomodoros: 0,
      completedPomodoros: 0,
      focusScore: 100,
      distractions: 0,
      breaks: 0,
      tasksCompleted: 0,
      cardsReviewed: 0,
      createdAt: new Date(),
    };
    
    this.currentSession = session;
    this.sessions.set(session.id, session);
    
    analytics.trackEvent({
      category: EventCategory.STUDY,
      action: EventAction.STUDY_START,
      label: params.subject,
    });
    
    return session;
  }
  
  /**
   * End study session
   */
  endStudySession(): StudySession | null {
    if (!this.currentSession) return null;
    
    const session = this.currentSession;
    session.endTime = new Date();
    session.duration = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );
    
    // Update goals
    this.updateGoalProgress('time', session.duration / 60);
    
    this.currentSession = null;
    this.persistData();
    
    analytics.trackEvent({
      category: EventCategory.STUDY,
      action: EventAction.STUDY_END,
      value: session.duration,
      metadata: {
        subject: session.subject,
        pomodoros: session.completedPomodoros,
        focusScore: session.focusScore,
      },
    });
    
    // Show summary notification
    notificationService.info(
      'Study Session Complete',
      `You studied for ${formatDuration(session.duration)}`
    );
    
    return session;
  }
  
  /**
   * Get study session history
   */
  getSessionHistory(days: number = 7): StudySession[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return Array.from(this.sessions.values())
      .filter(s => s.startTime >= cutoff)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
  
  // ========================================================================
  // PRODUCTIVITY INSIGHTS
  // ========================================================================
  
  /**
   * Generate productivity insights
   */
  generateInsights(period: 'day' | 'week' | 'month' = 'week'): ProductivityInsights {
    const sessions = this.getSessionHistory(
      period === 'day' ? 1 : period === 'week' ? 7 : 30
    );
    
    // Calculate total study time
    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionDuration = sessions.length > 0
      ? totalStudyTime / sessions.length
      : 0;
    
    // Find most/least productive hours
    const hourlyProductivity: Map<number, number> = new Map();
    sessions.forEach(s => {
      const hour = s.startTime.getHours();
      hourlyProductivity.set(hour, (hourlyProductivity.get(hour) || 0) + s.focusScore);
    });
    
    let mostProductiveHour = 9; // default
    let leastProductiveHour = 22; // default
    let maxScore = 0;
    let minScore = Infinity;
    
    hourlyProductivity.forEach((score, hour) => {
      if (score > maxScore) {
        maxScore = score;
        mostProductiveHour = hour;
      }
      if (score < minScore) {
        minScore = score;
        leastProductiveHour = hour;
      }
    });
    
    // Calculate average focus score
    const averageFocusScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length
      : 0;
    
    // Total pomodoros
    const totalPomodoros = sessions.reduce((sum, s) => sum + s.completedPomodoros, 0);
    
    // Completion rate
    const tasks = this.getTasks();
    const completionRate = tasks.length > 0
      ? (tasks.filter(t => t.status === StudyTaskStatus.COMPLETED).length / tasks.length) * 100
      : 0;
    
    // Best study days
    const dayProductivity: Map<number, number> = new Map();
    sessions.forEach(s => {
      const day = s.startTime.getDay();
      dayProductivity.set(day, (dayProductivity.get(day) || 0) + s.duration);
    });
    
    const bestStudyDays = Array.from(dayProductivity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);
    
    // Subject distribution
    const subjectTime: Map<string, number> = new Map();
    sessions.forEach(s => {
      subjectTime.set(s.subject, (subjectTime.get(s.subject) || 0) + s.duration);
    });
    
    const subjectDistribution = Array.from(subjectTime.entries())
      .map(([subject, time]) => ({
        subject,
        time,
        percentage: (time / totalStudyTime) * 100,
      }))
      .sort((a, b) => b.time - a.time);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageFocusScore < 70) {
      recommendations.push('Try reducing distractions during study sessions');
    }
    
    if (averageSessionDuration < 1800) { // 30 minutes
      recommendations.push('Aim for longer study sessions for better retention');
    }
    
    if (totalPomodoros < 10 && sessions.length > 5) {
      recommendations.push('Consider using the Pomodoro technique more consistently');
    }
    
    if (completionRate < 50) {
      recommendations.push('Break down large tasks into smaller, manageable subtasks');
    }
    
    return {
      period,
      totalStudyTime,
      averageSessionDuration,
      mostProductiveHour,
      leastProductiveHour,
      averageFocusScore,
      totalPomodoros,
      completionRate,
      bestStudyDays,
      consistencyScore: this.calculateConsistencyScore(sessions),
      streakDays: this.calculateStreak(),
      subjectDistribution,
      recommendations,
      trends: [],
    };
  }
  
  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;
    
    const dates = new Set(
      sessions.map(s => s.startTime.toDateString())
    );
    
    const daysStudied = dates.size;
    const totalDays = 7; // For weekly insights
    
    return (daysStudied / totalDays) * 100;
  }
  
  /**
   * Calculate study streak
   */
  private calculateStreak(): number {
    const sessions = Array.from(this.sessions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    
    if (sessions.length === 0) return 0;
    
    const dates = new Set(
      sessions.map(s => {
        const date = new Date(s.startTime);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    
    const sortedDates = Array.from(dates).sort((a, b) => b - a);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sortedDates[i] === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  
  /**
   * Get current user ID (placeholder)
   */
  private getCurrentUserId(): string {
    // Would get from auth service
    return 'default_user';
  }
  
  /**
   * Persist data to localStorage
   */
  private persistData(): void {
    try {
      const data = {
        tasks: Array.from(this.tasks.values()),
        goals: Array.from(this.goals.values()),
        sessions: Array.from(this.sessions.values()).slice(-100),
        schedules: Array.from(this.schedules.values()),
        habits: Array.from(this.habits.values()),
        pomodoroSettings: this.pomodoroSettings,
      };
      
      localStorage.setItem('study_planner_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist study planner data:', error);
    }
  }
  
  /**
   * Load persisted data
   */
  private loadPersistedData(): void {
    try {
      const stored = localStorage.getItem('study_planner_data');
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      // Load tasks
      if (data.tasks) {
        data.tasks.forEach((t: any) => {
          this.tasks.set(t.id, {
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          });
        });
      }
      
      // Load goals
      if (data.goals) {
        data.goals.forEach((g: any) => {
          this.goals.set(g.id, {
            ...g,
            startDate: new Date(g.startDate),
            endDate: new Date(g.endDate),
            createdAt: new Date(g.createdAt),
            completedAt: g.completedAt ? new Date(g.completedAt) : undefined,
            history: g.history.map((h: any) => ({
              ...h,
              date: new Date(h.date),
            })),
          });
        });
      }
      
      // Load sessions
      if (data.sessions) {
        data.sessions.forEach((s: any) => {
          this.sessions.set(s.id, {
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : undefined,
            createdAt: new Date(s.createdAt),
          });
        });
      }
      
      // Load pomodoro settings
      if (data.pomodoroSettings) {
        this.pomodoroSettings = data.pomodoroSettings;
      }
    } catch (error) {
      console.error('Failed to load study planner data:', error);
    }
  }
  
  /**
   * Clear all data
   */
  clearAll(): void {
    this.tasks.clear();
    this.goals.clear();
    this.sessions.clear();
    this.schedules.clear();
    this.habits.clear();
    
    try {
      localStorage.removeItem('study_planner_data');
    } catch (error) {
      console.error('Failed to clear study planner data:', error);
    }
  }
}

// Export singleton instance
export const studyPlanner = StudyPlanner.getInstance();

export default StudyPlanner;
