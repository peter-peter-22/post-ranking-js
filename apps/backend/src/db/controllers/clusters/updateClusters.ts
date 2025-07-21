import axios from "axios";
import { env } from "../../../zod/env";

export async function updateUserClusters() {
    console.log("Updating user clusters.")
    try {
        await axios.get(env.CLUSTERING_API_URL + "/clustering")
    }
    catch (err) {
        console.error("Error while updating user clusters:", err)
    }
    console.log("Updated user clusters.")
}