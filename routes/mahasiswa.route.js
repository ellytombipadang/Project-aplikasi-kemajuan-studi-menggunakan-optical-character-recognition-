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
  router.post("/ektrak_dns", mahasiswa.extractDNS);
  router.get("/get_data/:id_dosen_wali", mahasiswa.getData);
  router.post("/input_khs", mahasiswa.input_khs);
  router.post("/input_dns", mahasiswa.input_dns);
  router.post("/input_nilai_khs/:id_jurusan", mahasiswa.input_nilai_khs);
  router.post("/input_nilai_dns/:id_jurusan", mahasiswa.input_nilai_dns);
  router.post("/cek_transkrip", mahasiswa.checkTranskrip);
  router.get("/get_khs/:id", mahasiswa.get_khs);
  router.get("/get_nilai_khs/:id", mahasiswa.get_nilai_khs);
  router.get("/get_selected_data/:id", mahasiswa.selectedMahasiswa);
  router.get("/nilai_dns", mahasiswa.getNilaiDNS)
  router.get("/matkul_mengulang2/:npm", mahasiswa.getUlangMatkul2);
  router.get("/matkul_mengulang/:npm", mahasiswa.getUlangMatkul);
  router.delete("/delete_mhs/:npm", mahasiswa.delete)
  // app.use("/mahasiswa",middleWare.checkAuth, router);
  app.use("/mahasiswa",router);
};