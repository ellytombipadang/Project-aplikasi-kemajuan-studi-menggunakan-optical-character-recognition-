module.exports = app => {
    const csv = require("./../controller/csv");
    const middleWare = require("./../middleware/middleware");
    var router = require("express").Router();
    router.get("/", (req, res) => {
      res.send("Hello world");
    });
    router.post("/read_csv", csv.readCSVFile);
    // app.use("/mahasiswa",middleWare.checkAuth, router);
    app.use("/csv",router);
  };