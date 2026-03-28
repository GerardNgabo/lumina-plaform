console.log("[AUTH] Loaded:", __filename);

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

module.exports = function (req, res, next) {
  console.log("[AUTH] Invoked for", req.method, req.originalUrl);
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const parts = authHeader && authHeader.trim().split(" ");
    if (!parts || parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
      return res.status(401).json({ error: "Invalid auth header format" });
    }

    const token = parts[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};











