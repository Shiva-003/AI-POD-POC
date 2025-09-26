import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PASSWORD_RESET_TEMPLATE, VERIFY_EMAIL_TEMPLATE, WELCOME_TEMPLATE } from '../config/emailTemplates.js';
import handleResponse from '../utils/responseHandler.js';
import { v4 } from 'uuid';
import pool from '../config/db.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return handleResponse(res, 400, 'Invalid Credentials');
    }

    try {
        // 1. Check if user exists
        const existingUserQuery = await pool.query(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );

        if (existingUserQuery.rows.length > 0) {
            return handleResponse(res, 409, 'User already exists');
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = v4();

        // 3. Create new user
        const newUserQuery = await pool.query(
            `INSERT INTO users (id, name, email, password, is_verified)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, is_verified`,
            [userId, name, email, hashedPassword, false]
        );

        const newUser = newUserQuery.rows[0];
        console.log("yoo new user", newUser);

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );

        // 5. Store token in DB (optional)
        await pool.query(
            `UPDATE users SET token = $1 WHERE id = $2`,
            [token, newUser.id]
        );

        // 6. Set token as cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === 'prod',
            sameSite: process.env.ENVIRONMENT === 'prod' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // 7. Send welcome email
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Welcome to MediBuddy',
            html: WELCOME_TEMPLATE.replace('{{email}}', email)
        };

        await transporter.sendMail(mailOptions);

        return handleResponse(res, 201, 'User registered successfully', {
            name: newUser.name,
            email: newUser.email,
            isVerified: newUser.is_verified
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return handleResponse(res, 400, 'Invalid credentials');
    }

    try {
        const userQuery = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (userQuery.rows.length === 0) {
            return handleResponse(res, 401, 'Invalid credentials');
        }

        const user = userQuery.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return handleResponse(res, 401, 'Invalid credentials');
        }

        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // Store token in DB
        await pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id]);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === 'prod',
            sameSite: process.env.ENVIRONMENT === 'prod' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return handleResponse(res, 200, 'Login successful', {
            name: user.name,
            email: user.email,
            isVerified: user.is_verified
        });

    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        // Clear token from DB (session invalidation)
        if (req.user?.id) {
            await pool.query('UPDATE users SET token = NULL WHERE id = $1', [req.user.id]);
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === 'prod',
            sameSite: process.env.ENVIRONMENT === 'prod' ? 'none' : 'strict',
        });

        return handleResponse(res, 200, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
};

export const sendVerificationOtp = async (req, res, next) => {
    try {
        const { id: userId, email, is_verified } = req.user;

    if (is_verified) {
      return handleResponse(res, 400, 'Account already verified');
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expireAt = Date.now() + 5 * 60 * 1000;

    await pool.query(
      `UPDATE users
       SET verify_otp = $1,
           verify_otp_expire_at = $2
       WHERE id = $3`,
      [otp, expireAt, userId]
    );

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Account Verification OTP',
      html: VERIFY_EMAIL_TEMPLATE
        .replace('{{email}}', email)
        .replace('{{otp}}', otp),
    };

    await transporter.sendMail(mailOptions);

    return handleResponse(res, 200, 'Verification OTP sent to email');
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { otp } = req.body;
    const userId = req.user.id;

    if (!otp) {
      return handleResponse(res, 400, 'OTP is required');
    }

    const userQuery = await pool.query(
      `SELECT verify_otp, verify_otp_expire_at FROM users WHERE id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return handleResponse(res, 404, 'User not found');
    }

    const user = userQuery.rows[0];

    if (!user.verify_otp || user.verify_otp !== otp) {
      return handleResponse(res, 400, 'Invalid OTP');
    }

    if (user.verify_otp_expire_at < Date.now()) {
      return handleResponse(res, 400, 'OTP expired');
    }

    await pool.query(
      `UPDATE users
       SET is_verified = TRUE,
           verify_otp = NULL,
           verify_otp_expire_at = NULL
       WHERE id = $1`,
      [userId]
    );

    return handleResponse(res, 200, 'Email verified successfully');
    } catch (error) {
        console.error(error);
        return handleResponse(res, 500, error.message);
    }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    return handleResponse(res, 200, '', req.user);
  } catch (error) {
    next(error);
  }
};


export const sendResetOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return handleResponse(res, 400, 'Email is required');
        }

        const userQuery = await pool.query(
            `SELECT id, email FROM users WHERE email = $1`,
            [email]
        );
        if (userQuery.rows.length === 0) {
            return handleResponse(res, 404, 'User not found');
        }

        const user = userQuery.rows[0];

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expireAt = Date.now() + 5 * 60 * 1000;

        await pool.query(
            `UPDATE users
             SET reset_otp = $1,
                 reset_otp_expire_at = $2
             WHERE id = $3`,
            [otp, expireAt, user.id]
        );

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP',
            html: PASSWORD_RESET_TEMPLATE
                .replace('{{email}}', user.email)
                .replace('{{otp}}', otp),
        };
        await transporter.sendMail(mailOptions);

        return handleResponse(res, 200, 'Password reset OTP sent to email');
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return handleResponse(res, 400, 'Missing details');
        }

        const userQuery = await pool.query(
            `SELECT id, reset_otp, reset_otp_expire_at
             FROM users WHERE email = $1`,
            [email]
        );
        if (userQuery.rows.length === 0) {
            return handleResponse(res, 404, 'User not found');
        }

        const user = userQuery.rows[0];

        if (!user.reset_otp || user.reset_otp !== otp) {
            return handleResponse(res, 400, 'Invalid OTP');
        }

        if (user.reset_otp_expire_at < Date.now()) {
            return handleResponse(res, 400, 'OTP expired');
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users
             SET password = $1,
                 reset_otp = NULL,
                 reset_otp_expire_at = NULL
             WHERE id = $2`,
            [hashedPass, user.id]
        );

        return handleResponse(res, 200, 'Password reset successfully');
    } catch (error) {
        next(error);
    }
};