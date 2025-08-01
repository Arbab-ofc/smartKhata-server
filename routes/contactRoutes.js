import express from "express";
import { createContactMessage } from "../controllers/contactController.js";

const ContactRouter = express.Router();

ContactRouter.post("/create", createContactMessage);

export default ContactRouter;
