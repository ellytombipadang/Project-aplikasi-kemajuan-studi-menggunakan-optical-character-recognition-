const Joi = require('joi');
var csvToJSON = require("csvtojson");
const { messageText } = require('../scripts/messageText');
const fetch = require('node-fetch');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const sql = require("./db");
const { uploadFile } = require('../scripts/uploadFile');
const { filterQuery } = require('../scripts/filterQuery');
const tableName = "mahasiswa";
const primaryKey = "npm";
var csv = require("csvtojson");
const tokenFormX = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9vd25lcl9pZCI6ImE5YzkyMjUxLWQ4YzQtNGNjZS1hNjJiLTU1M2QyMzA3OTczYSIsIndvcmtlcl90b2tlbl9pZCI6IjFiMjg3NmRlLTJmOGYtNGU2OC04MGI5LThkMjczMTU1YTM4ZiIsInVzZXJfaWQiOiJhOWM5MjI1MS1kOGM0LTRjY2UtYTYyYi01NTNkMjMwNzk3M2EifQ.FrSGyeIaNQLbooGp90ACyGsE7KPfRoIAty2sWKU2JOg";
const schema = Joi.object({
    nama_depan: Joi.string().required().error(errors => {
        messageText(errors, "Nama depan");
        return errors;
    }),
    nama_belakang: Joi.string(),
    npm: Joi.number().required().messages().error(errors => {
        messageText(errors, "NPM");
        return errors;
    }),
    tanggal_lahir: Joi.date().required().error(errors => {
        messageText(errors, "Tanggal lahir");
        return errors;
    }),
    no_hp: Joi.number().min(11).required().error(errors => {
        messageText(errors, "Nomor HP");
        return errors;
    }),
    alamat: Joi.required().error(errors => {
        messageText(errors, "Alamat");
        return errors;
    }),
    jenis_kelamin: Joi.required().error(errors => {
        messageText(errors, "Jenis kelamin");
        return errors;
    }),
    id_jurusan: Joi.required().error(errors => {
        messageText(errors, "Id Jurusan");
        return errors;
    }),
})

const csv_to_json = async (path) => {
    const jsonArrayObj = await csv().fromFile(path);
    return jsonArrayObj;
}

const json_to_csv = (data) => {
    let header = "Mata kuliah,Kode matkul,sks,st_mk,Nilai akhir,ket\n";
    let csvStr = "";
    let transkrip = data;
    csvStr += header;
    Object.keys(transkrip).forEach(hal => {
        let column = [
            {
                "data": [],
                "id": "matakuliah"
            },
            {
                "data": [],
                "id": "kd_matkul"
            },
            {
                "data": [],
                "id": "sks"
            },
            {
                "data": [],
                "id": "st_mk"
            },
            {
                "data": [],
                "id": "nilai_akhir"
            },
            {
                "data": [],
                "id": "ket"
            }
        ];
        const { documents } = transkrip[hal]
        const { data } = documents[0];
        // Jumlah data
        let a = data["kd_matkul"].split("\n"); // -> [122,123,]
        // a.pop();
        let leng = a.length;
        for (let i = 0; i < leng; i++) {
            let arr = [];
            column.forEach(colItem => {
                if (colItem.data.length === 0) {
                    let splt = data[colItem.id].split("\n");
                    // splt.pop();
                    colItem.data = splt;
                }
                arr.push(colItem.data[i]);
            })
            csvStr += arr.join(",");
            csvStr += "\n";
        }
    })
    return csvStr
}

async function post_request(url, header, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: header,
        body: body,
    }).catch(err => {
        throw err;
    });
    const data = await res.json();//assuming data is json
    return data;
}
async function extractEachPage(filePath) {
    // Read the PDF file
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const totalPages = pdfDoc.getPageCount();
    let arr = [];
    for (let i = 0; i < totalPages; i++) {
        // Create a new document
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);

        // Add the copied page to the new document
        newPdf.addPage(copiedPage);

        // Serialize the new document to bytes (writeable buffer)
        const pdfBytes = await newPdf.save();
        arr.push(pdfBytes);
    };
    return arr;
}

