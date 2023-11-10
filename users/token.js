const express = require("express");
const jwt = require("jsonwebtoken");

module.exports = (connection) => {
    const router = express.Router();

    router.post("/", (req, res) => {
        let token = req.headers["authorization"];
        if (!token) return res.status(401).send({ auth: false, message: "No token provided." });
        token = token.split(" ")[1];

        jwt.verify(token, process.env.APP_SECRET_KEY, function (err, decoded) {

            // 토큰이 만료되었거나 검증 실패
            if (err) return res.status(500).send({ auth: false, message: "Failed to authenticate token." });

            // 검증 완료 후 토큰에 담긴 정보 가져오기
            const userId   = decoded.id;
            const userName = decoded.name;

            // 검증 완료 후 전송
            res.send({
                auth: true,
                message: "검증성공",
                user_id: userId,
                name: userName,
            });
        });
    });

    return router;
};
