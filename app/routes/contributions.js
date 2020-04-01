const ContributionsDAO = require("../data/contributions-dao").ContributionsDAO;

/* The ContributionsHandler must be constructed with a connected db */
function ContributionsHandler (db) {
    "use strict";

    const contributionsDAO = new ContributionsDAO(db);

    this.displayContributions = (req, res, next) => {
        const { userId } = req.session;

        contributionsDAO.getByUserId(userId, (error, contrib) => {
            if (error) return next(error);

            contrib.userId = userId; //set for nav menu items
            return res.render("contributions", contrib);
        });
    };

    this.handleContributionsUpdate = (req, res, next) => {

        /* Vunerability = tidak aman menggunakan eval ini menyebakan serangan SSJS Injection
        Solusi = sebagai alternatif maka gunakan parseInt
        
        const preTax = eval(req.body.preTax);
        const afterTax = eval(req.body.afterTax);
        const roth = eval(req.body.roth);
        */

        var const preTax = parseInt(req.body.preTax);
        var const afterTax = parseInt(req.body.afterTax);
        var const roth = eval(req.body.roth);

        const { userId } = req.session;

        //validate contributions
        const validations = [isNaN(preTax), isNaN(afterTax), isNaN(roth), preTax < 0, afterTax < 0, roth < 0]
        const isInvalid = validations.some(validation => validation)
        if (isInvalid) {
            return res.render("contributions", {
                updateError: "Invalid contribution percentages",
                userId
            });
        }
        // Prevent more than 30% contributions
        if (preTax + afterTax + roth > 30) {
            return res.render("contributions", {
                updateError: "Contribution percentages cannot exceed 30 %",
                userId
            });
        }

        contributionsDAO.update(userId, preTax, afterTax, roth, (err, contributions) => {

            if (err) return next(err);

            contributions.updateSuccess = true;
            return res.render("contributions", contributions);
        });

    };

}

module.exports = ContributionsHandler;
