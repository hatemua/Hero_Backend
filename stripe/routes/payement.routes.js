const express = require("express");
const router = express.Router();
const payementController = require("../controllers/payement.controllers");

router.post("/create-checkout",payementController.createSession);
// router.post('/create-portal-session', payementController.createPortalSession);
router.post("/save-card",payementController.saveCard);
router.get('/success',payementController.successPage);
router.get("/monthly-payment",payementController.monthPay)
// router.get("/data/:type",payementController.getData);
module.exports = router;