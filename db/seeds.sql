USE employeeDB;

INSERT INTO department (name)
VALUES
("Sales"),
("Finance"),
("Customer Service"),
("Legal");

INSERT INTO role (title, salary, department_id)
VALUES
("Sales person", 45000, 1),
("Sales Manager", 55000, 1),
("Financial Analyst", 75000, 2),
("CFO", 95000, 2),
("Technical Support", 40000, 3),
("CTO", 50000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Robert", "Liswowski", 1, 3),
("James", "Blunt", 1, 3),
("Jimmy", "Taylor", 2, null),
("James", "Cahill", 3, 6),
("Nate", "Diaz", 3, 6),
("Robert", "Liswowski", 4, null),
("James", "Cahill", 5, 9),
("Nate", "Diaz", 5, 9),
("Robert", "Liswowski", 6, null);




