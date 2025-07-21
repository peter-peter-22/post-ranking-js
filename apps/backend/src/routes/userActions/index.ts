import { Router } from 'express';

import commentSection from "./posts/commentSection";
import createPost from './posts/createPost';
import feed from "./posts/feed";
import contentsOfuser from "./posts/getContentsOfUser";
import relevantPosts from "./posts/relevantPosts";
import signPostUpload from "./posts/requestUploadKey";
import searchPosts from "./posts/search";
import trendFeeds from "./trends/trendFeeds";
import follow from "./users/follow";
import searchUsers from "./users/search";
import whoToFollow from "./users/whoToFollow";
import updatePost from "./posts/updatePost";
import deletePost from "./posts/deletePost";
import postCreatorTextPrediction from "./posts/postCreatorTextPrediction";
import signUserUpload from "./users/requestUploadKeys";
import updateUser from "./users/updateUser";
import like from "./posts/like";
import regularUpdates from "./regularUpdates";
import listFollows from "./users/listFollows";
import notifications from "./notifications/notificationList";

const router = Router();

router.use("/signPostUpload", signPostUpload)
router.use("/create", createPost)
router.use("/feed", feed)
router.use("/relevantPosts", relevantPosts)
router.use("/commentSection", commentSection)
router.use("/userContents", contentsOfuser)
router.use("/follow", follow)
router.use("/whoToFollow", whoToFollow)
router.use("/searchPosts", searchPosts)
router.use("/searchUsers", searchUsers)
router.use("/trends", trendFeeds)
router.use("/updatePost", updatePost)
router.use("/deletePost", deletePost)
router.use("/postCreatorTextPrediction", postCreatorTextPrediction)
router.use("/signUserUpload", signUserUpload)
router.use("/updateUser", updateUser)
router.use("/like", like)
router.use("/regularUpdates", regularUpdates)
router.use("/listFollows", listFollows)
router.use("/notifications", notifications)

export default router;