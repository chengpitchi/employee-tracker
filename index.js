const inquirer = require('inquirer'); 
const logo = require('asciiart-logo'); 
const db = require('./lib/connection'); 
const table = require('console.table'); 

// Main Menu 
const mainMenu = [    
    {
        type: 'list',
        message: 'What would you like to do?',
        name: 'action',
        choices: ['View All Employees', 
                    'View Employees by Manager', 
                    'View Employees by Department', 
                    'Add Employee', 
                    'Delete Employee', 
                    'Update Employee Role', 
                    'Update Employee Manager', 
                    'View All Roles', 
                    'Add Role', 
                    'Delete Role', 
                    'View All Departments', 
                    'View Total Utilized Budget by Department', 
                    'Add Deparment', 
                    'Delete Department', 
                    'Quit Application'
                ],
    }]

// questions for adding department
const addDept = [
    {
        type: 'input',
        message: 'What is the name of the department?',
        name: 'name',
        // validation for validation empty field
        validate(input) {
        if (input !== '') return true;  
        throw Error('The field cannot be empty.');
        },
    }
]

// questions for adding role
const addRole = [
    {
        type: 'input',
        message: 'What is the title of the role?',
        name: 'title',
        // validation for validation empty field
        validate(input) {
        if (input !== '') return true;  
        throw Error('The field cannot be empty.');
        },
    }, 
    {
        type: 'input',
        message: 'What is the salary of the role?',
        name: 'salary',
        // validation for validation numeric field
        validate(input) {
        if (Number.parseInt(input)) return true;  
        throw Error('Pleae input a number.');
        },
    }
]

//questions for adding employee
const addEmployee = [
    {
        type: 'input',
        message: `What is the employee's first name?`,
        name: 'firstName',
        // validation for validation empty field
        validate(input) {
        if (input !== '') return true;  
        throw Error('The field cannot be empty.');
        },
    }, 
    {
        type: 'input',
        message: `What is the employee's last name?`,
        name: 'lastName',
        // validation for validation numeric field
        // validation for validation empty field
        validate(input) {
            if (input !== '') return true;  
            throw Error('The field cannot be empty.');
            },
    }
]

