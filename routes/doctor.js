import express from "express";
import {
  loadFullProfileData,
  loadList,
  loadProfile,
  loadSessions,
  loadSpecialization,
} from "../controller/doctors.js";
const routes = express.Router();

routes.get("/list", loadList);
routes.get("/specialization", loadSpecialization);
routes.get("/profile", loadProfile);
routes.get("/sessions", loadSessions);
routes.get("/fullprofile", loadFullProfileData);

export default routes;
