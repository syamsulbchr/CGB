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

            doc.firstNameSafeString = ESAPI.encoder().encodeForHTML(doc.firstName)

            return res.render("profile", doc);
        });
    };

    this.handleProfileUpdate = (req, res, next) => {

        const {firstName, lastName, ssn, dob, address, bankAcc, bankRouting} = req.body;
       
        const regexPattern = /([0-9]+)+\#/;

        const testComplyWithRequirements = regexPattern.test(bankRouting);

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
            firstName,
            lastName,
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
