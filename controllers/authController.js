// src/controllers/auth.controller.js
const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const userData = await authService.registerUser({ name, email, password, role });
    return res.status(201).json({
      message: 'User registered successfully',
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tokenData = await authService.loginUser({ email, password });
    return res.status(200).json({
      message: 'Login successful',
      data: tokenData
    });
  } catch (error) {
    next(error);
  }
};
