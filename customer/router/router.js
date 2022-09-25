const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

router.get("/transactions/:wallet",controller.getTransactions);
router.post("/react-post",controller.reactPost);
router.post("/get-subscriptions",controller.getSubscription);
router.post("/HeroIDExist",controller.getExistHeroID);
router.post("/comment-post",controller.commentPost);
router.post("/isSubscribed",controller.isSubscribed);
router.post("/change-password",controller.changePassword);
module.exports = router;