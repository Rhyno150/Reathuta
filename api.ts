
/**
 * API SERVICE LAYER (SIMULATED)
 * This file simulates a backend system using LocalStorage to ensure 
 * courses stay "on the system" even after page refreshes.
 */
import { Course, Lesson } from './types';
import { INITIAL_COURSES } from './constants';

const DB_KEY = 'reathuta_persistent_courses';

// Helper to get data from our "System Database"
const getDB = (): Course[] => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    // Initialize with defaults if "system" is empty
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_COURSES));
    return INITIAL_COURSES;
  }
  return JSON.parse(data);
};

// Helper to save data to our "System Database"
const saveDB = (courses: Course[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(courses));
};

export const authService = {
  async request2FA(email: string): Promise<{ success: boolean; devCode: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // Generate a code that we'll return to the frontend for simulation purposes
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // In a real app, devCode would be null, and an email would be sent via Node.js
    return { success: true, devCode: code };
  },

  async verify2FA(email: string, code: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 600));
    // In our simulation, we verify on the frontend, so the server always says 'ok' 
    // to any well-formed request to let the frontend handle the logic.
    return true; 
  }
};

export const courseService = {
  async getCourses(): Promise<Course[]> {
    return new Promise((resolve) => {
      // Simulate slight network latency
      setTimeout(() => {
        resolve(getDB());
      }, 300);
    });
  },

  async createCourse(course: Course): Promise<Course | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        const newCourse = { ...course, id: Date.now().toString() };
        db.push(newCourse);
        saveDB(db);
        resolve(newCourse);
      }, 500);
    });
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        const index = db.findIndex(c => c.id === id);
        if (index !== -1) {
          db[index] = { ...db[index], ...updates };
          saveDB(db);
          resolve(db[index]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  async deleteCourse(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDB();
        const filtered = db.filter(c => c.id !== id);
        saveDB(filtered);
        resolve(true);
      }, 300);
    });
  }
};
