const ProfileDAO = require("../data/profile-dao").ProfileDAO;
const ESAPI = require('node-esapi')

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler (db) {
    "use strict";

    const profile = new ProfileDAO(db);

    this.displayProfile = (req, res, next) => {
        const { userId } = req.session;



        profile.getByUserId(parseInt(userId), (err, doc) => {
            if (err) return next(err);
            doc.userId = userId;
            /* 
            Nomor 8-a 
            Vulnerability : XXS attack Profile 
            Keterangan : XXS attact profile
            Solusi : input validation
            */
            //doc.firstNameSafeString = ESAPI.encoder().encodeForHTML(doc.firstName)

            doc.firstNameSafeURLString = ESAPI.encoder().encodeForURL(doc.firstName)
            doc.firstNameSafeURLString = ESAPI.encoder().encodeForURL(doc.lastName)
            return res.render("profile", doc);
        });
    };

    this.handleProfileUpdate = (req, res, next) => {

        const {firstName, lastName, ssn, dob, address, bankAcc, bankRouting} = req.body;

        /* 
        Nomor 9 
        Vulnerability : ReDoS attack
        Keteragan : 
        Solusi : 
        */
        //const regexPattern = /([0-9]+)+\#/;
        const regexPattern = /([0-9]+)\#/;


        // Allow only numbers with a suffix of the letter #, for example: 'XXXXXX#'
        const testComplyWithRequirements = regexPattern.test(bankRouting);
        // if the regex test fails we do not allow saving
        if (testComplyWithRequirements !== true) {
            const firstNameSafeString = firstName
            return res.render("profile", {
                updateError: "Bank Routing number does not comply with requirements for format specified",
                firstNameSafeString,
                lastName,
                ssn,
                dob,
                address,
                bankAcc,
                bankRouting
            });
        }

        const { userId } = req.session;

        profile.updateUser(
            parseInt(userId),
            /* 
            Nomor 8-b
            Vulnerability : XXS attack Profile 
            Keterangan : XXS attact profile
            Solusi : input validation
            */
            // firstName,
            // lastName,

            ESAPI.encoder().encodeForURL(firstName),
            ESAPI.encoder().encodeForURL(lastName),
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting,
            (err, user) => {

                if (err) return next(err);

                
                user.updateSuccess = true;
                user.userId = userId;

                return res.render("profile", user);
            }
        );

    };

}

module.exports = ProfileHandler;
