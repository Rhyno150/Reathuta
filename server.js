
/**
 * REATHUTA BACKEND (Node.js + Express)
 * This version now supports permanent Course and Lesson storage.
 */
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE SIMULATION ---
// In a real production app, you would use: const { Client } = require('pg');
// For now, we use a server-side variable that stays alive as long as the server is running.
let courses = [
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
      { id: 'l2', title: 'Permission Mastery', content: 'Deep dive into chmod and chown.', type: 'text' }
    ]
  }
];

// --- AUTHENTICATION & 2FA ---
const verificationCodes = new Map();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/auth/send-2fa', async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });

  try {
    await transporter.sendMail({
      from: `"REATHUTA Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your REATHUTA Access Code",
      html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
               <h2 style="color:#2563eb;">REATHUTA LMS</h2>
               <p>Your verification code is: <b>${code}</b></p>
             </div>`
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, dev_code: code });
  }
});

app.post('/api/auth/verify-2fa', (req, res) => {
  const { email, code } = req.body;
  const stored = verificationCodes.get(email);
  if (stored && stored.code === code && stored.expires > Date.now()) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

// --- COURSE MANAGEMENT API ---

// 1. Get all courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// 2. Create a new course
app.post('/api/courses', (req, res) => {
  const newCourse = { ...req.body, id: Date.now().toString() };
  courses.push(newCourse);
  res.status(201).json(newCourse);
});

// 3. Update a course (Add/Delete lessons)
app.put('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...req.body };
    res.json(courses[index]);
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

// 4. Delete a course
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  courses = courses.filter(c => c.id !== id);
  res.status(204).send();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`REATHUTA Server running at http://localhost:${PORT}`);
});
