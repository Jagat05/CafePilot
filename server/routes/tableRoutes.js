import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import { isOwner } from "../middlewares/roleMiddleware.js";
import { createTable, getTables } from "../controllers/tableController.js";

const tableRouter = express.Router();

tableRouter.post("/createtable", authMiddleware, isOwner, createTable);
tableRouter.get("/table", authMiddleware, isOwner, getTables);

export default tableRouter;
