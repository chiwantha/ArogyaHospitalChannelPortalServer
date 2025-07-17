import { db } from "../db.js";

export const loadCounts = (req, res) => {
  const query = `SELECT 
    (SELECT COUNT(id) FROM appointment WHERE state=1 AND is_confirmed = 0) AS pending,
    (SELECT COUNT(id) FROM appointment WHERE state=1 AND is_confirmed = 1) AS approved,
    (SELECT COUNT(id) FROM appointment WHERE state=0 AND is_confirmed = 0) AS reject,
    (SELECT COUNT(id) FROM appointment ) AS total,
    (SELECT COUNT(id) FROM doctors) AS doctors`;

  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });
};
