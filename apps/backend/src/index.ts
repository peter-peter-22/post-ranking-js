import cors from 'cors';
import express from 'express';
import "express-async-errors";
import { db } from './db';
import { errorHandler } from './middlewares/errorHandler';
import { redisClient } from './redis/connect';
import { jobQueue, worker } from './redis/jobs/queue';
import routes from "./routes";
import { hazelClient } from './hazelcast/connect';

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
    jobQueue.close(),
    worker.close(),
    db.$client.end(),
    hazelClient.shutdown()
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
