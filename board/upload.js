const express = require("express");
const multer = require("multer");
const router = express.Router();

module.exports = (connection) => {
    // 업로드되는 파일의 저장장소 설정
    const storage = multer.diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    });

    // 업로드 미들웨어 생성
    const upload = multer({ storage });

    // 이미지 업로드 경로 설정
    router.post("/", upload.array("photos", 10), (req, res) => {
        // 업로드된 이미지 파일 정보
        const files = req.files;

        // 업로드된 이미지 파일들의 정보를 담을 배열
        let fileInfos = [];

        files.forEach((file) => {
            // 업로드된 이미지 파일의 이름
            const fileName = file.originalname;

            // 업로드된 이미지 파일의 크기
            const fileSize = file.size;

            // 업로드된 이미지 파일의 형식
            const fileType = file.mimetype;

            // 파일 정보를 배열에 추가
            fileInfos.push({
                fileName,
                fileSize,
                fileType,
            });
        });

        // 응답 생성
        res.status(200).json(fileInfos);
    });
    return router;
};
