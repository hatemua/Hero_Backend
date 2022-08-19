const express = require("express");
const router = express.Router();

const controller = require("../controller/controller");
router.get("/:wallet",controller.getActivist);
router.get("/transactions/:wallet",controller.getTransactions);
router.get("/",controller.getActivists);
module.exports = router;