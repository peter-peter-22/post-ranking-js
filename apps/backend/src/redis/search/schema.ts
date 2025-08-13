import { redisClient } from '../connect';
import { SchemaFieldTypes } from 'redis';
import { createIndexIfNotExists } from './schemaTools';

export async function initializeRedisSearch() {

  // posts
  await createIndexIfNotExists("posts",
    async (name) => {
      await redisClient.ft.create(name, {
        text: { type: SchemaFieldTypes.TEXT },
        replyingTo: { type: SchemaFieldTypes.TAG },
        userId: { type: SchemaFieldTypes.TAG },
        createdAt: { type: SchemaFieldTypes.NUMERIC, SORTABLE: true },
        rootPostId: { type: SchemaFieldTypes.TAG },
        isReply:{type:SchemaFieldTypes.TAG},
        // Expiration and anchors,
        publicExpires: { type: SchemaFieldTypes.NUMERIC, SORTABLE: true },
        rankingExists: { type: SchemaFieldTypes.TAG },
        rankingExpires: { type: SchemaFieldTypes.NUMERIC, SORTABLE: true },
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
        publicExpires: { type: SchemaFieldTypes.NUMERIC, SORTABLE: true },
        privateExpires: { type: SchemaFieldTypes.NUMERIC, SORTABLE: true },
        privateDataExists: { type: SchemaFieldTypes.TAG }
      }, {
        ON: 'HASH',
        PREFIX: ['user:']
      });
    }
  )

  // engagement histories
  await createIndexIfNotExists("engagementHistories",
    async (name) => {
      await redisClient.ft.create(name, {
        publisherId: { type: SchemaFieldTypes.TAG },
        viewerId: { type: SchemaFieldTypes.TAG },
      }, {
        ON: 'HASH',
        PREFIX: ['engagementHistory:']
      });
    }
  )

  console.log("Redis inexes created")
}