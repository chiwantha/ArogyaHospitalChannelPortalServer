import { db } from "../db.js";
import { sendSms } from "../services/sms.js";

export const makeAppointment = (req, res) => {
  const { session_id, patient, contact, alternate_contact, date, email, note } =
    req.body;

  if (
    session_id === null ||
    session_id === "" ||
    patient === null ||
    patient === "" ||
    contact === null ||
    contact === "" ||
    date === null ||
    date === ""
  ) {
    return res.status(404).json("Data Missing!");
  }

  const query = `INSERT INTO appointment (session_id, patient, contact, alternate_contact, date, email, note) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    session_id,
    patient,
    contact,
    alternate_contact === null
      ? "0"
      : alternate_contact == ""
      ? "0"
      : alternate_contact,
    date,
    email === null ? "None" : email == "" ? "None" : email,
    note === null ? "None" : note == "" ? "None" : note,
  ];

  db.query(query, values, async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data) {
      const message = `New Appointment from ${patient} / ${contact} , Visit Admin : https://portal.arogyahospitals.lk/admin`;
      await sendSms("0788806670", message);
      return res.status(200).json(data);
    }
  });
};

export const loadMyAppointments = (req, res) => {
  const my_number = req.query.contact;
  const query = `
    SELECT 
      appointment.id, 
      appointment.session_id, 
      doctors.name AS doctor_name, 
      session_type.name AS session_type, 
      session.start_time, 
      session.end_time, 
      session.fee, 
      appointment.patient, 
      appointment.contact, 
      appointment.alternate_contact, 
      appointment.date, 
      appointment.email, 
      appointment.note, 
      appointment.created_at,
      appointment.is_confirmed 
    FROM appointment 
    INNER JOIN session ON appointment.session_id = session.id 
    INNER JOIN doctors ON session.doctor_id = doctors.id 
    INNER JOIN session_type ON session.type_id = session_type.id 
    WHERE appointment.contact LIKE ? 
    OR appointment.alternate_contact LIKE ? AND appointment.state = 1;
  `;

  // Add wildcards to the search terms
  const searchTerm = `%${my_number}%`;

  db.query(query, [searchTerm, searchTerm], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const loadAdminAppointmentList = (req, res) => {
  const query = `
    SELECT 
      appointment.id, 
      appointment.session_id, 
      doctors.name AS doctor_name, 
      session_type.name AS session_type, 
      session.start_time, 
      session.end_time, 
      session.fee, 
      appointment.patient, 
      appointment.contact, 
      appointment.alternate_contact, 
      appointment.date, 
      appointment.email, 
      appointment.note, 
      appointment.created_at,
      appointment.is_printed,
      appointment.is_confirmed 
    FROM appointment 
    INNER JOIN session ON appointment.session_id = session.id 
    INNER JOIN doctors ON session.doctor_id = doctors.id 
    INNER JOIN session_type ON session.type_id = session_type.id 
    WHERE appointment.state = 1
    ORDER BY 
      CASE 
        WHEN appointment.is_printed = 0 THEN 0
        WHEN appointment.is_printed = 1 AND appointment.is_confirmed = 0 THEN 1
        ELSE 2
      END,
      appointment.created_at DESC
    LIMIT 120;
  `;

  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updateAppointment = (req, res) => {
  console.log(req.body);
  const appointment_id = req.body.id;
  const action = req.body.action;

  let updates = [];

  if (action == "approve") {
    updates.push(`is_confirmed = 1`);
  } else if (action == "reject") {
    updates.push(`is_confirmed = 0`);
  }

  if (action === "remove") {
    updates.push(`state = 0`);
  }

  if (action === "print") {
    updates.push(`is_printed = 1`);
  }

  // If no valid update, return error
  if (updates.length === 0) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const query = `UPDATE appointment SET ${updates.join(", ")} WHERE id = ?`;

  db.query(query, [appointment_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};
