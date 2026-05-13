const express = require('express');
require('dotenv').config();

const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');

const client = require('./services/aiService');

const app = express();

const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';
const allowedOrigins = [
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS
        ? process.env.CLIENT_URLS.split(',').map((origin) => origin.trim())
        : []),
    'http://localhost:3000'
].filter(Boolean);

app.use(express.json());

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend is healthy'
    });
});

const leadRoutes = require('./routes/leadRoutes');

const interactionRoutes = require('./routes/interactionRoutes');

app.use('/leads', leadRoutes);

app.use('/leads/:id/interactions', interactionRoutes);

app.use(errorHandler);

app.listen(PORT, HOST, () => {
    console.log(`Server listening on port: ${PORT}`);
});
