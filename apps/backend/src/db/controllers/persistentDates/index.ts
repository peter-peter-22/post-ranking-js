import { eq } from "drizzle-orm";
import { db } from "../..";
import { persistentDates } from "../../schema/persistentDates";

/** Get a date from the db or return default. 
 * @param id - The id of the date to be retrieved.
 * @param defaultDate - The default date to be returned if the id does not exist in the db.
 * @returns The date that belongs to the id, or default.
*/
async function getPersistentDate(id: string, defaultDate: Date): Promise<Date> {
    //try to get the date from the db
    const [lastUpdate] = await db.select().from(persistentDates).where(eq(persistentDates.id, id))

    //if exists, return date
    if (lastUpdate)
        return lastUpdate.timestamp;

    //if doesn't exists, return the default date
    return defaultDate;
}

/** Upsert a date in the db.
 * @param id - The id of the date to be updated.
 * @param date - The date to be updated. If not provided, the current date will be used.
 */
async function setPersistendDate(id: string, date: Date ): Promise<void> {
    await db.update(persistentDates).set({ timestamp: new Date() })
    await db
        .insert(persistentDates)
        .values({ id, timestamp: date })
        .onConflictDoUpdate({
            target: persistentDates.id,
            set: { timestamp: date },
        });
}

/** Functions to get and set persistent date with a specified id. 
 * @param id - The id of the date to be retrieved or updated.
 * @param defaultDate - The default date to be returned if the id does not exist in the db.
 * @returns An object with get and set functions.
*/
export function persistentDate(id:string, defaultDate: Date=new Date(0)) {
    return{
        get: () => getPersistentDate(id, defaultDate),
        set: (date: Date= new Date()) => setPersistendDate(id, date),
    }
}