// recursive function to show the main menu
const showMainMenu = (async() => {
    const response = await inquirer.prompt(mainMenu); 

    switch (response.action) {
        case 'View All Employees':
            db.query('select * from v_employee', (err, result) => {
                console.log('\n'); 
                console.table(result);  
                showMainMenu(); 
              });    
            break; 

        case 'View Employees by Manager':
            db.query("select CONCAT(first_name, ' ', last_name) 'name' from v_employee", (err, result) => {
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which manager would you like to view?',
                        name: 'name',
                        choices: result,
                    }
                ]).then((response) => {
                    db.query('select * from v_employee where manager = ?', response.name, (err, result) => {
                        console.log('\n'); 
                        if (result.length) {
                            console.table(result);  
                        } else {
                            console.log('No result found.'); 
                        }
                        showMainMenu();     
                    })    
                })
            });
            break; 

        case 'View Employees by Department': 
            db.query('select name from department', (err, result) => {
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which department would you like to view?',
                        name: 'name',
                        choices: result,
                    }
                ]).then((response) => {
                    db.query('select * from v_employee where department = ?', response.name, (err, result) => {
                        console.log('\n'); 
                        if (result.length) {
                            console.table(result);  
                        } else {
                            console.log('No result found.'); 
                        }
                        showMainMenu();     
                    })    
                })
            });
            break; 

        case 'Add Employee':
            db.query(`select title 'name' from role`, (err, result) => {
                const roleName = {
                    type: 'list',
                    message: `What is the employeee's role?`,
                    name: 'role',
                    choices: result,
                    }; 
                
                addEmployee.push(roleName); 
                
                db.query(`select CONCAT(first_name, ' ', last_name) 'name' from v_employee`, (err, result) => {
                    result.unshift({name:'None'}); 
                    const manager = {
                        type: 'list',
                        message: `What is the employeee's manager?`,
                        name: 'manager',
                        choices: result,
                        }; 
                    
                    addEmployee.push(manager); 

                    inquirer.prompt(addEmployee).then((response) => {
                        let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                                    VALUES (?, ?, (SELECT id FROM role WHERE title = ?), 
                                    (SELECT e.id FROM employee e WHERE CONCAT(e.first_name, ' ', e.last_name) = ?))`; 

                        db.query(sql, [response.firstName.trim(), response.lastName.trim(), response.role, response.manager], (err, result) => {
                            console.log('\n'); 
                            if (err) {
                                console.log(`Error: ${err.sqlMessage}`); 
                            } else {
                                console.log(`Employee "${response.firstName.trim()} ${response.lastName.trim()}" added to the database.`)
                            }
                            showMainMenu();  
                        })    
                    })
                })
            });
            break; 

        case 'Delete Employee': 
            db.query(`select CONCAT(first_name, ' ', last_name) 'name' from v_employee`, (err, result) => {
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which employee would you like to delete?',
                        name: 'name',
                        choices: result,
                    }
                ]).then((response) => {
                    db.query(`DELETE FROM employee where CONCAT(first_name, ' ', last_name) = ?`, response.name, (err, result) => {
                        console.log('\n'); 
                        if (err) {
                            console.log(`Error: ${err.sqlMessage}`); 
                        } else {
                            console.log(`Employee "${response.name}" deleted from the database.`)
                        }
                        showMainMenu();  
                    })    
                })
            });
            break; 

        case 'Update Employee Role': 
            db.query(`select CONCAT(first_name, ' ', last_name) 'name' from v_employee`, (err, result) => {
                const updateRole = [
                    {
                    type: 'list',
                    message: `Which employee you would like to update?`,
                    name: 'name',
                    choices: result,
                    }
                ]
                
                db.query(`select title 'name' from role`, (err, result) => {
                    const roleName = {
                        type: 'list',
                        message: `What is the new role of this employee?`,
                        name: 'role',
                        choices: result,
                        }; 
                    
                    updateRole.push(roleName); 

                    inquirer.prompt(updateRole).then((response) => {
                        let sql = `UPDATE employee
                                    SET role_id = (SELECT id from role where title = ?)
                                    WHERE CONCAT(first_name, ' ', last_name) = ?`; 

                        db.query(sql, [response.role, response.name], (err, result) => {
                            console.log('\n'); 
                            if (err) {
                                console.log(`Error: ${err.sqlMessage}`); 
                            } else {
                                console.log(`Employee ${response.name}'s role is updated.`)
                            }
                            showMainMenu();  
                        })    
                    })
                })
            });
            break; 

        case 'Update Employee Manager': 
            db.query(`select CONCAT(first_name, ' ', last_name) 'name' from v_employee`, (err, result) => {
                const updateManager = [
                    {
                    type: 'list',
                    message: `Which employee you would like to update?`,
                    name: 'name',
                    choices: result,
                    }
                ]
                
                db.query(`select CONCAT(first_name, ' ', last_name) 'name', id from v_employee`, (err, result) => {
                    result.unshift({name:'None'}); 
                    const manager = {
                        type: 'list',
                        message: `What is the employeee's new manager?`,
                        name: 'manager',
                        choices: result,
                        }; 
                    
                    updateManager.push(manager); 

                    inquirer.prompt(updateManager).then((response) => {
                        const target = result.filter((item) => item.name == response.manager); 

                        let sql = `UPDATE employee
                                    SET manager_id = ?
                                    WHERE CONCAT(first_name, ' ', last_name) = ?`; 

                        db.query(sql, [target[0].id, response.name], (err, result) => {
                            console.log('\n'); 
                            if (err) {
                                console.log(`Error: ${err.sqlMessage}`); 
                            } else {
                                console.log(`Employee ${response.name}'s manager is updated.`)
                            }
                            showMainMenu();  
                        })    
                    })
                })
            });
            break; 

        case 'View All Roles':
            db.query('select * from v_role', (err, result) => {
                console.log('\n');
                console.table(result);  
                showMainMenu(); 
              });    
            break; 

        case 'Add Role':
            db.query('select name from department', (err, result) => {
                const deptName = {
                    type: 'list',
                    message: 'Which department would you like to delete?',
                    name: 'name',
                    choices: result,
                    }; 
                
                addRole.push(deptName); 
                inquirer.prompt(addRole).then((response) => {
                    db.query(`INSERT INTO role (title, salary, department_id) 
                                VALUES (?, ?, (SELECT id FROM department WHERE name = ?))`, 
                                [response.title, response.salary, response.name], (err, result) => {
                        console.log('\n'); 
                        if (err) {
                            console.log(`Error: ${err.sqlMessage}`); 
                        } else {
                            console.log(`Role "${response.title}" added to the database.`)
                        }
                        showMainMenu();  
                    })    
                })
            });
            break; 

        case 'Delete Role': 
            db.query("select title 'name' from role", (err, result) => {
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which role would you like to delete?',
                        name: 'title',
                        choices: result,
                    }
                ]).then((response) => {
                    db.query('DELETE FROM role where title = ?', response.title, (err, result) => {
                        console.log('\n'); 
                        if (err) {
                            console.log(`Error: ${err.sqlMessage}`); 
                        } else {
                            console.log(`Role "${response.title}" deleted from the database.`)
                        }
                        showMainMenu();  
                    })    
                })
            });
            break; 

        case 'View All Departments':
            db.query('select * from department', (err, result) => {
                console.log('\n'); 
                console.table(result);  
                showMainMenu(); 
              });    
            break; 

        case 'View Total Utilized Budget by Department':
            db.query(`SELECT department, sum(salary) 'total_utilized_budget' 
                        FROM v_employee
                        GROUP BY department`, (err, result) => {
                console.log('\n'); 
                console.table(result);  
                showMainMenu(); 
              });    
            break; 

        case 'Add Deparment':
            inquirer.prompt(addDept)
              .then((response) => {
                db.query('INSERT INTO department (name) VALUES (?)', response.name, (err, result) => {
                    console.log('\n'); 
                    if (err) {
                        console.log(`Error: ${err.sqlMessage}`); 
                    } else {
                        console.log(`Department "${response.name}" added to the database.`)
                    }
                    showMainMenu();  
                })
              })
            break; 

        case 'Delete Department':
            db.query('select name from department', (err, result) => {
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which department would you like to delete?',
                        name: 'name',
                        choices: result,
                    }
                ]).then((response) => {
                    db.query('DELETE FROM department where name = ?', response.name, (err, result) => {
                        console.log('\n'); 
                        if (err) {
                            console.log(`Error: ${err.sqlMessage}`); 
                        } else {
                            console.log(`Department "${response.name}" deleted from the database.`)
                        }
                        showMainMenu();  
                    })    
                })
            });
            break; 

        case 'Quit Application': 
            quit();           
    }
});

// function to initialize app
function init() {
    // showing logo
    console.log(
        logo({
            name: 'Employee Tracker',
            font: 'Roman',
            lineChars: 10,
            padding: 2,
            margin: 3,
            borderColor: 'grey',
            logoColor: 'brown',
            textColor: 'grey',
        })
        .emptyLine()
        .right('version 1.0.0')
        .emptyLine()
        .render()
    );

    // showing the main menu
    showMainMenu(); 
}

// Function call to initialize app
init();

function quit(){
    console.log('Thanks for using Employee Tracker.  Goodbye!');
    process.exit();
}
