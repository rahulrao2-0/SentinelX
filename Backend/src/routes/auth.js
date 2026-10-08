import express from "express";

const router = express.Router();
import { SignupUser } from "../controllers/auth.js";

router.post("/Signup", SignupUser);

export default router;