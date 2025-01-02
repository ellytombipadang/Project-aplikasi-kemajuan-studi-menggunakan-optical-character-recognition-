module.exports = app => {
    const dns = require("./../controller/dns");
    const middleWare = require("./../middleware/middleware");
    var router = require("express").Router();
    router.get("/", (req, res) => {
      res.send("Hello world");
    });
    router.get("/mahasiswa/:npm", dns.getDNSmahasiswa);
    app.use("/dns",middleWare.checkAuth, router);
  };