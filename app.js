const http = require('http');
const url = require("url");
const mysql = require("mysql");

// Constants
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS patients (
        patientid INT(10) UNSIGNED ZEROFILL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        dateOfBirth DATETIME
    ) ENGINE=InnoDB;
`;
const HOST = "sql3.freesqldatabase.com";
const USER = "sql3653624";
const PASSWORD = "6pJQ4W2ARc";
const DATABASE = "sql3653624";
const PORT = 3000;

const con = mysql.createPool({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE
});

con.query(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating the table:', err);
    }
});

http.createServer((req, res) => {
    let q = url.parse(req.url, true);
    let pathname = q.pathname;
    // GPT
    if (req.method === "OPTIONS") {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
    // GPT
    } else if (pathname.includes("/lab5/api/v1/sql/")) {
        let sql = pathname.substring(pathname.lastIndexOf('/') + 1);
        let clean_sql = sql.replace(/%20/g, " ");

        con.query(clean_sql, (err, result) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                res.end("You got an SQL error, please check your SQL query");
            } else {
                console.log(result);
                let table = "<table>";
                for (let i = 0; i < result.length; i++) {
                    table += `<tr><td>${result[i].patientid}</td><td>${result[i].name}</td><td>${result[i].dateOfBirth}</td></tr>`;
                }
                table += "</table>";

                res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                res.write(table);
                res.end();
            }
        });
    } else if (req.method === "POST" && pathname == "/lab5/insert") {
        let body = "";

        req.on('data', function (chunk) {
            if (chunk != null) {
                body += chunk;
            }
        });

        req.on("end", () => {
            let data = JSON.parse(body);
            con.query(data.query, (err, result) => {
                if (err) {
                    res.writeHead(400, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                    res.end("You got an SQL error, please check your SQL query" + err.message);
                } else {
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                    res.end("We got your POST request");
                }
            });
        });
    } else if (req.method === "GET" && pathname.includes("/lab5/select")) {
        let sql = pathname.substring(pathname.lastIndexOf('/') + 1);
        let clean_sql = sql.replace(/%20/g, " ");

        con.query(clean_sql, (err, result) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                res.end("You got an SQL error, please check your SQL query");
            } else {
                console.log(result);
                res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ response: `We got your GET request`, result }));
            }
        });
    } else {
        // Handle other requests
        res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
        res.write("<p>home page</p>");
        res.end();
    }

}).listen(PORT);

console.log("Server is running and listening on port: " + PORT);
