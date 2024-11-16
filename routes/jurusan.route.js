module.exports = app => {
    const jurusan = require("./../controller/jurusan");
    const middleWare = require("./../middleware/middleware");
    var router = require("express").Router();
    router.get("/", (req, res) => {
      res.send("Hello world");
    });
    router.post("/check_input", jurusan.checkInput);
    router.get("/get_data", jurusan.getData);
    app.use("/jurusan", router);
  };