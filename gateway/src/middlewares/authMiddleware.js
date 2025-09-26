import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import handleResponse from '../utils/responseHandler.js';

const authMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        console.log("yoo token", token);
        if (!token) {
        return handleResponse(res, 401, 'Unauthorized user');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log("yoo decoded userID", decoded.userId);
        if (!decoded.userId) {
        return handleResponse(res, 401, 'Unauthorized user');
        }

        // Fetch full user record from DB
        const userQuery = await pool.query('SELECT id, name, email, is_verified FROM users WHERE id = $1 AND token = $2', [
        decoded.userId,
        token
        ]);

        if (userQuery.rows.length === 0) {
        return handleResponse(res, 401, 'Unauthorized user');
        }

        // Attach full user object
        req.user = userQuery.rows[0];

        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token expired or invalid' });
    }
};

export default authMiddleware;