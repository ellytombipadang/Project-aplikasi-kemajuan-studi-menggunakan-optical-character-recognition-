module.exports = app => {
  const mahasiswa = require("./../controller/mahasiswa");
  const middleWare = require("./../middleware/middleware");
  var router = require("express").Router();
  router.get("/", (req, res) => {
    res.send("Hello world");
  });

  router.post("/input", mahasiswa.input);
  router.put("/edit/:id", mahasiswa.edit);
  router.put("/input_foto/:id", mahasiswa.inputFoto);
  router.post("/read_csv", mahasiswa.readCSVFile);
  router.post("/ektrak", mahasiswa.ekstraDocument);
  router.get("/get_data", mahasiswa.getData);
  router.post("/input_khs", mahasiswa.input_khs);
  router.post("/input_nilai_khs", mahasiswa.input_nilai_khs);
  router.post("/cek_transkrip", mahasiswa.checkTranskrip);
  router.get("/csv_to_json", mahasiswa.csvToJSON);
  router.get("/get_khs/:id", mahasiswa.get_khs);
  router.get("/get_nilai_khs/:id", mahasiswa.get_nilai_khs);
  router.get("/get_selected_data/:id", mahasiswa.selectedMahasiswa);
  app.use("/mahasiswa",middleWare.checkAuth, router);
};