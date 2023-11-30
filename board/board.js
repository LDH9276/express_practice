const express = require("express");
const router = express.Router();

module.exports = (connection) => {
    
    // 게시판 글 목록 조회
    router.get("/page/:page", (req, res) => {
        const page = req.params.page;
        if(isNaN(page)) return res.status(400).send("잘못된 요청입니다.");

        const limit = 10;
        const offset = (page - 1) * limit;
        connection.query("SELECT * FROM board LIMIT ?, ?", [offset, limit], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    // 게시판 글 상세 조회
    router.get("/post/:postID", (req, res) => {
        const postID = req.params.postID;
        if(isNaN(postID)) return res.status(400).send("잘못된 요청입니다.");

        connection.query("SELECT * FROM board WHERE postID = ?", [postID], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    // 게시판 글 상세 조회
    router.post("/write", (req, res) => {
        const title = req.body.title;
        const content = req.body.content;
        const writer = req.body.writer;

        if(!title || !content || !writer) return res.status(400).send("잘못된 요청입니다.");

        connection.query("INSERT INTO question (title, content, writer) VALUES (?, ?, ?)", [title, content, writer], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    // 게시판 글 수정
    router.post("/update", (req, res) => {
        const postID = req.body.postID;
        const title = req.body.title;
        const content = req.body.content;
        const writer = req.body.writer;

        if(!postID || !title || !content || !writer) return res.status(400).send("잘못된 요청입니다.");

        connection.query("UPDATE board SET title = ?, content = ?, writer = ? WHERE postID = ?", [title, content, writer, postID], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    // 게시판 글 삭제
    router.post("/delete", (req, res) => {
        const postID = req.body.postID;

        if(!postID) return res.status(400).send("잘못된 요청입니다.");

        connection.query("UPDATE is_deleted FROM board WHERE postID = ?", [postID], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    return router;
};
