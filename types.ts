
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isVerified?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  isGraded: boolean;
  passMark: number; // decimal e.g. 0.8
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'pdf' | 'text' | 'quiz';
  url?: string;
  quiz?: Quiz;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  lessons: Lesson[];
  category: string;
  enrolledCount: number;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  quizScores: Record<string, number>; // lessonId -> best score
}
