module.exports = app => {
    const prodi = require("./../controller/prodi");
    const middleWare = require("./../middleware/middleware");
    var router = require("express").Router();
    router.get("/", (req, res) => {
        res.send("Hello world");
    });
    router.post("/input_jurusan", prodi.inputJurusan);
    router.post("/input_prodi", prodi.inputProdi);
    router.get("/get_data", prodi.getData);
    app.use("/prodi", middleWare.checkAuth, router);
};