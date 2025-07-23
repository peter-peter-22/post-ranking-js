import { Router } from 'express';

//routers

import bot from "./bots";
import reset from "./development/reset";
import home from './home';
import authenticate from "./authenticate";
import update from "./update";
import userActions from "./userActions/index";
import getPost from "./getPost";
import getUser from "./getUser";
import test from "./development/test";


const router = Router();

router.use(home);
router.use("/reset", reset);
router.use("/authenticate", authenticate);
router.use("/bots", bot);
router.use("/update", update);
router.use("/userActions", userActions);
router.use("/getPost", getPost)
router.use("/getUser", getUser)
router.use("/test", test)

export default router;