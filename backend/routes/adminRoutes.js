const express = require("express");
const {
  authenticateUser,
  roleMiddleware,
  verifyAdminToken,
} = require("../middleware/authMiddleware");
const {
  loginAdmin,
  getAllCertificates,
  getSingleCertificate,
  updateSingleCertificate,
  deleteSingleCertificate,
  addStudentCredentials,
  logoutAdmin,
  uploadFile,
  getNotification,
  deleteNotification,
  markNotificationAsRead,
  createUserByAdmin,
  editUserAccount,
  deleteUserAccount,
  getRegistrarUsers,
  upload,
  getAllUsers,
  updateExternalUser,
  deleteExternalUser,
  loginLimiter,
  createInitialAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/login", loginLimiter, loginAdmin);
router.post("/create-initial-admin", createInitialAdmin);
router.get("/logout", logoutAdmin);

router.get(
  "/users",
  authenticateUser,
  roleMiddleware(["admin"]),
  getRegistrarUsers
);
router.post(
  "/createUser",
  authenticateUser,
  roleMiddleware(["admin"]),
  createUserByAdmin
);
router.put(
  "/editUser/:id",
  upload.single("photo"),
  authenticateUser,
  roleMiddleware(["admin"]),

  editUserAccount
);
router.delete(
  "/deleteUser/:userId",
  authenticateUser,
  roleMiddleware(["admin"]),
  deleteUserAccount
);

router.post(
  "/addStudents",
  authenticateUser,
  roleMiddleware(["admin", "registrar"]),
  addStudentCredentials
);

router.post(
  "/upload",
  roleMiddleware(["admin", "registrar"]),
  authenticateUser,
  uploadFile
); // Ensure this matches your backend route

router.get(
  "/certificates",
  authenticateUser,
  roleMiddleware(["admin", "registrar"]),
  getAllCertificates
);
router.get(
  "/externalUsers",
  authenticateUser,
  roleMiddleware(["admin", "registrar"]),
  getAllUsers
);
router.put(
  "/externalUsers/:id",
  authenticateUser,
  roleMiddleware(["admin", "registrar"]),
  updateExternalUser
);
router.delete(
  "/externalUsers/:id",
  authenticateUser,
  roleMiddleware(["admin", "registrar"]),
  deleteExternalUser
);
router.get("/notifications", getNotification);
router.delete("/notifications/:id", deleteNotification);
router.put("/notifications/:id/read", markNotificationAsRead);
router.get("/certificates/:certificateID", getSingleCertificate);
router.delete(
  "/certificates/:certificateID",
  authenticateUser,
  roleMiddleware(["admin", "registrar"]),
  deleteSingleCertificate
);
router.put(
  "/certificates/:certificateID/edit",
  authenticateUser,
  roleMiddleware(["admin", "registrar"]),
  updateSingleCertificate
);

module.exports = router;
