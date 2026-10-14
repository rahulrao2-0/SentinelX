import express from "express";

const router = express.Router();
import { SignupProjectAdministrator ,LoginUser ,SignupProjectEngineer} from "../controllers/auth.js";

router.post("/SignupProjectAdministrator", SignupProjectAdministrator);
router.post("/LoginUser", LoginUser);
router.post("/SignupProjectEngineer", SignupProjectEngineer);
export default router;