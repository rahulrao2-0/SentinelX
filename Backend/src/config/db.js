import mysql from "mysql2/promise";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
    host:"localhost",
    port:3306,
    user:"root",
    password:"yadavrahul20",
    database:"SentinelX",

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