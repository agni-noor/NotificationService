import express from "express"
import { connectRabbitMQ } from './queue/rabbitmq.js';

const app = express();
const PORT = 3000;
app.use(express.json());

import smsRoutes from "./routes/sms.js";
import emailRoutes from "./routes/email.js"

const startServer = async () => {
    try {
      await connectRabbitMQ();

      app.use("/sms", smsRoutes);
      app.use("/email", emailRoutes)
  
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Error starting server:', error.message);
      process.exit(1); 
    }
  };
  
  startServer();

