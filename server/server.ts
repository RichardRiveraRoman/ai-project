import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import userRoutes from './routes/userRoutes.ts';
import userController from './controllers/userController.ts';

// PORT defined in .env or defaults to 3000
const PORT = process.env.PORT || 3000;

const app = express();

//enable cors
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/user', userRoutes);

//error handler
app.use((err, _req, res) => {
  //default error object
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurrred' },
  };

  const errorObj = Object.assign({}, defaultErr, err);
  //log the error object
  console.log('Error object:', errorObj);

  return res.status(errorObj.status).json(errorObj.message);
});

//mongodb connection string from .env
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error(MONGO_URI);
  process.exit(1);
}

//mongoClientOptions object to set the stable api version
//i don't know what this part does
const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};

//start the server after connecting to mongodb
async function startServer() {
  try {
    //try to connect to MongoDB
    await mongoose.connect(MONGO_URI, clientOptions);
    console.log('Successfully connected to MongoDB!');

    //if connected, start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    //if connection fails, log error and exit
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

//gracefully shut down server with CTRL-C
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown start');
  await mongoose.disconnect();
  process.exit(0);
});

//invoke startServer
startServer();
