import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { serve } from 'inngest/express';
import userRouter from './router/user.js';
import ticketRouter from './router/ticket.js';
import { inngest } from './ingest/client.js';
import { onTicketCreate } from './ingest/functions/on-ticket-create.js';
import { onSignup } from './ingest/functions/on-signup.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());


app.use("/api/user", userRouter);
app.use("/api/tickets", ticketRouter);

app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions: [onSignup, onTicketCreate],
    })
);



mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-task-assistant').then
    (() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

