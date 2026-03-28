const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// 1. CORS CONFIGURATION (Crucial for Netlify)
// This tells the browser: "Yes, netlify.app is allowed to talk to me."
app.use(cors({
    origin: "*", // Allow any frontend to connect (Easiest for now)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// 2. Import Routes
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

// 3. Root Route
app.get("/", (req, res) => {
  res.send("Lumina Backend is Live!");
});

// 4. DYNAMIC PORT SETTING (The Fix)
// process.env.PORT is what Render uses. 5005 is what you use locally.
const PORT = process.env.PORT || 5005; 

app.listen(PORT, () => {
  console.log(`\n✅ SERVER STARTED on Port ${PORT}`);
});

