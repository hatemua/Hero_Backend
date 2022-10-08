const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
router.get("/get-video/:vdName", async function (req, res) {
    console.log(req.headers)
    try{
        const vdName = req.params.vdName;
    var videoPath = path.join(__dirname,"..","..","uploads", vdName);
    var fileExistence = fs.existsSync(videoPath);
    if(!fileExistence){
        return res.status(400).json("Video not found !");
    }
    /*if(path.extname(videoPath) != ".mp4"){
        return res.status(400).json("Invalid video Format !")
    }*/
    const range = req.headers.range;
    if (!range) {
        res.status(400).json("Requires Range header");
    }
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
    }catch(err){
        return res.status(400).json(err.message);
    }
    
});


module.exports = router;