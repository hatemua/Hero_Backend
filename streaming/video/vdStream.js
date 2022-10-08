const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
/*
router.get("/get-video/:vdName", async function (req, res) {
    console.log(req.headers)
    try{
        const vdName = req.params.vdName;
    var videoPath = path.join(__dirname,"..","..","uploads", vdName);
    var fileExistence = fs.existsSync(videoPath);
    if(!fileExistence){
        return res.status(400).json("Video not found !");
    }
    //if(path.extname(videoPath) != ".mp4"){
     //   return res.status(400).json("Invalid video Format !")
   // }
    let range = req.headers.range;
    if (!range) {
        range=0;
    }
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = 0;
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
*/


router.get("/get-video/:vdName", async function (req, res) {
    const vdName = req.params.vdName;
const path = "uploads/"+vdName
  const stat = fs.statSync(path)
  console.log(stat);
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return
    }
    
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/avi',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/avi',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }

});
module.exports = router;