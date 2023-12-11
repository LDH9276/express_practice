const express = require("express");
const app = express();
const port = 3005;
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// mysql connection
const connection = mysql.createConnection({
    host: process.env.APP_DB_HOST,
    user: process.env.APP_SQLUSER,
    password: process.env.APP_SQLPASS,
    database: process.env.APP_SQLDB,
});

connection.connect();

const userRouter = require("./users/user")(connection);
const tokenRouter = require("./users/token")(connection);
const boardRouter = require("./board/board")(connection);
const imgUploadRouter = require("./board/upload")(connection);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: "*" })); // vite 로컬 서버 주소

app.get("/", (req, res) => {
    res.send("Hello World!");
});

///////////////////////////////////////
// 1. 회원가입 /users/join (POST)     //
// 2. 로그인   /users/login (POST)    //
// 3. 토큰검증 /token (POST)          //
// 4. 게시판   /board (GET)           //
///////////////////////////////////////

app.use("/users", userRouter);
app.use("/token", tokenRouter);
app.use("/board", boardRouter);
app.use("/uploads", imgUploadRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
