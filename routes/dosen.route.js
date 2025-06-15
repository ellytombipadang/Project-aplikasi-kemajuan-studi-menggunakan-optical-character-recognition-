module.exports = app => {
    const dosen = require("./../controller/dosen");
    const middleWare = require("./../middleware/middleware");
    var router = require("express").Router();
    router.get("/", (req, res) => {
        res.send("Hello world");
    });
    router.post("/input", dosen.input);
    router.put("/edit/:id", dosen.edit);
    router.put("/input_foto/:id", dosen.inputFoto);
    router.get("/get_data/:id_jurusan", dosen.getData);
    router.get("/get_selected_data/:id", dosen.selectedDosen);
    router.delete("/delete_dsn/:nidn", dosen.delete)
    app.use("/dosen", router);
};