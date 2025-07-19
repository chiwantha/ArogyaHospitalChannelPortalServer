import { db } from "../db.js";
import { sendWhatsappMessage } from "../services/whatsapp.js";

// export const makeAppointment = (req, res) => {
//   const { session_id, patient, contact, alternate_contact, date, email, note } =
//     req.body;

//   if (
//     session_id === null ||
//     session_id === "" ||
//     patient === null ||
//     patient === "" ||
//     contact === null ||
//     contact === "" ||
//     date === null ||
//     date === ""
//   ) {
//     return res.status(404).json("Data Missing!");
//   }

//   const query = `INSERT INTO appointment (session_id, patient, contact, alternate_contact, date, email, note) VALUES (?, ?, ?, ?, ?, ?, ?)`;

//   const values = [
//     session_id,
//     patient,
//     contact,
//     alternate_contact === null
//       ? "0"
//       : alternate_contact == ""
//       ? "0"
//       : alternate_contact,
//     date,
//     email === null ? "None" : email == "" ? "None" : email,
//     note === null ? "None" : note == "" ? "None" : note,
//   ];

//   db.query(query, values, async (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data) {
//       const message = `
//       =====================================
//       New Appointment
//       =====================================
//       Patient : ${patient},
//       Contact : ${contact},
//       Alternate Contact : ${
//         alternate_contact === null
//           ? "0"
//           : alternate_contact == ""
//           ? "0"
//           : alternate_contact
//       },
//       Date : ${date},
//       Email : ${email === null ? "None" : email == "" ? "None" : email},
//       Note : ${note === null ? "None" : note == "" ? "None" : note}
//       =====================================
//       add session data here
//       `;
//       await sendWhatsappMessage(message);
//       return res.status(200).json(data);
//     }
//   });
// };

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

  // Normalize optional fields once so we don't repeat ternaries.
  const altContact =
    alternate_contact === null || alternate_contact === ""
      ? "0"
      : alternate_contact;
  const safeEmail = email === null || email === "" ? "None" : email;
  const safeNote = note === null || note === "" ? "None" : note;

  const query = `INSERT INTO appointment (session_id, patient, contact, alternate_contact, date, email, note) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    session_id,
    patient,
    contact,
    altContact,
    date,
    safeEmail,
    safeNote,
  ];

  db.query(query, values, async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data) {
      const query = `SELECT session.id, day.day, session.start_time, session.end_time,
        session_type.name AS type, session.fee
        FROM session
        INNER JOIN session_type ON session.type_id = session_type.id
        INNER JOIN day ON session.day_id = day.id
        WHERE session.id = ?`;

      db.query(query, [session_id], async (err, sData) => {
        if (err) return res.status(500).json(err);

        const s = sData && sData.length ? sData[0] : {};

        const message = `
=====================================
New Appointment
=====================================
Patient : ${patient}
Contact : ${contact}
Alternate Contact : ${altContact}
Date : ${date}
Email : ${safeEmail}
Note : ${safeNote}
-------------------------------------
Session Info
-------------------------------------
Session ID : ${s.id ?? session_id}
Day : ${s.day ?? "N/A"}
Time : ${s.start_time ?? "N/A"} - ${s.end_time ?? "N/A"}
Type : ${s.type ?? "N/A"}
Fee : ${s.fee ?? "N/A"}
=====================================`.trim();

        try {
          await sendWhatsappMessage(message);
        } catch (werr) {
          console.error("WhatsApp send error:", werr);
          // Decide if you want to notify caller; currently we ignore and still return 200.
        }

        return res.status(200).json(sData);
      });
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
