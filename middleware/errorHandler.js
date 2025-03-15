// src/middlewares/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message || err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
};
