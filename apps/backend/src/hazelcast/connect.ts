import { Client } from 'hazelcast-client';
import { env } from '../zod/env';

export const hazelClient = await Client.newHazelcastClient({
  clusterName: 'dev', 
  network: {
    clusterMembers: [env.HAZELCAST_URL] 
  }
});

console.log('Connected to Hazelcast!');