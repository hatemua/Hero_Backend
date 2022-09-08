const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

router.get("/transactions/:wallet",controller.getTransactions);
router.post("/react-post",controller.reactPost);
router.post("/comment-post",controller.commentPost);
module.exports = router;