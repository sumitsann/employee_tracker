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
const connection = mysql.createConnection(
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

connection.connect(function (err) {
  if (err) {
    console.error("Error: " + err.stack);
    return;
  }

  console.log("Connected to db with id: " + connection.threadId);
});

// asking which task the user wants to do
function taskToDo() {
  inquirer
    .prompt({
      name: "task",
      type: "list",
      message: "What task would you like to do?",
      choices: [
        "View Tables",
        "Add in table",
        "Update Table",
        "Delete Row",
        "Exit",
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        case "View Tables":
          viewTables();
          break;
        case "Add in table":
          add();
          break;
        case "Update Table":
          updateEmployee();
          break;
        case "Delete Row":
          deleteRow();
          break;
        case "Exit":
          connection.end();
          console.log("Press CTRL + C to EXIT");
          return;
      }
    });
}

// view tables

function viewTables() {
  inquirer
    .prompt({
      name: "table",
      message: "Which table would you like to view?",
      type: "list",
      choices: ["department", "role", "employee"],
    })
    .then(function ({ table }) {
      connection.query(`SELECT * FROM ${table}`, function (err, data) {
        if (err) throw err;

        console.table(data);
        taskToDo();
      });
    });
}

// add to the tables
function add() {
  inquirer
    .prompt({
      name: "table",
      message: "In which table would you like to add?",
      type: "list",
      choices: ["department", "role", "employee"],
    })
    .then(function ({ table }) {
      switch (table) {
        case "department":
          addDepartment();
          break;
        case "role":
          addRole();
          break;
        case "employee":
          addEmployee();
          break;
      }
    });
}

function addDepartment() {
  inquirer
    .prompt({
      name: "departmentName",
      message: "What is the department name?",
      type: "input",
      validate: (value) => {
        if (value) {
          return true;
        } else {
          ("Please enter a value");
        }
      },
    })
    .then(function ({ departmentName }) {
      connection.query(
        `INSERT INTO department (name) VALUES ('${departmentName}')`,
        function (err, data) {
          if (err) throw err;
          console.log(`Department Added`);
          taskToDo();
        }
      );
    });
}
function addRole() {
  let departmentNames = [];

  connection.query(`SELECT * FROM department`, function (err, data) {
    if (err) throw err;
    for (var i = 0; i < data.length; i++) {
      departmentNames.push(data[i].name);
    }

    inquirer
      .prompt([
        {
          name: "roleTitle",
          message: "What is the title?",
          type: "input",
          validate: (value) => {
            if (value) {
              return true;
            } else {
              console.log("Please enter a value");
            }
          },
        },
        {
          name: "salary",
          message: "What is the salary?",
          type: "input",
          validate: (value) => {
            if (value) {
              return true;
            } else {
              console.log("Please enter a value");
            }
          },
        },
        {
          name: "department_id",
          message: "What is the department id of the role?",
          type: "list",
          choices: departmentNames,
        },
      ])
      .then(function ({ roleTitle, salary, department_id }) {
        let departmentIndex = departmentNames.indexOf(department_id) + 1;

        connection.query(
          `INSERT INTO role (title, salary, department_id) VALUES ('${roleTitle}', '${salary}', ${departmentIndex})`,
          function (err, data) {
            if (err) throw err;
            console.log(`Added role.`);
            taskToDo();
          }
        );
      });
  });
}
function addEmployee() {
  let employeeNames = [];
  let roles = [];

  connection.query(`SELECT * FROM role`, function (err, data) {
    if (err) throw err;
    for (var i = 0; i < data.length; i++) {
      roles.push(data[i].title);
    }
  });

  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;

    for (var i = 0; i < data.length; i++) {
      employeeNames.push(data[i].first_name);
    }

    inquirer
      .prompt([
        {
          name: "first_name",
          message: "What is the first name of the employee?",
          type: "input",
          validate: (value) => {
            if (value) {
              return true;
            } else {
              console.log("Please enter a value");
            }
          },
        },
        {
          name: "last_name",
          message: "What is the last name of the employee?",
          type: "input",
          validate: (value) => {
            if (value) {
              return true;
            } else {
              console.log("Please enter a value");
            }
          },
        },
        {
          name: "role_id",
          message: "What is the role of the employee?",
          type: "list",
          choices: roles,
        },
        {
          name: "manager_id",
          message: "Please confirm the manager id.",
          type: "list",
          choices: ["none"].concat(employeeNames),
        },
      ])
      .then(function ({ first_name, last_name, role_id, manager_id }) {
        let addEmployeeQuery = `INSERT INTO employee (first_name, last_name, role_id`;

        if (manager_id == "none") {
          addEmployeeQuery += `) VALUES ('${first_name}', '${last_name}', ${
            roles.indexOf(role_id) + 1
          })`;
        } else {
          addEmployeeQuery += `, manager_id) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(
            role_id
          )}, ${employeeNames.indexOf(manager_id) + 1})`;
        }
        console.log(addEmployeeQuery);

        connection.query(addEmployeeQuery, function (err, data) {
          if (err) throw err;

          console.log("Employee Added");
          taskToDo();
        });
      });
  });
}

