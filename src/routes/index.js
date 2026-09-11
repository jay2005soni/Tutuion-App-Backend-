const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/parents", require("./parentRoutes"));
router.use("/students", require("./studentRoutes"));
router.use("/parent", require("./dashboardRoutes"));
router.use("/attendance", require("./attendanceRoutes"));
router.use("/homework", require("./homeworkRoutes"));
router.use("/tests", require("./testRoutes"));
router.use("/test-attempts", require("./testAttemptRoutes"));
router.use("/results", require("./resultRoutes"));
router.use("/notes", require("./noteRoutes"));
router.use("/fees", require("./feeRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/announcements", require("./announcementRoutes"));
router.use("/notifications", require("./notificationRoutes"));
router.use("/profile", require("./profileRoutes"));
router.use("/tutors", require("./tutorRoutes"));
router.use("/admin", require("./adminRoutes"));

module.exports = router;
