const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

router.post("/create-group",controller.createGroup);
router.get("/:grName",controller.getGroupe);
router.get("/members/:grName",controller.getMembers);
router.post("/all",controller.getAll);
module.exports = router;