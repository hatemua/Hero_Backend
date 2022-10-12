const express = require("express");
const router = express.Router();

const controller = require("../controller/controller");
router.get("/:wallet",controller.getActivist);
router.get("/transactions/:wallet",controller.getTransactions);
router.post("/add-media",controller.addMedia);
router.post("/react-post",controller.reactPost);
router.post("/comment-post",controller.commentPost);
router.post("/getActivistByAccID",controller.getActivistByAccID);

router.get("/",controller.getActivists);
module.exports = router;