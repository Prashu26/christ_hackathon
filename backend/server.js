require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const digilockerRoutes = require("./routes/auth.routes");

// Use the routes
app.use("/api/v1/users", digilockerRoutes);

app.listen(port, () => {
  console.log(` server is running at http://localhost:${port}`);
});
