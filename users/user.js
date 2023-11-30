const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

module.exports = (connection) => {
    router.use(cookieParser());

    router.post("/join", (req, res) => {
        const id = req.body.id;
        const pw = req.body.pw + process.env.APP_HASH_SALT; // salt 추가
        const name = req.body.name;

        // ID 중복 체크
        const idCheckQuery = "SELECT * FROM members WHERE user_id = ?";
        connection.query(idCheckQuery, [id], (err, rows, fields) => {
            if (err) throw err;

            if (rows.length > 0) {
                res.send("이미 존재하는 ID입니다.");
            } else {

                // 암호화 키 가져오기
                const hashKey = process.env.APP_HASH_KEY;

                // 암호화 키를 추가하여 암호화
                const hashedPw = crypto.pbkdf2Sync(pw, hashKey, 100000, 64, "sha512").toString("hex");

                const query = "INSERT INTO members (user_id, user_password, user_name) VALUES (?, ?, ?)";
                const values = [id, hashedPw, name];

                connection.query(query, values, (err, rows, fields) => {
                    if (err) throw err;
                    console.log(rows);
                    res.send(rows);
                });
            }
        });
    });

    router.post("/login", (req, res) => {
        const id = req.body.id;
        const pw = req.body.pw + process.env.APP_HASH_SALT; // salt 추가

        // 암호화 키 가져오기
        const hashKey = process.env.APP_HASH_KEY;

        // 암호화 키를 추가하여 암호화
        const hashedPw = crypto.pbkdf2Sync(pw, hashKey, 100000, 64, "sha512").toString("hex");
        const loginQuery = "SELECT * FROM members WHERE user_id = ?"

        connection.query(loginQuery, [id], (err, rows, fields) => {
            if (err) throw err;

            if (rows.length > 0) {
                if (rows[0].user_password === hashedPw) {
                    const payload = {
                        user_id: rows[0].user_id,
                        user_name: rows[0].user_name,
                    };

                    // 토큰 만료시간 설정 exipreIn을 1h로 설정하면 1시간 후 토큰이 만료됨
                    // d = day, h = hour, m = minute, s = second
                    const options = {
                        expiresIn: "1h",
                    };
                    const refreshOptions = {
                        expiresIn: "3d",
                    };

                    // 토큰 생성
                    const secret = process.env.APP_SECRET_KEY;
                    const token = jwt.sign(payload, secret, options);
                    const refreshToken = jwt.sign(payload, secret, refreshOptions);

                    // 쿠키에 토큰 저장
                    res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 259200000 }); // 3 days

                    // 토큰을 헤더에 저장
                    res.send({
                        success: true,
                        message: "로그인 성공",
                        user_id: rows[0].user_id,
                        user_name: rows[0].user_name,
                        token: token,
                        refreshToken: refreshToken,
                    });
                } else {
                    res.send("올바른 ID와 PW를 입력해주세요.");
                }
            } else {
                res.send("올바른 ID와 PW를 입력해주세요.");
            }
        });
    });

    return router;
};
