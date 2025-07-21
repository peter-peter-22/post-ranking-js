import z from "zod"

export const embeddingVector=z.array(z.number()).length(384)