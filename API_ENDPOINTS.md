# Tuition App API Endpoints

Base URL:

```text
http://localhost:5000/api/v1
```

Protected APIs:

```text
Authorization: Bearer <TOKEN>
```

Demo users:

```text
Parent: rahul@gmail.com / parent123
Tutor: tutor@tuition.local / tutor123
Admin: admin@tuition.local / admin123
```

Response format:

```json
{
  "success": true,
  "message": "Message",
  "data": {}
}
```

Error format:

```json
{
  "success": false,
  "message": "Unauthorized access",
  "errorCode": "UNAUTHORIZED"
}
```

## Auth

### Register Parent

```http
POST /auth/register
```

```json
{
  "parentName": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "phone": "9876543210",
  "studentName": "Aarav Sharma",
  "password": "parent123"
}
```

### Login

```http
POST /auth/login
```

```json
{
  "email": "rahul@gmail.com",
  "password": "parent123"
}
```

Use `data.token` from this response in all protected APIs.

### Forgot Password

```http
POST /auth/forgot-password
```

```json
{
  "email": "rahul@gmail.com"
}
```

### Current User

```http
GET /auth/me
```

### Logout

```http
POST /auth/logout
```

## Parent/Profile

### Parent Profile

```http
GET /parents/me
```

### Update Parent Profile

```http
PUT /parents/me
```

```json
{
  "name": "Rahul Sharma",
  "phone": "9876543211",
  "email": "rahul@gmail.com"
}
```

### Profile Alias

```http
GET /profile
PUT /profile
```

### Parent Students

```http
GET /parents/me/students
```

## Dashboard

### Parent Dashboard

```http
GET /parent/dashboard
GET /parent/dashboard?studentId=STUDENT_ID
```

Example response data:

```json
{
  "student": {
    "id": "STU_xxxxxxxx",
    "name": "Aarav Sharma",
    "class": "8",
    "section": "A"
  },
  "overview": {
    "attendancePercentage": 66.67,
    "progressPercentage": 85,
    "pendingHomework": 1,
    "latestTestScore": {
      "obtained": 18,
      "total": 20
    }
  },
  "todayAttendance": null,
  "homework": [],
  "latestAnnouncement": {},
  "upcomingTest": {}
}
```

## Students

### Create Student

Roles: `TUTOR`, `ADMIN`

```http
POST /students
POST /admin/students
```

```json
{
  "name": "Aarav Sharma",
  "class": "8",
  "section": "A",
  "rollNumber": "21",
  "parentId": "PAR_xxxxxxxx",
  "tutorId": "TUT_xxxxxxxx",
  "subjects": [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Computer"
  ],
  "status": "active"
}
```

### Get Student

```http
GET /students/{studentId}
```

### Update Student

Roles: `TUTOR`, `ADMIN`

```http
PUT /students/{studentId}
PUT /admin/students/{studentId}
```

```json
{
  "name": "Aarav Sharma",
  "class": "8",
  "section": "B",
  "rollNumber": "21",
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "status": "active"
}
```

### Deactivate Student

Roles: `TUTOR`, `ADMIN`

```http
PATCH /students/{studentId}/status
DELETE /admin/students/{studentId}
```

```json
{
  "status": "inactive"
}
```

## Attendance

### Get Attendance

```http
GET /students/{studentId}/attendance?month=9&year=2026
```

### Mark Attendance

Roles: `TUTOR`, `ADMIN`

```http
POST /attendance
```

```json
{
  "studentId": "STU_xxxxxxxx",
  "date": "2026-09-11",
  "status": "present"
}
```

Allowed statuses:

```text
present, absent, holiday, no_class
```

### Update Attendance

Roles: `TUTOR`, `ADMIN`

```http
PUT /attendance/{attendanceId}
```

```json
{
  "date": "2026-09-11",
  "status": "absent"
}
```

### Bulk Attendance

Roles: `TUTOR`, `ADMIN`

```http
POST /attendance/bulk
```

```json
{
  "date": "2026-09-11",
  "records": [
    {
      "studentId": "STU_xxxxxxxx",
      "status": "present"
    },
    {
      "studentId": "STU_yyyyyyyy",
      "status": "absent"
    }
  ]
}
```

## Homework

### Create Homework

Roles: `TUTOR`, `ADMIN`

```http
POST /homework
```

```json
{
  "studentId": "STU_xxxxxxxx",
  "subject": "Mathematics",
  "title": "Exercise 5.2",
  "description": "Solve questions 1-10",
  "assignedDate": "2026-09-11",
  "dueDate": "2026-09-13"
}
```

### Get Student Homework

```http
GET /students/{studentId}/homework
GET /students/{studentId}/homework?status=pending
```

### Update Homework Status

```http
PATCH /homework/{homeworkId}/status
```

```json
{
  "status": "completed"
}
```

Allowed statuses:

```text
pending, completed, overdue
```

### Update Homework

Roles: `TUTOR`, `ADMIN`

```http
PUT /homework/{homeworkId}
```

```json
{
  "title": "Exercise 5.3",
  "description": "Solve questions 1-15",
  "dueDate": "2026-09-14"
}
```

### Delete Homework

Roles: `TUTOR`, `ADMIN`

```http
DELETE /homework/{homeworkId}
```

## Tests

### Create Test

Roles: `TUTOR`, `ADMIN`

```http
POST /tests
```

```json
{
  "title": "Algebra & Linear Equations",
  "subject": "Mathematics",
  "class": "8",
  "date": "2026-09-15",
  "startTime": "10:00",
  "durationMinutes": 45,
  "totalMarks": 30
}
```

### Upcoming Tests

```http
GET /students/{studentId}/tests/upcoming
```

### Test Details

```http
GET /tests/{testId}
```

