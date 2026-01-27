import express from "express";
import { registerOwner } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerOwner);
;

export default router;
