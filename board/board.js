const express = require("express");
const router = express.Router();

module.exports = (connection) => {
    
    router.get("/list"), (req, res) => {
        connection.query("SELECT * FROM board", (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    }


    return router;
};
