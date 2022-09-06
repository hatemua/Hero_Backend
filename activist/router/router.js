const express = require("express");
const router = express.Router();

const controller = require("../controller/controller");
router.get("/:wallet",controller.getActivist);
router.get("/transactions/:wallet",controller.getTransactions);
router.post("/add-media",controller.addMedia)
router.get("/",controller.getActivists);
module.exports = router;