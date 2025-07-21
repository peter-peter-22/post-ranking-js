import { z } from 'zod';

export const countSchema = z.coerce
    .number()
    .int()
    .positive();

export const countRoute = z.object({
    count: countSchema
})