// src/services/userService.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

/**
 * Admin: Get all users (excluding passwords)
 */
exports.getAllUsers = async () => {
  return User.find({}, "-password");
};

/**
 * Common: Get a user by ID (excluding password)
 */
exports.getUserById = async (userId) => {
  return User.findById(userId, "-password");
};

/**
 * Common: Update user details (handles password hashing if updated)
 */
exports.updateUser = async (userId, updateFields) => {
  if (updateFields.password) {
    const salt = await bcrypt.genSalt(10);
    updateFields.password = await bcrypt.hash(updateFields.password, salt);
  }
  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    select: "-password",
  });
  return updatedUser;
};

/**
 * Admin: Update user role
 */
exports.updateUserRole = async (userId, newRole) => {
  return User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, select: "-password" }
  );
};

/**
 * Common: Delete a user by ID
 */
exports.deleteUser = async (userId) => {
  return User.findByIdAndDelete(userId);
};

/**
 * Admin: Create a new user
 */
exports.createUser = async (userData) => {
  // Hash password if provided
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }
  const newUser = new User(userData);
  await newUser.save();
  // Convert document to object and remove password field before returning
  const userObj = newUser.toObject();
  delete userObj.password;
  return userObj;
};
