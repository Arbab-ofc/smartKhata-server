import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { dbConnect } from './utils/dbConnect.js';
import UserRouter from './routes/userRoutes.js';
import TransactionRouter from './routes/transactionRoutes.js';
import ContactRouter from './routes/contactRoutes.js';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://smart-khata-client.vercel.app",// your frontend URL
    credentials: true, // allow sending cookies (important for auth)
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', UserRouter);
app.use("/api/transactions", TransactionRouter);
app.use("/api/contact", ContactRouter);





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    dbConnect()
        .then(() => console.log('Database connected successfully'))
        .catch(err => console.error('Database connection failed:', err));
}
);