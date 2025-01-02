module.exports = app => {
    const matakuliah = require("./../controller/matakuliah");
    const middleWare = require("./../middleware/middleware");
    var router = require("express").Router();
    router.get("/", (req, res) => {
      res.send("Hello world");
    });
    router.get("/get_data/:id_jurusan", matakuliah.get_data);
    router.post("/input", matakuliah.input);
    router.post("/read_csv", matakuliah.readCSVFile);
    router.delete("/delete_matkul/:id_mata_kuliah", matakuliah.delete);
    app.use("/mata_kuliah",middleWare.checkAuth, router);
  };