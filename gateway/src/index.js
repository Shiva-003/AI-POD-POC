import express from 'express';
import cors from 'cors';
import errorHandling from './middlewares/errorHandler.js';
import { randomBytes } from 'crypto';
import cookieParser from 'cookie-parser';

import pool from './config/db.js';
import { createUserTable } from './models/userModel.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import { createHistoryTable } from './models/userHistoryModel.js';

const port = process.env.port || 3000;


// Uncomment this to generate a key for jwt
// console.log("Key", randomBytes(64).toString('hex'));

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow React frontend
const allowedOrigins = ['http://localhost:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Error handling middleware
app.use(errorHandling);

// Create table before starting server
createUserTable();
createHistoryTable();

// Testing POSTGRES Connection
app.get('/', async (req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send(`The database name is: ${result.rows[0].current_database}`);
})

app.listen(port, () => console.log('Gateway listening on :3000'));
