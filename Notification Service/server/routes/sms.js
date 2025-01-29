import express from "express";
import { enqueueSMS } from '../controllers/sms.js';

const router = express.Router();



router.post('/enqueue', enqueueSMS);

export default router;