exports.checkTranskrip = (req, res) => {
    const url = 'https://worker.formextractorai.com/v2/extract';
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No files were uploaded.');
    };
    const pdfFile = req.files.pdf;  // get the uploaded file
    let uploadPath = path.join(__dirname, 'uploads', pdfFile.name);
    uploadPath = "uploads";
    pdfFile.mv(uploadPath, async (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        try {
            // Process the PDF and save each page
            const page = await extractEachPage(uploadPath);
            const hal1 = await post_request(
                url,
                {
                    accept: 'application/json',
                    'X-WORKER-EXTRACTOR-ID': '27c11563-5c1a-479b-8352-0b103e4097ed',
                    'X-WORKER-ENCODING': 'raw',
                    'X-WORKER-PDF-DPI': '150',
                    'X-WORKER-ASYNC': 'false',
                    'X-WORKER-AUTO-ADJUST-IMAGE-SIZE': 'true',
                    'X-WORKER-OUTPUT-OCR': 'false',
                    'X-WORKER-PROCESSING-MODE': 'per-page',
                    'content-type': 'image/*',
                    'X-WORKER-TOKEN': tokenFormX
                },
                page[0]
            );
            const { documents } = hal1;
            const { data } = documents[0];
            const npm = data.npm;
            const nama_mahasiswa = data.nama_mahasiswa;
            const tanggal_lahir = data.tanggal_lahir;
            const dosen_wali = data.dosen_wali;
            res.status(200).send({
                result: {
                    npm,
                    nama_mahasiswa,
                    tanggal_lahir,
                    dosen_wali
                }
            });
        } catch (err) {
            res.status(500).send('Error processing the PDF file');
        }
        fs.unlinkSync(uploadPath);
    })
}

exports.ekstraDocument = (req, res) => {
    // https://help.formx.ai/reference/document-extraction
    const url = 'https://worker.formextractorai.com/v2/extract';
    const npm = req?.body?.npm;
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No files were uploaded.');
    }
    const pdfFile = req.files.pdf;  // get the uploaded file
    let uploadPath = path.join(__dirname, 'uploads', pdfFile.name);
    uploadPath = "uploads/";
    // Save the file temporarily in the uploads directory
    pdfFile.mv(uploadPath, async (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        try {
            // Process the PDF and save each page
            const data = await extractEachPage(uploadPath);
            const hal1 = await post_request(
                url,
                {
                    accept: 'application/json',
                    'X-WORKER-EXTRACTOR-ID': '855625ff-ab94-4daa-b142-bab5c6e77527',
                    'X-WORKER-ENCODING': 'raw',
                    'X-WORKER-PDF-DPI': '150',
                    'X-WORKER-ASYNC': 'false',
                    'X-WORKER-AUTO-ADJUST-IMAGE-SIZE': 'true',
                    'X-WORKER-OUTPUT-OCR': 'false',
                    'X-WORKER-PROCESSING-MODE': 'per-page',
                    'content-type': 'image/*',
                    'X-WORKER-TOKEN': tokenFormX
                },
                data[0]
            );
            const hal2 = await post_request(
                url,
                {
                    accept: 'application/json',
                    'X-WORKER-EXTRACTOR-ID': '78ae9fa7-86e6-4ac2-b287-54bdfac0f0b3',
                    'X-WORKER-ENCODING': 'raw',
                    'X-WORKER-PDF-DPI': '150',
                    'X-WORKER-ASYNC': 'false',
                    'X-WORKER-AUTO-ADJUST-IMAGE-SIZE': 'true',
                    'X-WORKER-OUTPUT-OCR': 'false',
                    'X-WORKER-PROCESSING-MODE': 'per-page',
                    'content-type': 'image/*',
                    'X-WORKER-TOKEN': tokenFormX
                },
                data[1]
            );
            const dates = new Date().getTime()
            let link = `${req.protocol}://${req.hostname}:3005/transkrip/${npm}/transkrip_${dates}.csv`;
            let path = `./public/transkrip/${npm}`
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }
            const content = json_to_csv({
                hal1: hal1,
                hal2: hal2
            });
            console.log({
                hal1: hal1,
                hal2: hal2
            })
            // Create the CSV file
            fs.writeFileSync(path + `/transkrip_${dates}.csv`, content);
            const result = await csv_to_json(path + `/transkrip_${dates}.csv`)
            res.status(200).send({ link: link, result: result });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error processing the PDF file');
        }
    });
};

