const mysql = require("mysql2");
const inquirer = require("inquirer");
const db = require("./db/connection");

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

db.connect(function (err) {
  if (err) {
    console.error("Connection error : " + err.stack);
    return;
  }

  console.log("Connected to db as id " + db.threadId);
});

const firstPrompt = () => {
  inquirer
    .prompt({
      name: "task",
      type: "list",
      message: "Which task would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Exit":
          db.end();
          break;
      }
    });
};

function viewAllDepartments() {
  db.query(`SELECT * FROM department`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.log(rows);
  });
  firstPrompt();
}

function viewAllRoles() {
  db.query(`SELECT * FROM role`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.log(rows);
  });
  firstPrompt();
}

function viewAllEmployees() {
  db.query(`SELECT * FROM employee`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.log(rows);
  });
  firstPrompt();
}

function addDepartment() {}

function addRole() {}

function addEmployee() {}

function updateEmployeeRole() {}

firstPrompt();

// start the express server on port 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
