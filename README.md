# Tuition Application Backend

REST API backend for the tuition app parent, tutor, and admin flows.

## Quick Start

```bash
npm install
copy .env.example .env
npm run dev
```

Base URL:

```text
http://localhost:5000/api/v1
```

Health check:

```text
GET http://localhost:5000/health
```

## Demo Logins

```text
Parent: rahul@gmail.com / parent123
Tutor: tutor@tuition.local / tutor123
Admin: admin@tuition.local / admin123
```

Create these users in Firebase with:

```bash
npm run seed:firebase
```

Send protected requests with:

```text
Authorization: Bearer <TOKEN>
```

## Implemented Modules

- Auth: register, login, forgot password, logout, current user
- Parent profile and parent students
- Student create/read/update/deactivate
- Parent dashboard aggregation
- Attendance single and bulk marking
- Homework create/read/update/status/delete
- Tests, online test start, answers, submit, auto result calculation
- Results, progress, weak subjects
- Notes/study material and syllabus
- Fees, payment order, payment verification, receipt, history
- Announcements and notifications
- Tutor students/classes
- Admin dashboard, students, parents, tutors

## Firebase/Database Notes

Firebase Admin SDK dependency and config files are added. Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) before connecting a real project.

All route data now reads/writes through Firestore using `src/services/firestoreService.js`. Auth uses Firebase Auth ID tokens.

Do not store plain passwords in Firestore.

## Important Security Behavior

Every protected API verifies the bearer token, reads the current user role, and checks permissions before returning student-specific data. Parent users can only access students linked to their own parent profile.

## Postman

Import [postman/Tuition-App-API.postman_collection.json](./postman/Tuition-App-API.postman_collection.json), call `Auth / Login - Parent`, then copy the returned `data.token` into the collection variable named `token`.
