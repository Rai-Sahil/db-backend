const http = require('http');
const url = require("url");
const mysql = require("mysql");
const port = 3000;

let req_count = 0;

const con = mysql.createPool({
    host: "sql3.freesqldatabase.com",
    user: "sql3653624",
    password: "6pJQ4W2ARc",
    database: "sql3653624"
});

http.createServer((req, res) => {
    let q = url.parse(req.url, true);
    let pathname = q.pathname;

    if (req.method === "OPTIONS") {
        // Handle CORS preflight request
        res.writeHead(200, {
            'Access-Control-Allow-Origin': 'https://db-frontend-teal.vercel.app/',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
    } else if (pathname.includes("/lab5/api/v1/sql/")) {
        // Handle SQL query request
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
        // Handle POST request
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
                    res.end("You got an SQL error, please check your SQL query");
                } else {
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                    res.end("We got your POST request");
                }
            });
        });
    } else if (req.method === "GET" && pathname.includes("/lab5/select")) {
        // Handle GET request
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

}).listen(port);

console.log("Server is running and listening on port: " + port);
