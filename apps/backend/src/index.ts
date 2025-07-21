import cors from 'cors';
import express from 'express';
import "express-async-errors";
import { errorHandler } from './middlewares/errorHandler';
import routes from "./routes";
import { redisClient } from './redis/connect';
import { db } from './db';
import { updateQueue, updateWorker } from './jobs/updates';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(routes);

// Error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Close connections on shutdown
function shutdown() {
  console.log('Shutting down gracefully...');
  Promise.all([
    redisClient.quit(),
    updateQueue.close(),
    updateWorker.close(),
    db.$client.end()
  ])
    .then(() => {
      console.log('Connections closed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during shutdown:', err);
      process.exit(1);
    });
}

// Listen for termination signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
