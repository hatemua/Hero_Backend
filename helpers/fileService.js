const fs = require("fs");
const path = require("path");

// service attache file to response
exports.stream =
  (
    config = {
      // file name in params : exp => :video
      fileName: "",
      // Headers "Content-Type" to set here
      contentType: "video/mp4",
    }
  ) =>
  (req, res) => {
    try {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        req.params[config.fileName]
      );

      const isFileExist = fs.existsSync(filePath);
      const range = req.headers.range || "";

      if (!isFileExist) return res.status(404).json("file not found !");

      const fileSize = fs.statSync(filePath).size;
      const CHUNK_SIZE = 10 ** 6;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
      const contentLength = end - start + 1;

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": config.contentType,
      };

      res.writeHead(206, headers);
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }
  };

// service attache file to response
exports.getFileDetails =
  (fileName = "") =>
  (req, res) => {
    try {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        req.params[fileName]
      );

      const isFileExist = fs.existsSync(filePath);
      console.log({ filePath });
      if (!isFileExist) return res.status(404).json("file not found !");

      const details = fs.statSync(filePath);
      return res.json((fileName, details));
    } catch (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }
  };
