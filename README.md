# EcoLearn Platform — Full Stack Setup Guide

## Tech Stack
- **Frontend:** Pure HTML/CSS/JS (single file, no build step)
- **Backend:** Node.js + Express
- **Database:** MySQL (view all data in MySQL Workbench)
- **File Uploads:** Multer (local storage → `uploads/` folder)
- **Auth:** JWT tokens + bcrypt

---

## Step 1: MySQL Setup

1. Open **MySQL Workbench**
2. Connect to your local MySQL server
3. Open a new SQL tab and run the entire contents of `backend/schema.sql`
4. This creates the `ecolearn` database and all tables, and seeds demo accounts

**Tables created:**
- `users` — student/teacher/admin accounts
- `modules` — learning modules with thumbnail
- `module_items` — videos, images, text inside a module
- `quizzes` — quiz metadata
- `quiz_questions` — individual questions
- `quiz_options` — MCQ answer options
- `item_progress` — per-item completion (tick marks)
- `module_progress` — overall % per module per user
- `quiz_attempts` — each attempt with score
- `quiz_answers` — each answer in each attempt
- `assignments` — homework tasks
- `assignment_submissions` — student uploads/responses
- `activity_log` — all user actions for analytics

---

## Step 2: Backend Config

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=YOUR_MYSQL_PASSWORD
DB_NAME=ecolearn
JWT_SECRET=any-long-random-string
PORT=3001
```

---

## Step 3: Install & Run

```bash
cd backend
npm install
node server.js
```

You'll see:
```
🌿 EcoLearn running at http://localhost:3001
   MySQL: localhost / ecolearn
   Admin: admin@ecolearn.com  |  Student: student@ecolearn.com
   Default password for both: Admin@123
```

Open **http://localhost:3001** in your browser.

---

## Default Accounts

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@ecolearn.com       | Admin@123  |
| Student | student@ecolearn.com     | Admin@123  |

> The admin account has a completely separate dashboard with admin-only features. Students never see admin UI.

---

## Features

### Student Account
- Browse and search modules (with filters)
- Watch videos — auto-marked complete when 90% watched
- View images with lightbox, read text lessons
- Each item gets a ✓ tick when complete
- Overall module % progress bar updates live
- Take quizzes — select MCQ answers, see score instantly
- Submit assignments — upload files (PDF, images, video, ZIP) + text response
- Leaderboard, profile with avatar upload

### Admin Account
- Create/edit/delete modules with thumbnail upload
- Add items to modules: text, video (upload), image (upload), link
- Create quizzes with a visual question builder — add/remove questions and options, mark correct answers
- Publish/unpublish modules and quizzes
- Create assignments, view all submissions, grade and give feedback
- Manage users and change roles
- Analytics dashboard — completions, recent activity, quiz scores

---

## Viewing Data in MySQL Workbench

All data is stored in MySQL. In Workbench, run queries like:

```sql
-- See all users and their points
SELECT name, email, role, eco_points FROM ecolearn.users;

-- See module completion per student
SELECT u.name, m.title, mp.percent_complete, mp.is_completed
FROM ecolearn.module_progress mp
JOIN ecolearn.users u ON u.id = mp.user_id
JOIN ecolearn.modules m ON m.id = mp.module_id;

-- See quiz attempt scores
SELECT u.name, q.title, qa.score_percent, qa.passed, qa.submitted_at
FROM ecolearn.quiz_attempts qa
JOIN ecolearn.users u ON u.id = qa.user_id
JOIN ecolearn.quizzes q ON q.id = qa.quiz_id
ORDER BY qa.submitted_at DESC;

-- See assignment submissions
SELECT u.name, a.title, s.status, s.score, s.submitted_at
FROM ecolearn.assignment_submissions s
JOIN ecolearn.users u ON u.id = s.user_id
JOIN ecolearn.assignments a ON a.id = s.assignment_id;

-- Activity log
SELECT u.name, al.action, al.entity_type, al.created_at
FROM ecolearn.activity_log al
JOIN ecolearn.users u ON u.id = al.user_id
ORDER BY al.created_at DESC LIMIT 50;
```

---

## Upload Folder Structure
```
uploads/
  thumbnails/    → module thumbnails
  media/         → videos and images in modules
  assignments/   → student submission files
  avatars/       → user profile photos
```

## API Endpoints (for reference)
```
POST /api/auth/register       Create account
POST /api/auth/login          Sign in
GET  /api/auth/me             Get current user
POST /api/auth/avatar         Upload avatar

GET  /api/modules             List modules (with progress)
GET  /api/modules/:id         Module + items + progress ticks
POST /api/modules             Create module (admin)
PUT  /api/modules/:id         Edit module (admin)
DELETE /api/modules/:id       Delete module (admin)
POST /api/modules/:id/items   Add item to module (admin)
POST /api/modules/:id/items/:itemId/complete   Mark item complete (student)

GET  /api/quizzes             List quizzes
GET  /api/quizzes/:id         Quiz with questions
POST /api/quizzes             Create quiz (admin)
POST /api/quizzes/:id/submit  Submit attempt (student)

GET  /api/assignments         List assignments
POST /api/assignments         Create (admin)
POST /api/assignments/:id/submit  Submit with file upload (student)
PATCH /api/assignments/:id/submissions/:uid/grade  Grade (admin)

GET  /api/leaderboard         Top students by points
GET  /api/search?q=...        Global search
GET  /api/admin/analytics     Platform stats (admin only)
GET  /api/admin/users         All users (admin only)
```
