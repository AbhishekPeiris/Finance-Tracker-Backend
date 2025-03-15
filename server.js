// src/server.js
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

        const server = http.createServer(app);
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
})();
