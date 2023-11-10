const express = require("express");
const app = express();
const port = 3005;
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const crypto = require("crypto");
require("dotenv").config();
const cookieParser = require('cookie-parser')

// mysql connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root", // mysql에 아이디를 넣는다.
    password: "0000", // mysql의 비밀번호를 넣는다.
    database: "adm_test", //위에서 만든 데이터베이스의 이름을 넣는다.
});

connection.connect();
const userRouter = require("./users/user")(connection);
const tokenRouter = require("./users/token")(connection);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: "http://localhost:5173" })); // vite 로컬 서버 주소
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {


    res.send("Hello World!");
});

///////////////////////////////////////
// 1. 회원가입 /users/join (POST)    //
// 2. 로그인 /users/login (POST)     //
// 3. 토큰검증 /token (POST)         //
///////////////////////////////////////

app.use("/users", userRouter);
app.use("/token", tokenRouter);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
