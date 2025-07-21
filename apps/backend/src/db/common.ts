import { varchar, vector } from "drizzle-orm/pg-core";

/** 384 dimensions vector for 'all-MiniLM-L6-v2' */
export const embeddingVector=(name:string)=>vector(name,{ dimensions: 384 })

/** A short text for a keyword. */
export const keyword=()=>varchar({ length: 50 })