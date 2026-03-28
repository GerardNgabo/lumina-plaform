const { getDb } = require("../db");

module.exports = function (req, res, next) {
  try {
    const db = getDb();
    const result = db.exec("SELECT role FROM users WHERE id = ?", [req.user.userId]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(403).json({ error: "User not found" });
    }
    const role = result[0].values[0][0];
    if (role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.user.role = "admin";
    next();
  } catch (err) {
    res.status(500).json({ error: "Authorization check failed" });
  }
};
