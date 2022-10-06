const express = require("express");
const controller = require("./controller");
const fileService = require("../../helpers/fileService");
const router = express.Router();

router.get("/", controller.get);
router.get("/:video/details", controller.getDetails);
router.get("/:video", fileService.getFileDetails("video"));
router.get(
  "/play/:video",
  fileService.stream({ fileName: "video", contentType: "video/mp4" })
);

module.exports = router;
