import express from "express";
import { smsProviders } from "../const.js";
// import { sendSMS } from "../controllers/sms.js";
import { enqueueSMS } from '../controllers/sms.js';

const router = express.Router();

// router.post("/sendsms", async (req, res) => {
//     const { phone, text } = req.body;
  
//     if (!phone || !text) {
//       return res.status(400).json({ error: "Phone and text are required." });
//     }
  
//     try {
//       const result = await sendSMS(smsProviders, { phone, text }, "sms");
//       res.status(200).json(result);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

router.post('/enqueue', enqueueSMS);

//add services
//zod validation library

export default router;