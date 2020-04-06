"use strict";

const express = require("express");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
// const csrf = require('csurf');
const consolidate = require("consolidate"); // Templating library adapter for Express
const swig = require("swig");
// const helmet = require("helmet");
const MongoClient = require("mongodb").MongoClient; // Driver for connecting to MongoDB
const http = require("http");
const marked = require("marked");
//const nosniff = require('dont-sniff-mimetype');
const app = express(); // Web framework to handle routing requests
const routes = require("./app/routes");
const { port, db, cookieSecret } = require("./config/config"); // Application config properties
/*
Nomor 15-a
Vulnerability : sensitive data exposure
Keterangan : masih menggunakan HTTP yang tidak secure 
solusi : masukan scrip untuk menjalankan koneksi HTTPS

const fs = require("fs");
const https = require("https");
const path = require("path");
const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.crt"))
};
*/
MongoClient.connect(db, (err, db) => {
    if (err) {
        console.log("Error: DB: connect");
        console.log(err);
        process.exit(1);
    }
    console.log(`Connected to the database: ${db}`);

    
    /*
    Nomor 16
    Vulnerability : security misConfig
    Keterangan : x-powerd-by akan muncul apabila kita menggunakan aplikasi burpsuit
    solusi : menghilangkan x-powerd-by di respon hendeler
    app.disable("x-powered-by");
    
    Keterangan : untuk menghandel page dapat dimasukan xframe clickjacking
    solusi : menambahkan proteksi helemt pada node.js    
    app.use(helmet.xframe());

    Keterangan : untuk menghandel cache storing di page
    Solusi : menambahkan proteksi untuk cache storing page
    app.use(helmet.noCache());

    Keterangan : conten security policy
    solusi : implement content security policy
    app.use(helmet.csp());

    Keterangan : penggunan HTTP yang tidak secure
    Solusi : menggunakan hanya HTTPS
    app.use(helmet.hsts());

    Keterangan : protect XSS filtering 
    Solusi: menambahkan script 
    app.use(helmet.xssFilter({ setOnOldIE: true }));

    Keterangan : memastikan browser menggunakan Conten-Type set
    Solusi : menambahkan script 
    app.use(nosniff());
    */

    // Adding/ remove HTTP Headers for security
    app.use(favicon(__dirname + "/app/assets/favicon.ico"));

    // Express middleware to populate "req.body" so we can access POST variables
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        // Mandatory in Express v4
        extended: false
    }));

    // Enable session management using express middleware
    app.use(session({
        // genid: (req) => {
        //    return genuuid() // use UUIDs for session IDs
        //},
        secret: cookieSecret,
        // Both mandatory in Express v4
        saveUninitialized: true,
        resave: true
        
        /*
        Nomor 16
        Vulnerability : security misConfig
        Keterangan :  
        solusi : 
        */
        // key: "sessionId",
        

        /*
                /*
        Nomor 18-a
        Vulnerability : XXS
        Keterangan :  
        solusi : 
        
        cookie: {
            httpOnly: true
            // Remember to start an HTTPS server to get this working
            // secure: true
        }
        */      

    }));
    /*
    Nomor 19
     Vulnerability : CSRF
    Keterangan :  
    solusi : 

    app.use(csrf());
    // Make csrf token available in templates
    app.use(function(req, res, next) {
        res.locals.csrftoken = req.csrfToken();
        next();
    });
    */

    // Register templating engine
    app.engine(".html", consolidate.swig);
    app.set("view engine", "html");
    app.set("views", `${__dirname}/app/views`);
    app.use(express.static(`${__dirname}/app/assets`));

    /*
    Nomor 20
    Vulnerability : Insecure Dependencies
    Keterangan :  
    solusi : 
    */
    
    marked.setOptions({
        sanitize: true
    });
    app.locals.marked = marked;

    // Application routes
    routes(app, db);

    // Template system setup
    swig.setDefaults({
        // Autoescape disabled
        autoescape: false
        /*
        Nomor 18-b
        Vulnerability : XXS
        Keterangan :  
        solusi :
        */       
    });

    // Insecure HTTP connection
        http.createServer(app).listen(port, () => {
       console.log(`Express http server listening on port ${port}`);
    });
    /*
    Nomor 15-a
    Vulnerability : sensitive data exposure
    Keterangan : masih menggunakan HTTP yang tidak secure 
    solusi : masukan scrip untuk menjalankan koneksi HTTPS
    

    https.createServer(httpsOptions, app).listen(config.port,  function() {
        console.log("Express https server listening on port " + config.port);
    });
    */
});
