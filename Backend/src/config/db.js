import mysql from "mysql2/promise";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,

    waitForConnections:true,
    connectionLimit:20,
    queueLimit:10,
    enableKeepAlive:true
});

const connectDB = async ()=>{
    try{
        const connection = await pool.getConnection();
        console.log("Database connected successfully");

        connection.release();
    }catch(err){
        console.error("Error connecting to database:", err.message );

        process.exit(1);

    }
};

export { pool ,connectDB};