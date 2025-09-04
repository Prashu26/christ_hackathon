require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Import routes
const digilockerRoutes = require("./routes/auth.routes");
const credentialsRoutes = require("./routes/credentials.routes");
const insuranceRoutes = require("./routes/insurance.routes");
const loanRoutes = require("./routes/loans.routes");
const storageRoutes = require("./routes/storage.routes");

// Use the routes
app.use("/api/v1/users", digilockerRoutes);
app.use("/api/credentials", credentialsRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/storage", storageRoutes);

app.listen(port, () => {
  console.log(` server is running at http://localhost:${port}`);
});
