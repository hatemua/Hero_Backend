const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

router.post("/create-group", controller.createGroup);

<<<<<<< HEAD
router.get("/members/:grName",controller.getMembers);
router.get("/supporters/:grName",controller.getSupporters);
router.post("/all",controller.getAll);
router.post("/add-media",controller.addMedia);
router.post("/feed",controller.getFeed);
router.post("/get-comments",controller.getComments);
router.post("/get-likes",controller.getLikes);
router.post("/get-dislikes",controller.getDislikes);
router.post("/getVideosByCirclesTag",controller.getVideosByCirclesTag);

router.get("/:grName",controller.getGroupe);

=======
router.get("/members/:grName", controller.getMembers);
router.get("/supporters/:grName", controller.getSupporters);
router.post("/all", controller.getAll);
router.post("/add-media", controller.addMedia);
router.post("/feed", controller.getFeed);
router.post("/get-comments", controller.getComments);
router.post("/get-likes", controller.getLikes);
router.post("/get-dislikes", controller.getDislikes);
router.get("/:grName", controller.getGroupe);
router.get("/CircleInformation/:grName", controller.getCirleInformation);
>>>>>>> backend_Dev/252_getcircleinformation
module.exports = router;