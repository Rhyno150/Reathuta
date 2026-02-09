
import { Course, User, UserRole } from './types';

export const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Advanced System Administration',
    description: 'Master Linux server management and automation workflows.',
    instructor: 'John Doe',
    category: 'IT & Infrastructure',
    thumbnail: 'https://picsum.photos/seed/sysadmin/600/400',
    enrolledCount: 125,
    lessons: [
      { id: 'l1', title: 'Introduction to Bash', content: 'Learn the basics of shell scripting.', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { id: 'l2', title: 'Permission Mastery', content: 'Deep dive into chmod and chown.', type: 'text' },
      { id: 'l3', title: 'Server Hardening Guide', content: 'Secure your assets.', type: 'pdf' }
    ]
  },
  {
    id: '2',
    title: 'Modern Web Development with React',
    description: 'Learn React from scratch to production-ready applications.',
    instructor: 'Jane Smith',
    category: 'Software Engineering',
    thumbnail: 'https://picsum.photos/seed/react/600/400',
    enrolledCount: 350,
    lessons: [
      { id: 'l4', title: 'React Hooks Deep Dive', content: 'Understand useEffect and useMemo.', type: 'video' }
    ]
  }
];

export const MOCK_ADMIN: User = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@reathuta.com',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/seed/admin/100/100'
};

export const MOCK_STUDENT: User = {
  id: 'student1',
  name: 'Jane Student',
  email: 'jane@student.com',
  role: UserRole.STUDENT,
  avatar: 'https://picsum.photos/seed/student/100/100'
};
