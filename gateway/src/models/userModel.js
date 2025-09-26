import pool from "../config/db.js";

export const createUserTable = async () => {
	const queryText = `
        CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        token TEXT,
        
        is_verified BOOLEAN DEFAULT FALSE,
        verify_otp TEXT,
        verify_otp_expire_at BIGINT,

        reset_otp TEXT,
        reset_otp_expire_at BIGINT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try{
        await pool.query(queryText);
        console.log("User table created if not exists");
    }catch(error){
        console.log("Error creating users table: ", error);
    }
};
