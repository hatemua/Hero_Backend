const express = require("express");
const router = express.Router();
const videosRouter = require("./video/router");

exports.useModules = ({ server, prefix = "/api/v1" }) => {
  router.use("/videos", videosRouter);

  server.use(prefix, router);
  server.get(prefix, (req, res) => res.send(prefix));
};
