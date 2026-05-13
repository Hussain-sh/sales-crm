const express = require('express');
require('dotenv').config();

const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');

const client = require('./services/aiService');

const app = express();

const PORT = process.env.PORT;

app.use(express.json());

app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'http://localhost:3000'
    ],
    credentials: true
}));

const leadRoutes = require('./routes/leadRoutes');

const interactionRoutes = require('./routes/interactionRoutes');

app.use('/leads', leadRoutes);

app.use('/leads/:id/interactions', interactionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});