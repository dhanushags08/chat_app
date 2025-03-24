import express from "express";
import {
  signup,
  login,
  logout,
  update_profile,
  check_auth,
} from "../controllers/auth.controller.js";
import { protect_route } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protect_route, update_profile);

router.get("/check", protect_route, check_auth);

export default router;
