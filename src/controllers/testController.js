const { created, fail, ok } = require("../utils/http");
const { currentParent, requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function createTest(req, res, next) {
  try {
  const test = await store.createDoc("tests", req.body, store.makeId("TST"));
  return created(res, "Test created successfully", test);
  } catch (error) {
    next(error);
  }
}

async function updateTest(req, res, next) {
  try {
    const test = await store.getDoc("tests", req.params.testId);
    if (!test) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    const updated = await store.updateDoc("tests", test.id, req.body);
    return ok(res, "Test updated successfully", updated);
  } catch (error) {
    next(error);
  }
}

async function deleteTest(req, res, next) {
  try {
    const test = await store.getDoc("tests", req.params.testId);
    if (!test) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    await store.deleteDoc("tests", test.id);
    return ok(res, "Test deleted successfully", test);
  } catch (error) {
    next(error);
  }
}

async function upcomingTests(req, res, next) {
  try {
    const student = await requireStudentAccess(req.user, req.params.studentId);
    const today = new Date().toISOString().slice(0, 10);
    const tests = (await store.listDocs("tests", [["class", "==", student.class]])).filter((item) => item.date >= today);
    return ok(res, "Upcoming tests fetched successfully", { tests });
  } catch (error) {
    next(error);
  }
}

async function testDetails(req, res, next) {
  try {
    const test = await store.getDoc("tests", req.params.testId);
    if (!test) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    return ok(res, "Test fetched successfully", test);
  } catch (error) {
    next(error);
  }
}

async function questions(req, res, next) {
  try {
    if (!(await store.getDoc("tests", req.params.testId))) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    const questions = await store.listDocs("questions", [["testId", "==", req.params.testId]]);
    return ok(res, "Questions fetched successfully", {
      questions: questions.map(({ answer, ...question }) => question),
    });
  } catch (error) {
    next(error);
  }
}

async function startTest(req, res, next) {
  try {
    const test = await store.getDoc("tests", req.params.testId);
    if (!test) throw fail(404, "Test not found", "TEST_NOT_FOUND");
    const parent = req.user.role === "PARENT" ? await currentParent(req.user.id) : null;
    const student = req.body.studentId
      ? await requireStudentAccess(req.user, req.body.studentId)
      : (await store.listDocs("students", [["parentId", "==", parent?.id]])).at(0);
    if (!student && req.user.role === "PARENT") throw fail(404, "Student not found", "STUDENT_NOT_FOUND");
    const attempt = await store.createDoc("testAttempts", {
      testId: test.id,
      studentId: student?.id,
      startedAt: new Date().toISOString(),
      submittedAt: null,
      status: "started",
    }, store.makeId("TA"));
    return created(res, "Test started successfully", { attemptId: attempt.id, startedAt: attempt.startedAt, durationMinutes: test.durationMinutes });
  } catch (error) {
    next(error);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const attempt = await store.getDoc("testAttempts", req.params.attemptId);
    if (!attempt) throw fail(404, "Attempt not found", "ATTEMPT_NOT_FOUND");
    await requireStudentAccess(req.user, attempt.studentId);
    const existing = await store.findOne("answers", [["attemptId", "==", attempt.id], ["questionId", "==", req.body.questionId]]);
    const answer = existing
      ? await store.updateDoc("answers", existing.id, { answer: req.body.answer })
      : await store.createDoc("answers", { attemptId: attempt.id, questionId: req.body.questionId, answer: req.body.answer }, store.makeId("ANS"));
    return created(res, "Answer submitted successfully", answer);
  } catch (error) {
    next(error);
  }
}

async function submitTest(req, res, next) {
  try {
    const attempt = await store.getDoc("testAttempts", req.params.attemptId);
    if (!attempt) throw fail(404, "Attempt not found", "ATTEMPT_NOT_FOUND");
    await requireStudentAccess(req.user, attempt.studentId);
    const questions = await store.listDocs("questions", [["testId", "==", attempt.testId]]);
    const answers = await store.listDocs("answers", [["attemptId", "==", attempt.id]]);
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
    const result = await store.createDoc("results", {
      testId: attempt.testId,
      studentId: attempt.studentId,
      obtainedMarks,
      totalMarks,
      percentage: totalMarks ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2)) : 0,
      correct,
      wrong: answers.length - correct,
      unattempted: Math.max(questions.length - answers.length, 0),
      date: new Date().toISOString().slice(0, 10),
    }, store.makeId("RES"));
    await store.updateDoc("testAttempts", attempt.id, { status: "submitted", submittedAt: new Date().toISOString() });
    return ok(res, "Test submitted successfully", result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createTest, updateTest, deleteTest, upcomingTests, testDetails, questions, startTest, submitAnswer, submitTest };
