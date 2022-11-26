DROP DATABASE IF EXISTS employee_db; 
CREATE DATABASE employee_db; 

USE employee_db; 

CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(30) NOT NULL UNIQUE
); 

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    title VARCHAR(30) NOT NULL UNIQUE,
    salary DECIMAL NOT NULL, 
    department_id INT NOT NULL, 
    FOREIGN KEY (department_id)
    REFERENCES department(id)
); 

CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    first_name VARCHAR(30) NOT NULL, 
    last_name VARCHAR(30) NOT NULL, 
    role_id INT NOT NULL, 
    manager_id INT, 
    FOREIGN KEY (role_id)
    REFERENCES role(id), 
    UNIQUE KEY (first_name, last_name)
); 

CREATE VIEW v_role AS 
SELECT r.id, r.title, d.name 'department', r.salary
FROM role r 
JOIN department d ON r.department_id = d.id; 

CREATE VIEW v_employee AS 
SELECT e.id, e.first_name, e.last_name, r.title, r.department, r.salary, 
CONCAT(m.first_name, ' ', m.last_name) 'manager'
FROM employee e
LEFT JOIN employee m ON e.manager_id = m.id
JOIN v_role r ON e.role_id = r.id; 

GRANT ALL PRIVILEGES ON employee_db.* TO 'test'@'localhost';  