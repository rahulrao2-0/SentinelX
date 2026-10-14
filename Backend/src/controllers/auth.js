import {pool} from '../config/db.js';
import {v4 as uuidv4} from "uuid";

export const SignupProjectAdministrator = async (req,res)=>{
    const {name,projectName,email,password} = req.body;
    if(!name || !projectName || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    let connection;
    try{
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const userExistsQuery = 'SELECT id FROM users WHERE email = ?';
        const [existingUser] = await connection.execute(userExistsQuery, [email]);

        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const projectId = `proj_${uuidv4()}`;
        const apiKey = `${projectName}_api_${uuidv4()}`;

        const projectInsertQuery = 'INSERT INTO projects (id, name, api_key) VALUES (?, ?, ?)';
        await connection.execute(projectInsertQuery, [projectId, projectName, apiKey]);

        const userInsertQuery = 'INSERT INTO users (name, project_id, email, password_hash, role) VALUES (?, ?, ?, ?, ?)';
        const [result] = await connection.execute(userInsertQuery, [name, projectId, email, password, "admin"]);

        if(result.affectedRows === 0){
            await connection.rollback();
            return res.status(500).json({message:"Failed to create user"});
        }

        await connection.commit();

        return res.status(201).json({
            message: "Project and administrator created successfully",
            projectId,
            apiKey
        });

    }catch(err){
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error("Rollback error:", rollbackErr);
            }
        }
        console.error("SignupProjectAdministrator error:", err);
        return res.status(500).json({message:"Internal server error"});
    }finally{
        if (connection) {
            connection.release();
        }
    }
}

export const SignupProjectEngineer = async (req,res)=>{
    try{
        const{name,projectId,email,password}=req.body;
        if(!name || !projectId || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        const projectQuery = 'SELECT id FROM projects WHERE id = ?';
        const [projectRows] = await pool.execute(projectQuery, [projectId]);

        if (projectRows.length === 0) {
            return res.status(400).json({ message: "Project not found" });
        }

        const userExistsQuery = 'SELECT id FROM users WHERE email = ?';
        const [existingUser] = await pool.execute(userExistsQuery, [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const userInsertQuery = 'INSERT INTO users (name, project_id, email, password_hash, role) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.execute(userInsertQuery, [name, projectId, email, password, "engineer"]);

        if(result.affectedRows === 0){
            return res.status(500).json({message:"Failed to create user"});
        }

        return res.status(201).json({
            message: "Project engineer created successfully",
            userId: result.insertId
        });

    }catch(err){
        console.error("SignupProjectEngineer error:", err);
        return res.status(500).json({message:"Internal server error"});
    }
}

export const LoginUser = async (req,res)=>{
    try{

        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"Email and password are required"});
        }

       const query = `
      SELECT
        u.id,
        u.name,
        u.role,
        u.project_id,
        p.name AS project_name,
        p.api_key
      FROM users u
      JOIN projects p ON u.project_id = p.id
      WHERE u.email = ? AND u.password_hash = ?
    `
    const [rows] = await pool.execute(query, [email, password]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        return res.status(200).json({
            message: "Login successful",
            name: user.name,
            role: user.role,
            projectName: user.project_name,
            apiKey: user.api_key,
            projectId: user.project_id
        });

    }catch(err){
        console.error("LoginUser error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

