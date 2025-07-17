import express from "express";
import { loadCounts } from "../controller/dashboards.js";

const routes = express.Router();

routes.get("/counts", loadCounts);

export default routes;
