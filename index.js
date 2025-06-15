
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const port = 3005;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "private")));

require("./routes/mahasiswa.route")(app);
require("./routes/dosen.route")(app);
require("./routes/dosen_wali.route")(app);
require("./routes/auth.route")(app);
require("./routes/prodi.route")(app);
require("./routes/jurusan.route")(app);
require("./routes/matakuliah.route")(app);
require("./routes/dns.route")(app);
require("./routes/csv.route")(app);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
