import express from "express";
import "dotenv/config";
import ConnectDB from "./database/db.js";

const app = express();
// const PORT = 8080;
const PORT = process.env.PORT || 8080;

ConnectDB();

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
