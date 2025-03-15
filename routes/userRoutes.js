// src/routes/user.routes.js
const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

/**
 * 1. Admin-Only Endpoints
 */

// Get all users
router.get("/", verifyToken, isAdmin, userController.getAllUsers);

// Add a new user by admin
router.post("/admin", verifyToken, isAdmin, userController.addUserByAdmin);

// Get a specific user by ID (Admin)
router.get(
  "/admin/:userId",
  verifyToken,
  isAdmin,
  userController.getUserByAdmin
);

// Update any user by ID (Admin)
router.put(
  "/admin/:userId",
  verifyToken,
  isAdmin,
  userController.updateUserByAdmin
);

// Delete any user by ID (Admin)
router.delete(
  "/admin/:userId",
  verifyToken,
  isAdmin,
  userController.deleteUserByAdmin
);

/**
 * 2. Regular User Endpoints
 */

// Get logged-in user's profile
router.get("/profile", verifyToken, userController.getUserProfile);

// Update own profile
router.put("/profile", verifyToken, userController.updateOwnProfile);

// Delete own profile
router.delete("/profile", verifyToken, userController.deleteOwnProfile);

module.exports = router;
