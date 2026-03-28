const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { initDb } = require("./db");

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Lumina Backend is Live!");
});

const PORT = process.env.PORT || 5005;

initDb().then(() => {
  try {
    const authRoutes = require("./routes/auth");
    const postRoutes = require("./routes/posts");
    const commentRoutes = require("./routes/comments");

    app.use("/api/auth", authRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/comments", commentRoutes);

    console.log("[SERVER] Routes mounted successfully.");
  } catch (error) {
    console.error("[SERVER] Error mounting routes:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`\n✅ SERVER STARTED on Port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
