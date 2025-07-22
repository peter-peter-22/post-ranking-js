import { User } from "@me/schemas/src/zod/user";
import { exampleImage, exampleImageFlat } from "./files";

export const exampleUser:User = {
    id:"user-id",
    name: `Username`,
    handle: `userhandle`,
    description: "This is the description of this profile.",
    createdAt: new Date(),
    followers: 1000,
    following: 1000,
    profileImage:exampleImage,
    profileBanner:exampleImageFlat
}

export const exampleUserLong:User = {
    id:"user-id-123456789-123456789-123456789-123456789-123456789-123456789",
    name: `UsernameUsernameUsernameUsernameUsernameUsernameUsernameUsernameUsernameUsernameUsernameUsername`,
    handle: `userhandleuserhandleuserhandleuserhandleuserhandleuserhandleuserhandleuserhandleuserhandleuserhandleuserhandle`,
    description: "This is the description of this profileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofileprofile.",
    createdAt: new Date(),
    followers: 1000,
    following: 1000
}