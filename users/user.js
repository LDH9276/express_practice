const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

module.exports = (connection) => {
    router.post("/join", (req, res) => {
        const id = req.body.id;
        const pw = req.body.pw + process.env.APP_HASH_SALT; // salt 추가
        const name = req.body.name;

        // 암호화 키 가져오기
        const hashKey = process.env.APP_HASH_KEY;

        // 암호화 키를 추가하여 암호화
        const hashedPw = crypto.pbkdf2Sync(pw, hashKey, 100000, 64, "sha512").toString("hex");

        connection.query(`INSERT INTO members (user_id, user_password, user_name) VALUES ('${id}', '${hashedPw}', '${name}')`, (err, rows, fields) => {
            if (err) throw err;
            console.log(rows);
            res.send(rows);
        });
    });

    router.post("/login", (req, res) => {
        const id = req.body.id;
        const pw = req.body.pw + process.env.APP_HASH_SALT; // salt 추가

        // 암호화 키 가져오기
        const hashKey = process.env.APP_HASH_KEY;

        // 암호화 키를 추가하여 암호화
        const hashedPw = crypto.pbkdf2Sync(pw, hashKey, 100000, 64, "sha512").toString("hex");

        connection.query(`SELECT * FROM members WHERE user_id = '${id}'`, (err, rows, fields) => {
            if (err) throw err;

            if (rows.length > 0) {
                if (rows[0].user_password === hashedPw) {

                    const payload = {
                        user_id: rows[0].user_id,
                        username: rows[0].user_name,
                    };

                    const options = {
                        expiresIn: "1h",
                    };

                    const secret = process.env.APP_SECRET_KEY;
                    const token = jwt.sign(payload, secret, options);

                    res.send({
                        success: true,
                        message: "로그인 성공",
                        user_id: rows[0].user_id,
                        name : rows[0].user_name,
                        token: token,
                    });

                } else {
                    res.send("비밀번호가 일치하지 않습니다");
                }
            } else {
                res.send("해당 아이디가 존재하지 않습니다");
            }
        });
    });

    return router;
};
