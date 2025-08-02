import { redisClient } from '../connect';
import { SchemaFieldTypes } from 'redis';

export async function initializeRedisSearch() {

  // comment section ranking
  await redisClient.ft.create('replies', {
    '$.replyingTo': { type: SchemaFieldTypes.TAG, AS: 'replyingTo' },
    '$.userId': { type: SchemaFieldTypes.TAG, AS: 'userId' },
    '$.createdIt': { type: SchemaFieldTypes.NUMERIC, AS: 'createdIt', SORTABLE: true },
  }, {
    ON: 'HASH',       // Index Hashes
    PREFIX: ['post:', 'content:']   // Only index keys starting with "post:"
  });

}