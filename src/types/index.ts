import type { Timestamp } from "firebase/firestore";

export type QuestionOption = {
  key: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  options: QuestionOption[];
  answer: string;
};

export type QuestionSet = {
  id: string;
  ownerId: string;
  title: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  questions: Question[];
};

export type SessionStatus = "draft" | "live" | "closed";

export type QuizSession = {
  id: string;
  ownerId: string;
  createdAt: Timestamp | null;
  currentQuestionIndex: number;
  currentQuestionKey: string;
  questionDurationSeconds: number;
  questionEndsAt: Timestamp | null;
  showResults: boolean;
  showCorrectAnswer: boolean;
  status: SessionStatus;
  questions: Question[];
};

export type Participant = {
  id: string;
  name: string;
  joinedAt: Timestamp | null;
  lastSeen: Timestamp | null;
};

export type Answer = {
  id: string;
  participantId: string;
  questionIndex: number;
  questionKey: string;
  selectedOption: string;
  submittedAt: Timestamp | null;
  isCorrect: boolean;
};
