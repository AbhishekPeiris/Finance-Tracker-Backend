// src/controllers/user.controller.js
const userService = require("../services/userService");

/**
 * Admin-Only: Get all users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * Regular User: Get their own profile (from JWT)
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // from JWT
    const user = await userService.getUserById(userId);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Regular User: Update their own profile
 */
exports.updateOwnProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // from JWT
    const updatedUser = await userService.updateUser(userId, req.body);
    res.json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Regular User: Delete their own profile
 */
exports.deleteOwnProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // from JWT
    const deletedUser = await userService.deleteUser(userId);
    res.json({
      message: "Your account has been successfully deleted.",
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-Only: Update any user's role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId, newRole } = req.body;
    const updatedUser = await userService.updateUserRole(userId, newRole);
    res.json({
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-Only: Delete any user by ID
 */
exports.deleteUserByAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params; // e.g., /api/users/admin/123
    const deletedUser = await userService.deleteUser(userId);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ message: `User with ID ${userId} not found.` });
    }

    res.status(200).json({
      message: `User with ID ${userId} has been successfully deleted by admin.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-Only: Get a specific user by ID
 */
exports.getUserByAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params; // e.g., /api/users/admin/123
    const user = await userService.getUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: `User with ID ${userId} not found.` });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-Only: Update (edit) any user by ID
 */
exports.updateUserByAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params; // e.g., /api/users/admin/123
    const updatedUser = await userService.updateUser(userId, req.body);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: `User with ID ${userId} not found.` });
    }
    res.status(200).json({
      message: "User updated successfully by admin.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-Only: Add (create) a new user
 */
exports.addUserByAdmin = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({
      message: "User added successfully by admin.",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};
