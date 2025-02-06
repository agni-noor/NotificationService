import express, { Application } from "express";
import dotenv from "dotenv";
import { connectRabbitMQ } from "./queue/rabbitmq";
// import smsRoutes from "./routes/sms";
import emailRoutes from "./routes/email";

dotenv.config();

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

const startServer = async (): Promise<void> => {
  try {
    await connectRabbitMQ();

    // app.use("/sms", smsRoutes);
    app.use("/email", emailRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", (error as Error).message);
    process.exit(1);
  }
};


startServer();