### Update Test

Roles: `TUTOR`, `ADMIN`

```http
PUT /tests/{testId}
```

```json
{
  "date": "2026-09-16",
  "durationMinutes": 60
}
```

### Delete Test

Roles: `TUTOR`, `ADMIN`

```http
DELETE /tests/{testId}
```

## Online Tests

### Get Questions

```http
GET /tests/{testId}/questions
```

### Start Test

```http
POST /tests/{testId}/start
```

Optional body:

```json
{
  "studentId": "STU_xxxxxxxx"
}
```

### Submit Answer

```http
POST /test-attempts/{attemptId}/answers
```

```json
{
  "questionId": "Q_xxxxxxxx",
  "answer": "5"
}
```

### Submit Test

```http
POST /test-attempts/{attemptId}/submit
```

Backend calculates:

```text
obtainedMarks, percentage, correct, wrong, unattempted
```

## Results

### Student Results

```http
GET /students/{studentId}/results
```

### Result Detail

```http
GET /results/{resultId}
```

### Create Result

Roles: `TUTOR`, `ADMIN`

```http
POST /results
```

```json
{
  "testId": "TST_xxxxxxxx",
  "studentId": "STU_xxxxxxxx",
  "testName": "Algebra Test",
  "subject": "Mathematics",
  "obtainedMarks": 18,
  "totalMarks": 20,
  "percentage": 90,
  "date": "2026-09-10"
}
```

### Update Result

Roles: `TUTOR`, `ADMIN`

```http
PUT /results/{resultId}
```

```json
{
  "obtainedMarks": 19,
  "percentage": 95
}
```

## Progress

### Overall Progress

```http
GET /students/{studentId}/progress
```

### Update Subject Progress

Roles: `TUTOR`, `ADMIN`

```http
PUT /students/{studentId}/progress
```

```json
{
  "subject": "Mathematics",
  "percentage": 82,
  "teacherRemark": "Needs more practice in algebra"
}
```

### Weak Subjects

```http
GET /students/{studentId}/weak-subjects
```

## Notes / Study Material

### Create Note

Roles: `TUTOR`, `ADMIN`

```http
POST /notes
```

```json
{
  "title": "Algebra & Linear Equations",
  "subject": "Mathematics",
  "class": "8",
  "description": "Chapter notes",
  "fileUrl": "https://example.com/algebra.pdf",
  "fileName": "algebra.pdf",
  "fileType": "pdf",
  "isImportant": true
}
```

### Get Student Notes

```http
GET /students/{studentId}/notes
GET /students/{studentId}/notes?subject=Mathematics
```

### Note Detail

```http
GET /notes/{noteId}
```

### Delete Note

Roles: `TUTOR`, `ADMIN`

```http
DELETE /notes/{noteId}
```

## Syllabus

### Get Syllabus

```http
GET /students/{studentId}/syllabus
```

## Fees

### Fee Summary

```http
GET /students/{studentId}/fees
```

### Create Fee

Role: `ADMIN`

```http
POST /fees
```

```json
{
  "studentId": "STU_xxxxxxxx",
  "amount": 4000,
  "dueDate": "2026-09-15",
  "description": "September Tuition Fee"
}
```

## Payments

### Create Payment Order

```http
POST /payments/create-order
```

```json
{
  "feeId": "FEE_xxxxxxxx",
  "amount": 4000
}
```

### Verify Payment

```http
POST /payments/verify
```

```json
{
  "feeId": "FEE_xxxxxxxx",
  "amount": 4000,
  "transactionId": "TXN123456"
}
```

### Payment History

```http
GET /students/{studentId}/payments
```

### Receipt

```http
GET /payments/{paymentId}/receipt
```

## Announcements

### Create Announcement

Roles: `TUTOR`, `ADMIN`

```http
POST /announcements
```

```json
{
  "title": "Parent Teacher Meeting",
  "message": "PTM will be held on Sunday.",
  "date": "2026-09-14",
  "priority": "high"
}
```

### Get Student Announcements

```http
GET /students/{studentId}/announcements
```

### Announcement Detail

```http
GET /announcements/{announcementId}
```

## Notifications

### Get Notifications

```http
GET /notifications
```

### Mark Notification Read

```http
PATCH /notifications/{notificationId}/read
```

### Mark All Read

```http
PATCH /notifications/read-all
```

## Tutor

### Tutor Students

Role: `TUTOR`

```http
GET /tutors/me/students
```

### Tutor Classes

Role: `TUTOR`

```http
GET /tutors/me/classes
```

## Admin

### Admin Dashboard

Role: `ADMIN`

```http
GET /admin/dashboard
```

### Manage Students

Role: `ADMIN`

```http
GET /admin/students
POST /admin/students
PUT /admin/students/{studentId}
DELETE /admin/students/{studentId}
```

### Manage Parents

Role: `ADMIN`

```http
GET /admin/parents
PUT /admin/parents/{parentId}
```

Update parent body:

```json
{
  "name": "Rahul Sharma",
  "phone": "9876543211"
}
```

### Manage Tutors

Role: `ADMIN`

```http
GET /admin/tutors
POST /admin/tutors
PUT /admin/tutors/{tutorId}
```

Create tutor body:

```json
{
  "name": "Priya Tutor",
  "email": "priya@tuition.local",
  "phone": "9876500000",
  "password": "tutor123",
  "classes": [
    "8-A",
    "9-A"
  ]
}
```

## Recommended Testing Flow

1. Login as parent.
2. Copy `data.token`.
3. Call `GET /parents/me/students`.
4. Copy first `student.id`.
5. Call dashboard, attendance, homework, results, progress, notes, syllabus, fees.
6. Login as tutor/admin for create/update APIs.

