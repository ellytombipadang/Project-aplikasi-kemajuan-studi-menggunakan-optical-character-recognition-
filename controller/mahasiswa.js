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
})

const json_to_csv = (data, protocol, host) => {
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
        a.pop();
        let leng = a.length;
        for (let i = 0; i < leng; i++) {
            let arr = [];
            column.forEach(colItem => {
                if (colItem.data.length === 0) {
                    let splt = data[colItem.id].split("\n");
                    splt.pop();
                    colItem.data = splt;
                }
                arr.push(colItem.data[i]);
            })
            csvStr += arr.join(",");
            csvStr += "\n";
        }
    })
    if (fs.existsSync("./public/transkrip.csv")) {
        fs.unlinkSync("./public/transkrip.csv")
    }
    // Append the CSV row to the file
    fs.appendFileSync("./public/transkrip.csv", csvStr);
    return `${protocol}://${host}/transkrip.csv`;
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

exports.ekstraDocument = (req, res) => {
    // https://help.formx.ai/reference/document-extraction
    const url = 'https://worker.formextractorai.com/v2/extract';
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
                    'X-WORKER-EXTRACTOR-ID': '0d5b82bc-7198-40b8-bcfb-cd420da99aad',
                    'X-WORKER-ENCODING': 'raw',
                    'X-WORKER-PDF-DPI': '150',
                    'X-WORKER-ASYNC': 'false',
                    'X-WORKER-AUTO-ADJUST-IMAGE-SIZE': 'true',
                    'X-WORKER-OUTPUT-OCR': 'false',
                    'X-WORKER-PROCESSING-MODE': 'per-page',
                    'content-type': 'image/*',
                    'X-WORKER-TOKEN': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9vd25lcl9pZCI6IjM3NjIxZjhlLTEyMTUtNGRiZC05YTUxLTExNTU4YjEyZjdmYiIsIndvcmtlcl90b2tlbl9pZCI6ImYzNzhjMGQyLTE5ZGEtNDg5MS1hYzExLTdiZTcyYjZkZGQ1ZSIsInVzZXJfaWQiOiIzNzYyMWY4ZS0xMjE1LTRkYmQtOWE1MS0xMTU1OGIxMmY3ZmIifQ.KcF7SugUt74qEPTLetkVjjmZUEkwNL0vlDgSGOg-jwc'
                },
                data[0]
            );
            const hal2 = await post_request(
                url,
                {
                    accept: 'application/json',
                    'X-WORKER-EXTRACTOR-ID': '03850ae4-032b-4515-bdde-a61f5f1a7bcc',
                    'X-WORKER-ENCODING': 'raw',
                    'X-WORKER-PDF-DPI': '150',
                    'X-WORKER-ASYNC': 'false',
                    'X-WORKER-AUTO-ADJUST-IMAGE-SIZE': 'true',
                    'X-WORKER-OUTPUT-OCR': 'false',
                    'X-WORKER-PROCESSING-MODE': 'per-page',
                    'content-type': 'image/*',
                    'X-WORKER-TOKEN': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9vd25lcl9pZCI6IjM3NjIxZjhlLTEyMTUtNGRiZC05YTUxLTExNTU4YjEyZjdmYiIsIndvcmtlcl90b2tlbl9pZCI6ImYzNzhjMGQyLTE5ZGEtNDg5MS1hYzExLTdiZTcyYjZkZGQ1ZSIsInVzZXJfaWQiOiIzNzYyMWY4ZS0xMjE1LTRkYmQtOWE1MS0xMTU1OGIxMmY3ZmIifQ.KcF7SugUt74qEPTLetkVjjmZUEkwNL0vlDgSGOg-jwc'
                },
                data[1]
            );
            const link = json_to_csv({
                hal1: hal1,
                hal2: hal2
            }, req.protocol, req.get("host"));
            // Optionally delete the original uploaded file if no longer needed;            
            res.send(link);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error processing the PDF file');
        }
        fs.unlinkSync(uploadPath);
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
        console.log(csvFilePath);
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