// update to the tables

function updateEmployee() {
  inquirer
    .prompt({
      name: "table",
      message: "What do you want to update for the employee?",
      type: "list",
      choices: ["role", "manager"],
    })
    .then(function ({ table }) {
      switch (table) {
        case "role":
          updateRole();
          break;
        case "manager":
          updateManager();
          break;
      }
    });
}

function updateRole() {
  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;

    let employeeNames = [];

    for (var i = 0; i < data.length; i++) {
      employeeNames.push(data[i].first_name);
    }

    connection.query(`SELECT * FROM role`, function (err, data) {
      if (err) throw err;
      let roles = [];

      for (var i = 0; i < data.length; i++) {
        roles.push(data[i].title);
      }

      inquirer
        .prompt([
          {
            name: "employee_id",
            message: "Which employee role needs to be updated?",
            type: "list",
            choices: employeeNames,
          },
          {
            name: "role_id",
            message: "Which employee role needs to be updated?",
            type: "list",
            choices: roles,
          },
        ])
        .then(function ({ employee_id, role_id }) {
          connection.query(
            `UPDATE employee SET role_id = ${roles.indexOf(role_id) + 1} WHERE 
        id = ${employeeNames.indexOf(employee_id) + 1}`,
            function (err, data) {
              if (err) throw err;
              console.log(`Role Updated`);

              taskToDo();
            }
          );
        });
    });
  });
}

function updateManager() {
  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;
    let employeeNames = [];
    for (var i = 0; i < data.length; i++) {
      employeeNames.push(data[i].first_name);
    }
    inquirer
      .prompt([
        {
          name: "employee_id",
          message: "Whom would you like to update?",
          type: "list",
          choices: employeeNames,
        },
        {
          name: "manager_id",
          message: "Who is the manager?",
          type: "list",
          choices: ["none"].concat(employeeNames),
        },
      ])
      .then(function ({ employee_id, manager_id }) {
        let managerQuery = "";
        if (manager_id == "none") {
          managerQuery += `UPDATE employee SET manager_id = ${null} WHERE id = ${
            employeeNames.indexOf(employee_id) + 1
          }`;
        } else {
          managerQuery += `UPDATE employee SET manager_id = ${
            employeeNames.indexOf(manager_id) + 1
          } WHERE id = ${employeeNames.indexOf(employee_id) + 1}`;
        }
        connection.query(managerQuery, function (err, data) {
          if (err) throw err;
          console.log(`Manager Updated`);

          taskToDo();
        });
      });
  });
}

// delete in the tables
function deleteRow() {
  inquirer
    .prompt({
      name: "table",
      message: "In which table would you like to delete?",
      type: "list",
      choices: ["department", "role", "employee"],
    })
    .then(function ({ table }) {
      switch (table) {
        case "department":
          deleteDepartment();
          break;
        case "role":
          deleteRole();
          break;
        case "employee":
          deleteEmployee();
          break;
      }
    });
}

function deleteDepartment() {
  connection.query(`SELECT * FROM department`, function (err, data) {
    if (err) throw err;
    let departmentNames = [];
    for (var i = 0; i < data.length; i++) {
      departmentNames.push(data[i].name);
    }
    inquirer
      .prompt({
        name: "id",
        message: "What is the department name?",
        type: "list",
        choices: departmentNames,
      })
      .then(function ({ id }) {
        connection.query(
          `DELETE FROM department WHERE id = ${
            departmentNames.indexOf(id) + 1
          }`,
          function (err, data) {
            if (err) throw err;
            console.log(`DELETED`);
            taskToDo();
          }
        );
      });
  });
}

function deleteRole() {
  connection.query(`SELECT * FROM role`, function (err, data) {
    if (err) throw err;
    let roleTitle = [];
    for (var i = 0; i < data.length; i++) {
      roleTitle.push(data[i].title);
    }
    inquirer
      .prompt({
        name: "id",
        message: "What is the role name?",
        type: "list",
        choices: roleTitle,
      })
      .then(function ({ id }) {
        connection.query(
          `DELETE FROM role WHERE id = ${roleTitle.indexOf(id) + 1}`,
          function (err, data) {
            if (err) throw err;
            console.log(`DELETED`);
            taskToDo();
          }
        );
      });
  });
}

function deleteEmployee() {
  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;
    let employeeNames = [];
    for (var i = 0; i < data.length; i++) {
      employeeNames.push(data[i].first_name);
    }
    inquirer
      .prompt({
        name: "id",
        message: "What is the employee name?",
        type: "list",
        choices: employeeNames,
      })
      .then(function ({ id }) {
        connection.query(
          `DELETE FROM employee WHERE id = ${employeeNames.indexOf(id) + 1}`,
          function (err, data) {
            if (err) throw err;
            console.log(`DELETED`);
            taskToDo();
          }
        );
      });
  });
}

taskToDo();

// start the express server on port 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
