const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;

function AllocationsHandler (db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        
        //9. vulnerability = Insecure DOR
        //solusi = ganti parms dengan seasion
        const { userId } = req.session;
        //const {userId} = req.params;
        const { threshold } = req.query

        allocationsDAO.getByUserIdAndThreshold(userId, threshold, (err, allocations) => {
            if (err) return next(err);
            return res.render("allocations", { userId, allocations });
        });
    };
}

module.exports = AllocationsHandler;
