import express from "express";
import { enqueueEmail } from '../controllers/email.js';

const router = express.Router();



router.post('/enqueue', enqueueEmail);

export default router;