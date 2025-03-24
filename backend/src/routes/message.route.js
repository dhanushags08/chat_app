import express from "express";
import { protect_route } from "../middleware/auth.middleware.js";
import {
  get_users_for_sidebar,
  get_messages,
  send_message,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protect_route, get_users_for_sidebar);
router.get("/:id", protect_route, get_messages);

router.post("/send/:id", protect_route, send_message);

export default router;
