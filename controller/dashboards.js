import { db } from "../db.js";
import { smsBalance } from "../services/sms.js";

export const loadCounts = (req, res) => {
  const query = `SELECT 
    (SELECT COUNT(id) FROM appointment WHERE state=1 AND is_confirmed = 0) AS pending,
    (SELECT COUNT(id) FROM appointment WHERE state=1 AND is_confirmed = 1) AS approved,
    (SELECT COUNT(id) FROM appointment WHERE state=0 AND is_confirmed = 0) AS reject,
    (SELECT COUNT(id) FROM appointment ) AS total,
    (SELECT COUNT(id) FROM doctors WHERE state=1) AS doctors,
    (SELECT COUNT(d.id) FROM doctors d LEFT JOIN session s ON d.id = s.doctor_id WHERE d.state=1 AND s.doctor_id IS NULL) AS doctors_no_session,
    (SELECT COUNT(id) FROM session WHERE state=1) AS active_stssion,
    (SELECT COUNT(id) FROM appointment WHERE state=1 AND is_confirmed = 1) * 100 AS sale`;

  db.query(query, async (err, data) => {
    if (err) return res.status(500).json(err);

    const smsdata = await smsBalance();

    const response = {
      ...data[0],
      sms_balance:
        (smsdata && smsdata.data && smsdata.data.remaining_unit) || 0,
    };

    return res.status(200).json(response);
  });
};
