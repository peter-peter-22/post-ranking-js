import { redisClient } from '../connect';
import { SchemaFieldTypes } from 'redis';
import { createIndexIfNotExists } from './schemaTools';

export async function initializeRedisSearch() {

  // posts
  await createIndexIfNotExists("posts",
    async (name) => {
      await redisClient.ft.create(name, {
        replyingTo: { type: SchemaFieldTypes.TAG },
        userId: { type: SchemaFieldTypes.TAG },
        createdAt: { type: SchemaFieldTypes.NUMERIC, SORTABLE: true },
      }, {
        ON: 'HASH',
        PREFIX: ['post:']
      });
    }
  )

  // users
  await createIndexIfNotExists("users",
    async (name) => {
      await redisClient.ft.create(name, {
        handle: { type: SchemaFieldTypes.TAG },
      }, {
        ON: 'HASH',
        PREFIX: ['user:']
      });
    }
  )

  console.log("Redis inexes created")
}