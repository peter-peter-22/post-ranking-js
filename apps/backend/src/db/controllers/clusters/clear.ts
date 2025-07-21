import { db } from "../..";
import { clusters } from "../../schema/clusters";

/** Delete the user clusters. Delete must be used instead of trunace, because the users table has a foreign key to the clusters table. */
export async function clearClusters() {
    await db.delete(clusters);
    console.log("Cleared clusters.");
}
