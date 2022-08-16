const mysql = require("mysql2");
const inquirer = require("inquirer");

const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();

// test the express js connection
app.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // Your MySQL username,
    user: "root",
    // Your MySQL password
    password: "vastika123",
    database: "employeeDB",
  },
  console.log("Connected to the election database.")
);

// start the express server on port 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
