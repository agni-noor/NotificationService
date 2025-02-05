import express from "express";
import { enqueueEmail } from "../controllers/emailController";

const router = express.Router();

router.post("/enqueue",enqueueEmail);

export default router;
