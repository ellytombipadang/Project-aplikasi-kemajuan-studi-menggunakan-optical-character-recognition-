module.exports = app => {
    const dosen = require("./../controller/dosen_wali");
    const middleWare = require("./../middleware/middleware");
    var router = require("express").Router();
    router.get("/", (req, res) => {
        res.send("Hello world");
    });
    router.post("/input", dosen.inputDosenWali);
    router.get("/get_data/:id_jurusan", dosen.getData);
    app.use("/dosen_wali", router);
};