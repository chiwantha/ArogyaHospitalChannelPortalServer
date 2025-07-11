import express from "express";
import {
  loadAdminAppointmentList,
  loadMyAppointments,
  makeAppointment,
  updateAppointment,
} from "../controller/appointments.js";

const routes = express.Router();

routes.post("/new", makeAppointment);
routes.get("/reach", loadMyAppointments);
routes.get("/reachAdmin", loadAdminAppointmentList);
routes.put("/update", updateAppointment);

export default routes;
