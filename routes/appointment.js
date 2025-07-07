import express from "express";
import {
  loadMyAppointments,
  makeAppointment,
} from "../controller/appointments.js";

const routes = express.Router();

routes.post("/new", makeAppointment);
routes.get("/reach", loadMyAppointments);

export default routes;
