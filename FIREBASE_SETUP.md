# Firebase Setup

Use this when all backend data should be stored in Firebase.

## 1. Install Dependency

Already added:

```bash
npm install firebase-admin
```

## 2. Create Firebase Project

1. Open Firebase Console.
2. Create/select project.
3. Enable Firestore Database.
4. Enable Firebase Authentication if Flutter app will use Firebase Auth.
5. Enable Storage if notes/files/receipts will be uploaded.

## 3. Add Service Account

Download the private key from:

```text
Firebase Console > Project Settings > Service accounts > Generate new private key
```

Save it locally as:

```text
D:\TUTIONAPPLICATION\serviceAccountKey.json
```

Do not commit this file. It is ignored in `.gitignore`.

## 4. Environment

Copy `.env.example` to `.env` and fill:

```text
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-firebase-project-id.appspot.com
FIREBASE_WEB_API_KEY=your-firebase-web-api-key
```

## 5. Backend Files Added

- `src/config/firebase.js`: initializes Firebase Admin SDK.
- `src/config/firebaseCollections.js`: keeps collection names centralized.
- `src/services/firestoreService.js`: reusable Firestore CRUD helpers.
- `firebase-service-account.example.json`: dummy example only.

## 5.1 Seed Demo Data

After `.env` and `serviceAccountKey.json` are ready:

```bash
npm run seed:firebase
```

This creates demo Firebase Auth users and Firestore documents:

```text
Parent: rahul@gmail.com / parent123
Tutor: tutor@tuition.local / tutor123
Admin: admin@tuition.local / admin123
Student ID: STU_demo
```

## 6. Suggested Firestore Collections

```text
users
parents
tutors
admins
students
attendance
homework
tests
questions
testAttempts
answers
results
progress
notes
syllabus
fees
payments
announcements
notifications
```

## 7. Important Production Notes

- Keep authentication in Firebase Auth or a secure auth provider.
- Do not store plain passwords in Firestore.
- Use Firebase Storage for note PDFs and receipts; keep only file metadata and URLs in Firestore.
- Keep parent access checks on backend. Flutter UI checks are not enough.
