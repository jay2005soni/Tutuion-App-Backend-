const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function createTest(req, res) {
  const test = { id: id("TST"), ...req.body };
  db.tests.push(test);
  return created(res, "Test created successfully", test);
}

function updateTest(req, res, next) {
  try {
    const test = db.tests.find((item) => item.id === req.params.testId);
    if (!test) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    Object.assign(test, req.body);
    return ok(res, "Test updated successfully", test);
  } catch (error) {
    next(error);
  }
}

function deleteTest(req, res, next) {
  try {
    const index = db.tests.findIndex((item) => item.id === req.params.testId);
    if (index === -1) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    const [test] = db.tests.splice(index, 1);
    return ok(res, "Test deleted successfully", test);
  } catch (error) {
    next(error);
  }
}

function upcomingTests(req, res, next) {
  try {
    const student = requireStudentAccess(req.user, req.params.studentId);
    const today = new Date().toISOString().slice(0, 10);
    const tests = db.tests.filter((item) => item.class === student.class && item.date >= today);
    return ok(res, "Upcoming tests fetched successfully", { tests });
  } catch (error) {
    next(error);
  }
}

function testDetails(req, res, next) {
  try {
    const test = db.tests.find((item) => item.id === req.params.testId);
    if (!test) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    return ok(res, "Test fetched successfully", test);
  } catch (error) {
    next(error);
  }
}

function questions(req, res, next) {
  try {
    if (!db.tests.some((item) => item.id === req.params.testId)) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    return ok(res, "Questions fetched successfully", {
      questions: db.questions.filter((item) => item.testId === req.params.testId).map(({ answer, ...question }) => question),
    });
  } catch (error) {
    next(error);
  }
}

function startTest(req, res, next) {
  try {
    const test = db.tests.find((item) => item.id === req.params.testId);
    if (!test) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    const student = db.students.find((item) => item.parentId === db.parents.find((parent) => parent.userId === req.user.id)?.id);
    if (!student && req.user.role === "PARENT") throw fail(404, "Student not found", "STUDENT_NOT_FOUND");
    const attempt = {
      id: id("TA"),
      testId: test.id,
      studentId: req.body.studentId || student?.id,
      startedAt: new Date().toISOString(),
      submittedAt: null,
      status: "started",
    };
    db.testAttempts.push(attempt);
    return created(res, "Test started successfully", { attemptId: attempt.id, startedAt: attempt.startedAt, durationMinutes: test.durationMinutes });
  } catch (error) {
    next(error);
  }
}

function submitAnswer(req, res, next) {
  try {
    const attempt = db.testAttempts.find((item) => item.id === req.params.attemptId);
    if (!attempt) throw fail(404, "Attempt not found", "ATTEMPT_NOT_FOUND");
    requireStudentAccess(req.user, attempt.studentId);
    const answer = { id: id("ANS"), attemptId: attempt.id, questionId: req.body.questionId, answer: req.body.answer };
    db.answers = db.answers.filter((item) => !(item.attemptId === answer.attemptId && item.questionId === answer.questionId));
    db.answers.push(answer);
    return created(res, "Answer submitted successfully", answer);
  } catch (error) {
    next(error);
  }
}

function submitTest(req, res, next) {
  try {
    const attempt = db.testAttempts.find((item) => item.id === req.params.attemptId);
    if (!attempt) throw fail(404, "Attempt not found", "ATTEMPT_NOT_FOUND");
    requireStudentAccess(req.user, attempt.studentId);
    const questions = db.questions.filter((item) => item.testId === attempt.testId);
    const answers = db.answers.filter((item) => item.attemptId === attempt.id);
    let correct = 0;
    let obtainedMarks = 0;
    questions.forEach((question) => {
      const answer = answers.find((item) => item.questionId === question.id);
      if (answer?.answer === question.answer) {
        correct += 1;
        obtainedMarks += question.marks || 1;
      }
    });
    const totalMarks = questions.reduce((sum, item) => sum + (item.marks || 1), 0);
    const result = {
      id: id("RES"),
      testId: attempt.testId,
      studentId: attempt.studentId,
      obtainedMarks,
      totalMarks,
      percentage: totalMarks ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2)) : 0,
      correct,
      wrong: answers.length - correct,
      unattempted: Math.max(questions.length - answers.length, 0),
      date: new Date().toISOString().slice(0, 10),
    };
    attempt.status = "submitted";
    attempt.submittedAt = new Date().toISOString();
    db.results.push(result);
    return ok(res, "Test submitted successfully", result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createTest, updateTest, deleteTest, upcomingTests, testDetails, questions, startTest, submitAnswer, submitTest };
