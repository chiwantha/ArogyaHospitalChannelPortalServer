import express from "express";
import cors from "cors";

import doctor from "./routes/doctor.js";
import appointment from "./routes/appointment.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  cors({
    origin: "http://192.168.8.103:5173",
    // origin: "https://portal.aoryahospitals.lk",
  })
);

app.use("/server/doctors/", doctor);
app.use("/server/appointment/", appointment);

app.listen(8800, () => {
  console.log("Server Running !");
});
