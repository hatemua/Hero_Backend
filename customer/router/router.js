const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

router.get("/transactions/:wallet",controller.getTransactions);
module.exports = router;