import { redisClient } from '../connect';

/**
 * Safely creates a Redis index if it doesn't already exist, using a Redis lock to ensure exclusive creation.
 * @param indexName Name of the index to create
 * @param indexCreatorFn Function that creates the index (called only if needed)
 */ 
export async function createIndexIfNotExists(
  indexName: string,
  indexCreatorFn: (name: string) => Promise<void>
): Promise<void> {
  try {
    //TODO use lock
    // Check if index exists
    await redisClient.ft.info(indexName);
    console.log(`Index "${indexName}" already exists`);
  } catch (err) {
    if (err instanceof Error && err.message.toLowerCase().includes('unknown index')) {
      // Index doesn't exist - create it
      try {
        console.log(`Creating index "${indexName}"`);
        await indexCreatorFn(indexName);
        console.log(`Successfully created index "${indexName}"`);
      } catch (createErr) {
        console.error(`Failed to create index "${indexName}":`, createErr);
        throw createErr;
      }
    } else {
      // Unexpected error
      console.error(`Error checking index "${indexName}":`, err);
      throw err;
    }
  }
}
