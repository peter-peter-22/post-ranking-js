import { Post } from "../types/post";
import { exampleImage, exampleImageFlat, exampleImageTall } from "./files";
import { exampleUser } from "./user";

export const examplePost: Post = {
    id: "post-id",
    text: "This is an example post.",
    createdAt: new Date(),
    user: exampleUser,
    files: [exampleImage,exampleImageFlat,exampleImageTall,exampleImage,exampleImage]
}