const { created, fail, ok } = require("../utils/http");

const {
  currentParent,
  requireStudentAccess,
} = require("../services/permissionService");

const store = require("../services/firestoreService");


// =====================================================
// CREATE TEST
// =====================================================

async function createTest(req, res, next) {
  try {
    const {
      title,
      subject,
      class: testClass,
      date,
      durationMinutes,
      totalMarks,
    } = req.body;

    if (
      !title ||
      !subject ||
      !testClass ||
      !date ||
      !durationMinutes ||
      !totalMarks
    ) {
      throw fail(
        422,
        "title, subject, class, date, durationMinutes and totalMarks are required",
        "VALIDATION_ERROR"
      );
    }

    const test = await store.createDoc(
      "tests",
      {
        title,
        subject,
        class: String(testClass),
        date,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
      },
      store.makeId("TST")
    );

    return created(
      res,
      "Test created successfully",
      test
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// UPDATE TEST
// =====================================================

async function updateTest(req, res, next) {
  try {
    const test = await store.getDoc(
      "tests",
      req.params.testId
    );

    if (!test) {
      throw fail(
        404,
        "Test not found",
        "TEST_NOT_FOUND"
      );
    }

    const updated = await store.updateDoc(
      "tests",
      test.id,
      req.body
    );

    return ok(
      res,
      "Test updated successfully",
      updated
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// DELETE TEST
// =====================================================

async function deleteTest(req, res, next) {
  try {
    const test = await store.getDoc(
      "tests",
      req.params.testId
    );

    if (!test) {
      throw fail(
        404,
        "Test not found",
        "TEST_NOT_FOUND"
      );
    }

    await store.deleteDoc(
      "tests",
      test.id
    );

    return ok(
      res,
      "Test deleted successfully",
      test
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// UPCOMING TESTS
// =====================================================

async function upcomingTests(req, res, next) {
  try {
    const student = await requireStudentAccess(
      req.user,
      req.params.studentId
    );

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const tests = (
      await store.listDocs(
        "tests",
        [["class", "==", String(student.class)]]
      )
    )
      .filter((item) => item.date >= today)
      .sort((a, b) =>
        String(a.date).localeCompare(
          String(b.date)
        )
      );

    return ok(
      res,
      "Upcoming tests fetched successfully",
      { tests }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// TEST DETAILS
// =====================================================

async function testDetails(req, res, next) {
  try {
    const test = await store.getDoc(
      "tests",
      req.params.testId
    );

    if (!test) {
      throw fail(
        404,
        "Test not found",
        "TEST_NOT_FOUND"
      );
    }

    return ok(
      res,
      "Test fetched successfully",
      test
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// CREATE QUESTION
// =====================================================

async function createQuestion(req, res, next) {
  try {
    const test = await store.getDoc(
      "tests",
      req.params.testId
    );

    if (!test) {
      throw fail(
        404,
        "Test not found",
        "TEST_NOT_FOUND"
      );
    }

    const {
      question,
      options,
      answer,
      marks,
    } = req.body;

    if (!question) {
      throw fail(
        422,
        "Question is required",
        "VALIDATION_ERROR"
      );
    }

    if (
      !Array.isArray(options) ||
      options.length < 2
    ) {
      throw fail(
        422,
        "At least two options are required",
        "VALIDATION_ERROR"
      );
    }

    if (!answer) {
      throw fail(
        422,
        "Correct answer is required",
        "VALIDATION_ERROR"
      );
    }

    if (!options.includes(answer)) {
      throw fail(
        422,
        "Answer must match one of the options",
        "VALIDATION_ERROR"
      );
    }

    const questionMarks = Number(marks || 1);

    if (questionMarks <= 0) {
      throw fail(
        422,
        "Marks must be greater than 0",
        "VALIDATION_ERROR"
      );
    }

    const newQuestion = await store.createDoc(
      "questions",
      {
        testId: test.id,
        question,
        options,
        answer,
        marks: questionMarks,
      },
      store.makeId("QUE")
    );

    return created(
      res,
      "Question created successfully",
      newQuestion
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// GET QUESTIONS
// =====================================================

async function questions(req, res, next) {
  try {
    const test = await store.getDoc(
      "tests",
      req.params.testId
    );

    if (!test) {
      throw fail(
        404,
        "Test not found",
        "TEST_NOT_FOUND"
      );
    }

    const questionList =
      await store.listDocs(
        "questions",
        [["testId", "==", req.params.testId]]
      );

    // IMPORTANT:
    // Correct answer is never sent to student
    const safeQuestions = questionList.map(
      ({ answer, ...question }) => question
    );

    return ok(
      res,
      "Questions fetched successfully",
      {
        questions: safeQuestions,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// START TEST
// =====================================================

async function startTest(req, res, next) {
  try {
    const test = await store.getDoc(
      "tests",
      req.params.testId
    );

    if (!test) {
      throw fail(
        404,
        "Test not found",
        "TEST_NOT_FOUND"
      );
    }

    const parent =
      req.user.role === "PARENT"
        ? await currentParent(req.user.id)
        : null;

    let student;

    if (req.body.studentId) {
      student = await requireStudentAccess(
        req.user,
        req.body.studentId
      );
    } else if (parent) {
      const students =
        await store.listDocs(
          "students",
          [["parentId", "==", parent.id]]
        );

      student = students[0];
    }

    if (!student) {
      throw fail(
        404,
        "Student not found",
        "STUDENT_NOT_FOUND"
      );
    }

    // Student class must match test class
    if (
      String(student.class) !==
      String(test.class)
    ) {
      throw fail(
        403,
        "This test is not assigned to the student's class",
        "TEST_CLASS_MISMATCH"
      );
    }

    // Prevent starting the same test again
    const existingAttempts =
      await store.listDocs(
        "testAttempts",
        [
          ["testId", "==", test.id],
          ["studentId", "==", student.id],
        ]
      );

    const activeAttempt =
      existingAttempts.find(
        (attempt) =>
          attempt.status === "started"
      );

    if (activeAttempt) {
      return ok(
        res,
        "Existing test attempt found",
        {
          attemptId: activeAttempt.id,
          startedAt: activeAttempt.startedAt,
          durationMinutes:
            test.durationMinutes,
        }
      );
    }

    const alreadySubmitted =
      existingAttempts.find(
        (attempt) =>
          attempt.status === "submitted"
      );

    if (alreadySubmitted) {
      throw fail(
        409,
        "You have already submitted this test",
        "TEST_ALREADY_SUBMITTED"
      );
    }

    const attempt =
      await store.createDoc(
        "testAttempts",
        {
          testId: test.id,
          studentId: student.id,
          startedAt:
            new Date().toISOString(),
          submittedAt: null,
          status: "started",
        },
        store.makeId("TA")
      );

    return created(
      res,
      "Test started successfully",
      {
        attemptId: attempt.id,
        startedAt: attempt.startedAt,
        durationMinutes:
          test.durationMinutes,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// SUBMIT ANSWER
// =====================================================

async function submitAnswer(req, res, next) {
  try {
    const attempt =
      await store.getDoc(
        "testAttempts",
        req.params.attemptId
      );

    if (!attempt) {
      throw fail(
        404,
        "Attempt not found",
        "ATTEMPT_NOT_FOUND"
      );
    }

    if (attempt.status === "submitted") {
      throw fail(
        409,
        "Test has already been submitted",
        "TEST_ALREADY_SUBMITTED"
      );
    }

    await requireStudentAccess(
      req.user,
      attempt.studentId
    );

    const {
      questionId,
      answer,
    } = req.body;

    if (!questionId) {
      throw fail(
        422,
        "questionId is required",
        "VALIDATION_ERROR"
      );
    }

    // Check question exists
    const question =
      await store.getDoc(
        "questions",
        questionId
      );

    if (!question) {
      throw fail(
        404,
        "Question not found",
        "QUESTION_NOT_FOUND"
      );
    }

    // Question must belong to this test
    if (
      question.testId !== attempt.testId
    ) {
      throw fail(
        400,
        "Question does not belong to this test",
        "INVALID_QUESTION"
      );
    }

    const existing =
      await store.findOne(
        "answers",
        [
          ["attemptId", "==", attempt.id],
          ["questionId", "==", questionId],
        ]
      );

    const answerData = {
      attemptId: attempt.id,
      questionId,
      answer: answer ?? null,
    };

    const savedAnswer = existing
      ? await store.updateDoc(
          "answers",
          existing.id,
          answerData
        )
      : await store.createDoc(
          "answers",
          answerData,
          store.makeId("ANS")
        );

    return ok(
      res,
      "Answer saved successfully",
      savedAnswer
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// SUBMIT COMPLETE TEST
// =====================================================

async function submitTest(req, res, next) {
  try {
    const attempt =
      await store.getDoc(
        "testAttempts",
        req.params.attemptId
      );

    if (!attempt) {
      throw fail(
        404,
        "Attempt not found",
        "ATTEMPT_NOT_FOUND"
      );
    }

    if (attempt.status === "submitted") {
      throw fail(
        409,
        "Test has already been submitted",
        "TEST_ALREADY_SUBMITTED"
      );
    }

    await requireStudentAccess(
      req.user,
      attempt.studentId
    );

    const test =
      await store.getDoc(
        "tests",
        attempt.testId
      );

    if (!test) {
      throw fail(
        404,
        "Test not found",
        "TEST_NOT_FOUND"
      );
    }

    const questionList =
      await store.listDocs(
        "questions",
        [["testId", "==", attempt.testId]]
      );

    const answers =
      await store.listDocs(
        "answers",
        [["attemptId", "==", attempt.id]]
      );

    let correct = 0;
    let obtainedMarks = 0;

    questionList.forEach(
      (question) => {
        const submittedAnswer =
          answers.find(
            (item) =>
              item.questionId ===
              question.id
          );

        if (
          submittedAnswer &&
          submittedAnswer.answer ===
            question.answer
        ) {
          correct += 1;

          obtainedMarks +=
            Number(question.marks || 1);
        }
      }
    );

    const totalMarks =
      questionList.reduce(
        (sum, item) =>
          sum + Number(item.marks || 1),
        0
      );

    const attempted =
      answers.filter(
        (item) =>
          item.answer !== null &&
          item.answer !== undefined &&
          item.answer !== ""
      ).length;

    const wrong =
      Math.max(
        attempted - correct,
        0
      );

    const unattempted =
      Math.max(
        questionList.length -
          attempted,
        0
      );

    const percentage =
      totalMarks > 0
        ? Number(
            (
              (obtainedMarks /
                totalMarks) *
              100
            ).toFixed(2)
          )
        : 0;

    const result =
      await store.createDoc(
        "results",
        {
          testId: attempt.testId,
          studentId: attempt.studentId,
          obtainedMarks,
          totalMarks,
          percentage,
          correct,
          wrong,
          unattempted,
          date: new Date()
            .toISOString()
            .slice(0, 10),
        },
        store.makeId("RES")
      );

    await store.updateDoc(
      "testAttempts",
      attempt.id,
      {
        status: "submitted",
        submittedAt:
          new Date().toISOString(),
      }
    );

    return ok(
      res,
      "Test submitted successfully",
      result
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createTest,
  updateTest,
  deleteTest,
  upcomingTests,
  testDetails,
  questions,
  createQuestion,
  startTest,
  submitAnswer,
  submitTest,
};