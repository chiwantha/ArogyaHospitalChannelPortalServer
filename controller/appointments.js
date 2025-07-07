import { db } from "../db.js";

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

  db.query(query, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
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
