import crypto from "crypto";

/** Generate a random string */
export function generateRandomKey(length:number) {
    return crypto.randomBytes(length).toString('hex');
}