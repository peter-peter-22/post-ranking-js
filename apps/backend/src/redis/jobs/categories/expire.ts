import { handleAllPostExpirations } from "../../postContent/expire";
import { handleAllUserExpirations } from "../../users/expiration";
import { emptyJob } from "../emptyJob";

async function handleExpirations() {
    await Promise.all([
        handleAllPostExpirations,
        handleAllUserExpirations
    ])
}

export const expireJobs = emptyJob({
    name: "expire",
    defaultOptions: {
        repeat: { every: 5 * 60 * 1000 }
    },
    handler: handleExpirations
})