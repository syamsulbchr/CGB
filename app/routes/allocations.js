const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;

function AllocationsHandler (db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        /* 
        Nomor 1 
        Vulnerability kategori insecure direct object reference (IDOR)
        Keterangan : Vulnerability ini menyebabkan orang dapat mengakses informasi yang tidak seharusnya tidak bisa dia akses
        Solusi : gunakan session untuk pengecekan akses
        */
        // const {userId} = req.params;
        const { userId } = req.session;
        const { threshold } = req.query

        allocationsDAO.getByUserIdAndThreshold(userId, threshold, (err, allocations) => {
            if (err) return next(err);
            return res.render("allocations", { userId, allocations });
        });
    };
}

module.exports = AllocationsHandler;
