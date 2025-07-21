import { Router } from 'express';
import scenes from "./scenes";
import userTypes from "./userTypes";

const router = Router();

router.use("/scenes", scenes)
router.use("/userType", userTypes)

export default router;