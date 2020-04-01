const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;

function AllocationsHandler (db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        
        const {userId} = req.params;
        const { threshold } = req.query

        allocationsDAO.getByUserIdAndThreshold(userId, threshold, (err, allocations) => {
            if (err) return next(err);
            return res.render("allocations", { userId, allocations });
        });
    };
}

module.exports = AllocationsHandler;
