const express = require("express");
const jwt = require("jsonwebtoken");

module.exports = (connection) => {
    const router = express.Router();

    router.post("/", (req, res) => {
        let token = req.headers["authorization"];
        if (!token) return res.status(401).send({ auth: false, message: "No token provided." });
        token = token.split(" ")[1];

        jwt.verify(token, process.env.APP_SECRET_KEY, function (err, decoded) {

            // 토큰이 만료되었다면 쿠키에서 리프레시를 가져온다.
            if (err && err.name === "TokenExpiredError") {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) return res.status(401).send({ auth: false, message: "No token provided." });

                jwt.verify(refreshToken, process.env.APP_SECRET_KEY, function (err, decoded) {
                    if (err) return res.status(500).send({ auth: false, message: "Failed to authenticate token." });

                    const payload = {
                        user_id: decoded.user_id,
                        username: decoded.username,
                    };

                    const options = {
                        expiresIn: "1h",
                    };

                    const secret = process.env.APP_SECRET_KEY;
                    const token = jwt.sign(payload, secret, options);

                    res.send({
                        auth: true,
                        type: "refresh",
                        message: "토근 재발급",
                        user_id: userId,
                        name: userName,
                        token: token,
                    });
                });
            }

            // 검증 완료 후 토큰에 담긴 정보 가져오기
            const userId   = decoded.id;
            const userName = decoded.name;

            // 검증 완료 후 전송
            res.send({
                auth: true,
                type: "verify",
                message: "검증성공",
                user_id: userId,
                name: userName,
            });
        });
    });

    return router;
};
