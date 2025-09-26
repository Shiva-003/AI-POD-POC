import pool from "../config/db.js";
import handleResponse from "../utils/responseHandler.js";

export const getUserData = async (req, res, next) => {
    try{
        const { email } = req.user;

        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userQuery.rows.length === 0) {
            return handleResponse(res, 401, 'Invalid credentials');
        }

        const user = userQuery.rows[0];
    
        return handleResponse(res, 200, '', {
            name: user.name,
            email: user.email,
            isVerified: user.is_verified
        });
    }
    catch(error){
        next(error);
    }
}