exports.inputFoto = (req, res) => {
    const foto = req.files?.foto;
    if (!foto) {
        res.status(200).send();
        return;
    };
    const { id } = req.params;
    let url = {
        protocol: req.protocol,
        host: req.get("host"),
        fileDestination: `uploads/${id}`,
        date: new Date().getTime()
    }
    const { url1 } = uploadFile({
        foto,
    }, url, "jpg");
    let sqlQuery;
    sqlQuery = `
        UPDATE 
            mahasiswa 
        SET 
            foto = '${url1}' 
        WHERE 
            mahasiswa.npm = '${id}'`
    sql.query(sqlQuery, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    })
}

exports.edit = async (req, res) => {
    const { id } = req.params;
    try {
        const value = await schema.validateAsync({ ...req.body });
        let queryValue;
        queryValue = `UPDATE ${tableName} SET ? WHERE ${primaryKey} = '${id}'`;
        sql.query(queryValue, req.body, (err, result) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send(err);
                return;
            }
            res.status(200).send(result);
        });
    }
    catch (err) {
        res.status(500).send(err);
    };
}

exports.readCSVFile = (req, res) => {
    // https://stackoverflow.com/questions/16831250/how-to-convert-csv-to-json-in-node-js
    const csv = req.files?.csv;
    let url = {
        protocol: req.protocol,
        host: req.get("host"),
        fileDestination: `transkrip`,
        date: new Date().getTime()
    }
    const { url1 } = uploadFile({
        csv,
    }, url, "csv");
    let timeOut;
    timeOut = setTimeout(() => {
        let fileName = url1.split("/")[url1.split("/").length - 1];
        let csvFilePath = `./public/transkrip/${fileName}`;
        if (fs.existsSync(csvFilePath)) {
            csvToJSON()
                .fromFile(csvFilePath)
                .then(function (jsonArrayObj) { //when parse finished, result will be emitted here.
                    fs.unlinkSync(csvFilePath);
                    res.status(200).send(jsonArrayObj);
                })
        } else {
            res.status(500).send("FILE not exist")
        }
    }, 1100);
}

exports.input = async (req, res) => {
    // const { nim, nama_depan, nama_belakang, alamat, jenis_kelamin } = req.body;
    try {
        const value = await schema.validateAsync({ ...req.body });
        let queryValue;
        queryValue = `INSERT INTO ${tableName} SET ?`;
        sql.query(queryValue, req.body, (err, result) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send(err);
                return;
            }
            res.status(200).send(result);
        });
    }
    catch (err) {
        res.status(500).send(err);
    };
}
exports.getData = (req, res) => {
    let queryValue;
    const query = req.query;
    queryValue =
        `
            SELECT 
                mahasiswa.*,
                CONCAT(nama_depan,' ',nama_belakang) AS mahasiswa
            FROM 
                mahasiswa
            ${filterQuery(query)}
        `;

    sql.query(queryValue, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}

exports.selectedMahasiswa = (req, res) => {
    let queryValue;
    const { id } = req.params;
    queryValue =
        `
            SELECT 
                ${tableName}.*
            FROM 
                ${tableName}
            WHERE
                ${tableName}.${primaryKey} = '${id}'
        `;
    sql.query(queryValue, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}


exports.csvToJSON = async (req, res) => {
    if (fs.existsSync("./public/transkrip.csv")) {
        try {
            const result = await csv_to_json("./public/transkrip.csv")
            res.status(200).send({ link: `${req.protocol}://${req.get("host")}/transkrip.csv`, result: result })
            // res.status(200).send(result);
        } catch (err) {
            throw err;
        }
    } else {
        res.status(500).send("FILE not exist");
    }
}


exports.input_khs = (req, res) => {
    let queryValue;
    queryValue = `INSERT INTO khs SET ?`;
    sql.query(queryValue, req.body, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    });
}

exports.input_nilai_khs = (req, res) => {
    let queryValue;
    queryValue = `INSERT INTO nilai_khs SET ?`;
    sql.query(queryValue, req.body, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    });
}

exports.get_khs = (req, res) => {
    let queryValue;
    const { id } = req.params;
    queryValue =
        `
            SELECT 
                khs.*
            FROM 
                khs
            WHERE
                npm = '${id}'
            ORDER BY 
                tanggal_masuk DESC
        `;

    sql.query(queryValue, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}

exports.get_nilai_khs = (req, res) => {
    let queryValue;
    const { id } = req.params;
    queryValue =
        `
            SELECT 
                nilai_khs.*
            FROM 
                nilai_khs
            WHERE
                id_khs = '${id}'
        `;

    sql.query(queryValue, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}