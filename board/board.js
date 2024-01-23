const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

module.exports = (connection) => {
    
    // 게시판 글 목록 조회
    router.get("/page/:page", (req, res) => {
        const page = req.params.page;
        if(isNaN(page)) return res.status(400).send("잘못된 요청입니다.");

        const limit = 10;
        const offset = (page - 1) * limit;
        connection.query("SELECT * FROM question LIMIT ?, ?", [offset, limit], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    // 게시판 글 상세 조회
    router.get("/post/:postID", (req, res) => {
        const postID = req.params.postID;
        if(isNaN(postID)) return res.status(400).send("잘못된 요청입니다.");

        connection.query("SELECT * FROM question WHERE id = ?", [postID], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    router.post("/question", upload.none(), (req, res) => {
        const title = req.body.title;
        const content = req.body.content;
        const writer = req.body.writer;

        connection.query("SELECT * FROM member WHERE id = ?", [writer], (err, rows, fields) => {
            if (err) throw err;
            if(rows.length === 0) return res.status(400).send("잘못된 요청입니다.");
        });

        const files = req.body.files;

        if(!title || !content || !writer) return res.status(400).send("잘못된 요청입니다.");

        connection.query("INSERT INTO question (name, content, writer, files) VALUES (?, ?, ?, ?)", [title, content, writer, files], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    router.post("/answer", upload.none(), async (req, res) => {
        const question_id = req.body.question_id;
        const content = req.body.content;
    
        connection.query("SELECT * FROM member WHERE id = ?", [writer], (err, rows, fields) => {
            if (err) throw err;
            if(rows.length === 0) return res.status(400).send("잘못된 요청입니다.");
        });

        
        if(!question_id || !content) return res.status(400).send("잘못된 요청입니다.");
    
        try {
            await new Promise((resolve, reject) => {
                connection.query("INSERT INTO answer (question_id, content) VALUES (?, ?)", [question_id, content], (err, rows, fields) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
    
            const rows = await new Promise((resolve, reject) => {
                connection.query("UPDATE question SET is_solved = 1 WHERE id = ?", [question_id], (err, rows, fields) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
    
            res.send(rows);
        } catch (err) {
            throw err;
        }
    });

    // 게시판 글 수정
    router.post("/update", (req, res) => {
        const postID = req.body.postID;
        const title = req.body.title;
        const content = req.body.content;
        const writer = req.body.writer;

        if(!postID || !title || !content || !writer) return res.status(400).send("잘못된 요청입니다.");

        connection.query("UPDATE answer SET name = ?, content = ?, writer = ? WHERE id = ?", [title, content, writer, postID], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    // 게시판 글 삭제
    router.post("/delete", (req, res) => {
        const postID = req.body.postID;

        if(!postID) return res.status(400).send("잘못된 요청입니다.");

        connection.query("UPDATE is_deleted FROM board WHERE id = ?", [postID], (err, rows, fields) => {
            if (err) throw err;
            res.send(rows);
        });
    });

    return router;
};
