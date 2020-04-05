const UserDAO = require("../data/user-dao").UserDAO;
const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;

/* The SessionHandler must be constructed with a connected db */
function SessionHandler (db) {
    "use strict";

    const userDAO = new UserDAO(db);
    const allocationsDAO = new AllocationsDAO(db);

    const prepareUserData = (user, next) => {
        // Generate random allocations
        const stocks = Math.floor((Math.random() * 40) + 1);
        const funds = Math.floor((Math.random() * 40) + 1);
        const bonds = 100 - (stocks + funds);

        allocationsDAO.update(user._id, stocks, funds, bonds, (err) => {
            if (err) return next(err);
        });
    };

    this.isAdminUserMiddleware = (req, res, next) => {
        if (req.session.userId) {
            return userDAO.getUserById(req.session.userId, (err, user) => user && user.isAdmin ? next() : res.redirect("/login"));
        } 
        console.log("redirecting to login");
        return res.redirect("/login");
        
    };

    this.isLoggedInMiddleware = (req, res, next) => {
        if (req.session.userId) {
            return next();
        } 
        console.log("redirecting to login");
        return res.redirect("/login");
    };

    this.displayLoginPage = (req, res, next) => {
        return res.render("login", {
            userName: "",
            password: "",
            loginError: ""
        });
    };

    this.handleLoginRequest = (req, res, next) => {
        const { userName, password }  = req.body
        userDAO.validateLogin(userName, password, (err, user) => {
            const errorMessage = "Invalid username and/or password";
            const invalidUserNameErrorMessage = "Invalid username";
            const invalidPasswordErrorMessage = "Invalid password";
            if (err) {
                if (err.noSuchUser) {
                    console.log('Error: attempt to login with invalid user: ', userName);
                    /*
                    Nomor 10
                    Vulnerability : Log Injection 
                    Keterangan :
                    Solusi : Require a module that supports encoding
                    */

                    const ESAPI = require('node-esapi');
                    console.log('Error: attempt to login with invalid user: %s', ESAPI.encoder().encodeForHTML(userName));
                    console.log('Error: attempt to login with invalid user: %s', ESAPI.encoder().encodeForJavaScript(userName));
                    console.log('Error: attempt to login with invalid user: %s', ESAPI.encoder().encodeForURL(userName));
                    console.log('Error: attempt to login with invalid user: %s', userName.replace(/(\r\n|\r|\n)/g, '_'));
                    
                    return res.render("login", {
                        userName: userName,
                        password: "",
                        /*
                        Nomor 11-a
                        Vulnerabiliy : Keterangan pesan error memperlihatkan username 
                        Keterangan : telihat langsung bahwa username yang salah 
                        Solusi : samarkan dengan menggunakan invalid username/password 
                        */
                        // loginError: invalidUserNameErrorMessage
                        loginError: errorMessage

                    });
                } else if (err.invalidPassword) {
                    return res.render("login", {
                        userName: userName,
                        password: "",
                        /*
                        Nomor 11-a
                        Vulnerabiliy : Keterangan pesan error memperlihatkan password 
                        Keterangan : telihat langsung bahwa password yang salah 
                        Solusi : samarkan dengan menggunakan invalid username/password 
                        */                        
                        // loginError: invalidPasswordErrorMessage
                        loginError: errorMessage

                    });
                } else {
                    return next(err);
                }
            }
            /*
            Nomor 12
            Vulnerabiliy : cookies
            Keterangan :  
            Solusi : 
            */                                    
            // req.session.userId = user._id;
            `req.session.regenerate(function() {})`
            return res.redirect(user.isAdmin ? "/benefits" : "/dashboard")
        });
    };

    this.displayLogoutPage = (req, res) => {
        req.session.destroy(() => res.redirect("/"));
    };

    this.displaySignupPage = (req, res) => {
        res.render("signup", {
            userName: "",
            password: "",
            passwordError: "",
            email: "",
            userNameError: "",
            emailError: "",
            verifyError: ""
        });
    };

    const validateSignup = (userName, firstName, lastName, password, verify, email, errors) => {

        const USER_RE = /^.{1,20}$/;
        const FNAME_RE = /^.{1,100}$/;
        const LNAME_RE = /^.{1,100}$/;
        const EMAIL_RE = /^[\S]+@[\S]+\.[\S]+$/;
         /*
         Nomor 13
         Vulnerability : password req lemah
         Keterangan : tidak menggunakan standar password yang kuat 
         solusi : memastikan pengguna membuat password dengan 8 karakter menggunakan angka, huruf kecil dan huruf besar
        */
        var PASS_RE =/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        
        // const PASS_RE = /^.{1,20}$/;
   

        errors.userNameError = "";
        errors.firstNameError = "";
        errors.lastNameError = "";

        errors.passwordError = "";
        errors.verifyError = "";
        errors.emailError = "";

        if (!USER_RE.test(userName)) {
            errors.userNameError = "Invalid user name.";
            return false;
        }
        if (!FNAME_RE.test(firstName)) {
            errors.firstNameError = "Invalid first name.";
            return false;
        }
        if (!LNAME_RE.test(lastName)) {
            errors.lastNameError = "Invalid last name.";
            return false;
        }
        if (!PASS_RE.test(password)) {
            errors.passwordError = "Password must be 8 to 18 characters" +
                " including numbers, lowercase and uppercase letters.";
            return false;
        }
        if (password !== verify) {
            errors.verifyError = "Password must match";
            return false;
        }
        if (email !== "") {
            if (!EMAIL_RE.test(email)) {
                errors.emailError = "Invalid email address";
                return false;
            }
        }
        return true;
    }

    this.handleSignup = (req, res, next) => {

        const { email, userName, firstName, lastName, password, verify } = req.body;

        // set these up in case we have an error case
        const errors = {
            "userName": userName,
            "email": email
        };

        if (validateSignup(userName, firstName, lastName, password, verify, email, errors)) {

            userDAO.getUserByUserName(userName, (err, user) => {

                if (err) return next(err);

                if (user) {
                    errors.userNameError = "User name already in use. Please choose another";
                    return res.render("signup", errors);
                }

                userDAO.addUser(userName, firstName, lastName, password, email, (err, user) => {

                    if (err) return next(err);

                    //prepare data for the user
                    prepareUserData(user, next);
                    /*
                    Nomor 14
                    Vulnerability : 
                    Keterangan : 
                    solusi : 
                    */
                    /*
                    sessionDAO.startSession(user._id, function(err, sessionId) {

                        if (err) return next(err);

                        res.cookie("session", sessionId);
                        req.session.userId = user._id;
                        return res.render("dashboard", user);
                    });
                    */

                    req.session.regenerate(() => {
                        req.session.userId = user._id;
                        // Set userId property. Required for left nav menu links
                        user.userId = user._id;

                        return res.render("dashboard", user);
                    });

                });
            });
        } else {
            console.log("user did not validate");
            return res.render("signup", errors);
        }
    };

    this.displayWelcomePage = (req, res, next) => {
        let userId;

        if (!req.session.userId) {
            console.log("welcome: Unable to identify user...redirecting to login");
            return res.redirect("/login");
        }

        userId = req.session.userId;

        userDAO.getUserById(userId, (err, doc) => {
            if (err) return next(err);
            doc.userId = userId;
            return res.render("dashboard", doc);
        });
    };
}

module.exports = SessionHandler;
