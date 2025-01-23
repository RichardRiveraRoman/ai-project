import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import mongoose from 'mongoose';
// import userRoutes from './routes/userRoutes.js';
// import oauthRoutes from './routes/oauthRoutes.js';
import {
  notFoundMiddleware,
  errorHandler,
} from './middlewares/errorMiddleware.js';

// PORT defined in .env or defaults to 3000
const PORT = process.env.PORT || 3000;

const app = express();

// Enable CORS (Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/user', userRoutes); // normal user signup/login
// app.use('/api/oauth', oauthRoutes); // GitHub OAuth

// 404 or “Not Found” Handler
app.use(notFoundMiddleware);
app.use(errorHandler);

// MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error(MONGO_URI);
  process.exit(1);
}

// MongoClientOptions object to set the Stable API version
const clientOptions = {
  serverApi: { version: '1' as const, strict: true, deprecationErrors: true },
};

// Start the server after connecting to MongoDB
async function startServer() {
  try {
    // Attempt to connect to MongoDB
    await mongoose.connect(MONGO_URI as string, clientOptions);
    console.log('Successfully connected to MongoDB!');

    // If DB connection is successful, start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // If DB connection fails, log the error and exit
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Gracefully shut down server when you CTRL-C
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown start');
  await mongoose.disconnect();
  process.exit(0);
});

// Initiate the startup sequence
startServer();
