const Joi = require('joi');
var csvToJSON = require("csvtojson");
let csv_ = require('convert-csv-to-json');
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
// const tokenFormX = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9vd25lcl9pZCI6IjgxYzM5YjU1LWZmM2UtNDc4ZS1iNDdhLTdkMjE0ZjJkNTY0NSIsIndvcmtlcl90b2tlbl9pZCI6ImE3OTcxNWVlLWY1YjEtNDIxMS1iMDk5LTUyZjM3MTk2OTYzNyIsInVzZXJfaWQiOiI4MWMzOWI1NS1mZjNlLTQ3OGUtYjQ3YS03ZDIxNGYyZDU2NDUifQ.3fk5YfD3Cn3Y9UZkOIK8iv4qKmZbYAf7aRcHlldsDwc";
const tokenFormX = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9vd25lcl9pZCI6IjkzMmRhY2QyLTU5YmYtNDBiYi05MDZkLTk2MGY2Yjg5Nzk0OCIsIndvcmtlcl90b2tlbl9pZCI6IjY1NWUxMzMxLTZmYmItNGRhOC1iYzk4LTY4ZjhiYmMwZGIyZSIsInVzZXJfaWQiOiI5MzJkYWNkMi01OWJmLTQwYmItOTA2ZC05NjBmNmI4OTc5NDgifQ.cHcefpH173cID7kGpVikd_k2FTM_JACPqNbqdjeKS98";
const schema = Joi.object({
    nama: Joi.string().required().error(errors => {
        messageText(errors, "Nama");
        return errors;
    }),
    asal_sma: Joi.string().required().error(errors => {
        messageText(errors, "Asal SMA");
        return errors;
    }),
    id_dosen_wali: Joi.string(),
    id_users: Joi.string(),
    npm: Joi.number().required().messages().error(errors => {
        messageText(errors, "NPM");
        return errors;
    }),
    tanggal_lahir: Joi.date().error(errors => {
        messageText(errors, "Tanggal lahir");
        return errors;
    }),
    no_hp: Joi.number().error(errors => {
        messageText(errors, "Nomor HP");
        return errors;
    }),
    alamat: Joi.string().error(errors => {
        messageText(errors, "Alamat");
        return errors;
    }),
    jenis_kelamin: Joi.string().error(errors => {
        messageText(errors, "Jenis kelamin");
        return errors;
    }),
    id_jurusan: Joi.string().error(errors => {
        messageText(errors, "Id Jurusan");
        return errors;
    }),
})

const csv_to_json = async (path) => {
    const jsonArrayObj = await csv().fromFile(path);
    return jsonArrayObj;
}
const format_dns = (obj) => {
    let header = "KMK, Mata kuliah, SKS, ST MK, Nilai Akhir, Ket\n";
    const { data } = obj.documents[0];
    let csvStr = "";
    csvStr += header;
    data.tabel.forEach((item) => {
        let arr = []
        Object.keys(item).forEach(prop => {
            arr.push(`${item[prop]}`);
        });
        csvStr += `${arr.join(",")}\n`;
    });
    return csvStr
}

const json_to_csv = (data) => {
    let header = "Mata kuliah,Kode matkul,sks,st_mk,Nilai akhir,ket\n";
    let csvStr = "";
    let transkrip = data;
    csvStr += header;
    Object.keys(transkrip).forEach(hal => {
        const { documents } = transkrip[hal]
        const { data } = documents[0];
        data.table.forEach((x) => {
            const { k_m_k, nama_mata_kuliah, sks, st_mk, n_a, ket } = x;
            csvStr += `${nama_mata_kuliah},${k_m_k},${sks},${st_mk},${n_a},${ket}`;
            csvStr += "\n";
        })
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
                    'X-WORKER-EXTRACTOR-ID': '4cabf3a9-6768-4df3-8d3b-161106501cce',
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
            const npm = data.n_p_m;
            const nama_mahasiswa = data.nama_mahasiswa;
            res.status(200).send({
                result: {
                    npm,
                    nama_mahasiswa,
                }
            });
        } catch (err) {
            res.status(500).send('Error processing the PDF file');
        }
        fs.unlinkSync(uploadPath);
    })
}

exports.extractDNS = (req, res) => {
    const url = 'https://worker.formextractorai.com/v2/extract';
    const npm = req?.body?.npm;
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No files were uploaded.');
    }
    const pdfFile = req.files.pdf;  // get the uploaded file
    let uploadPath = path.join(__dirname, 'uploads', pdfFile.name);
    uploadPath = "uploads/";
    pdfFile.mv(uploadPath, async (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        try {
            const pdfBytes = fs.readFileSync(uploadPath)
            const hal1 = await post_request(
                url,
                {
                    accept: 'application/json',
                    'X-WORKER-EXTRACTOR-ID': "4fa6f922-c5aa-4188-aebb-22494c286f62",
                    'X-WORKER-ENCODING': 'raw',
                    'X-WORKER-PDF-DPI': '150',
                    'X-WORKER-ASYNC': 'false',
                    'X-WORKER-AUTO-ADJUST-IMAGE-SIZE': 'true',
                    'X-WORKER-OUTPUT-OCR': 'false',
                    'X-WORKER-PROCESSING-MODE': 'per-page',
                    'content-type': 'image/*',
                    'X-WORKER-TOKEN': tokenFormX
                },
                pdfBytes
            );
            const content = format_dns(hal1);
            if (hal1.documents[0]?.data["npm"] !== npm) {
                res.status(500).send("NPM Tidak cocok");
                return;
            }
            const {
                beban_sks_semester_berikutnya,
                aktivasi,
                tahun,
            } = hal1.documents[0]?.data;
            const {
                jml_sks,
                jml_dcp,
                ni_sks,
                ni_ips,
                jml_sks_komulatif,
                jml_dcp_komulatif,
                ni_ipk,
                ni_sks_komulatif
            } = hal1.documents[0]?.data["tabel_2"][0]
            const dates = new Date().getTime();
            const fileName = `dns_${dates}.xlsx`
            let link = `${req.protocol}://${req.hostname}:3005/dns/${npm}/${fileName}`;
            let path = `./public/dns/${npm}`
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }
            // Create the CSV file
            fs.writeFileSync(path + `/${fileName}`, content);
            const result = await csv_to_json(path + `/${fileName}`)
            res.status(200).send({
                link: link,
                resultDNS: {
                    jml_sks,
                    jml_dcp,
                    ni_sks,
                    ni_ips,
                    jml_sks_komulatif,
                    jml_dcp_komulatif,
                    ni_ipk,
                    ni_sks_komulatif,
                    beban_sks_semester_berikutnya,
                    aktivasi,
                    tahun,
                },
                result: result
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error processing the PDF file');
        }
    });
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
                    'X-WORKER-EXTRACTOR-ID': '4cabf3a9-6768-4df3-8d3b-161106501cce',
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
                    'X-WORKER-EXTRACTOR-ID': '4cabf3a9-6768-4df3-8d3b-161106501cce',
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
            const dates = new Date().getTime();
            const fileName = `kemajuan_studi-${dates}.csv`
            let link = `${req.protocol}://${req.hostname}:3005/transkrip/${npm}/${fileName}`;
            let path = `./public/transkrip/${npm}`
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }
            const content = json_to_csv({
                hal1: hal1,
                hal2: hal2
            });
            // Create the CSV file
            fs.writeFileSync(path + `/${fileName}`, content);
            // Convert CSV To JSON
            const result = await csv_to_json(path + `/${fileName}`)
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
        // const json = csv
        if (fs.existsSync(csvFilePath)) {
            const json = csv_.utf8Encoding()
                                .supportQuotedField(true)
                                .fieldDelimiter(',')
                                .getJsonFromCsv(csvFilePath);
            fs.unlinkSync(csvFilePath);
            res.status(200).send(json);
            // csvToJSON()
            //     .fromFile(csvFilePath)
            //     .then(function (jsonArrayObj) { //when parse finished, result will be emitted here.
            //         fs.unlinkSync(csvFilePath);
            //         res.status(200).send(jsonArrayObj);
            //     })
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
    const { id_dosen_wali } = req.params;
    const query = { ...req.query, id_dosen_wali: id_dosen_wali }
    queryValue =
        `
            SELECT 
                mahasiswa.*,
                users_.*,
                mahasiswa.nama AS mahasiswa
            FROM 
                mahasiswa
            LEFT JOIN
                users_
            ON
                users_.id_users=mahasiswa.id_users
            ${filterQuery(query)}
        `;

    sql.query(queryValue, (err, result) => {
        if (err) {
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
                ${tableName}.*,
                dosen.nama AS nama_dosen_wali
            FROM 
                ${tableName}
            LEFT JOIN
                dosen_wali
            ON
                dosen_wali.id_dosen_wali=${tableName}.id_dosen_wali
            LEFT JOIN
                dosen
            ON
                dosen.id_dosen=dosen_wali.id_dosen
            WHERE
                ${tableName}.${primaryKey} = '${id}'
        `;
    sql.query(queryValue, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}

exports.input_khs = (req, res) => {
    let queryValue;
    queryValue = `INSERT INTO khs SET ?`;
    sql.query(queryValue, req.body, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    });
}
exports.input_dns = (req, res) => {
    let queryValue;
    queryValue = `INSERT INTO dns SET ?`;
    sql.query(queryValue, req.body, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    });
}

exports.input_nilai_dns = (req, res) => {
    let queryValue;
    const { id_jurusan } = req.params;
    let tableName = "nilai_dns_ti";
    if (id_jurusan == "421") tableName = "nilai_dns_si"
    queryValue = `INSERT INTO ${tableName} SET ?`;
    sql.query(queryValue, req.body, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    });
}

exports.input_nilai_khs = (req, res) => {
    let queryValue;
    const { id_jurusan } = req.params;
    let tableName = "nilai_khs_ti";
    if (id_jurusan == "421") {
        tableName = "nilai_khs_si";
    }
    queryValue = `INSERT INTO ${tableName} SET ?`;
    sql.query(queryValue, req.body, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    });
}

exports.get_khs = (req, res) => {
    let queryValue;
    const { id_jurusan } = req.query;
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
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}

exports.get_nilai_khs = (req, res) => {
    let queryValue;
    const { id } = req.params;
    const { id_jurusan } = req.query;
    let tableName = "nilai_khs_ti";
    if (id_jurusan == "421") tableName="nilai_khs_si";
    queryValue =
        `
            SELECT 
                ${tableName}.*
            FROM 
                ${tableName}
            WHERE
                id_khs = '${id}'
        `;

    sql.query(queryValue, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}

exports.getNilaiDNS = (req, res) => {
    const { npm } = req.query;
    const { id_jurusan } = req.query;
    let tableName = "nilai_dns_ti";
    if (id_jurusan == "421") tableName="nilai_dns_si";
    let query = `
        SELECT
            ${tableName}.nilai_akhir,
            ${tableName}.id_mata_kuliah
        FROM
            ${tableName}
        LEFT JOIN
            dns
        ON
            dns.id_dns=${tableName}.id_dns
        WHERE
            dns.npm=${npm}
        ORDER BY
            ${tableName}.nilai_akhir ASC
    `;
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}


exports.getUlangMatkul = (req, res) => {
    const { npm } = req.params;
    let query = `
        SELECT
            *
        FROM
            dns
        WHERE
            npm=${npm}
        GROUP BY
            tahun
        ORDER BY "tahun" DESC
    `;
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        };
        let idx = 0;
        const getMatkul = (idx) => {
            if (idx > result.length - 1) {
                res.status(200).send(result);
                return;
            }
            query = `
                SELECT
                    nilai_dns.id_nilai_dns,
                    nilai_dns.id_dns,
                    nilai_dns.nilai_akhir,
                    nilai_dns.st_mk,
                    mata_kuliah.id_mata_kuliah,
                    mata_kuliah.mata_kuliah
                FROM
                    nilai_dns
                JOIN
                    mata_kuliah
                ON
                    mata_kuliah.id_mata_kuliah=nilai_dns.id_mata_kuliah
                WHERE
                    id_dns="${result[idx]["id_dns"]}"
                AND
                    keterangan="T"
            `
            sql.query(query, (err, result2) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                result[idx]["matkul"] = result2;
                idx += 1;
                getMatkul(idx);
            })
        }
        getMatkul(idx);
    });
}
exports.getUlangMatkul2 = (req, res) => {
    const { npm } = req.params;
    const { id_jurusan } = req.query;
    let tableMatkul = "mata_kuliah_ti";
    let tableDNS = "nilai_dns_ti";
    if (id_jurusan == "421") {
        tableMatkul = "mata_kuliah_si";
        tableDNS = "nilai_dns_si";
    };
    let query = `
        SELECT
            ${tableDNS}.id_nilai_dns,
            ${tableDNS}.id_dns,
            ${tableDNS}.nilai_akhir,
            ${tableDNS}.st_mk,
            ${tableMatkul}.id_mata_kuliah,
            ${tableMatkul}.mata_kuliah,
            dns.npm,
            dns.tahun AS periode
        FROM
            ${tableDNS}
        JOIN
            ${tableMatkul}
        ON
            ${tableMatkul}.id_mata_kuliah=${tableDNS}.id_mata_kuliah
        JOIN
            dns
        ON
            dns.id_dns=${tableDNS}.id_dns
        WHERE
            dns.npm=${npm}
        AND
            ${tableDNS}.keterangan = "T"
        ORDER BY
            ${tableDNS}.id_mata_kuliah DESC
    `;
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        };
        // res.status(200).send(result);
        const data = result;
        let arr = [];
        let arrItem = [];
        for (let i = 0; i < data.length; i++) {
            arrItem = []
            const idMatkul = data[i]["id_mata_kuliah"];
            arrItem[0] = data[i];
            for (let j = i + 1; j < data.length; j++) {
                const idMatkul2 = data[j]["id_mata_kuliah"];
                if (idMatkul === idMatkul2) {
                    arrItem.push({
                        ...data[j]
                    })
                    i += 1;
                } else {
                    break;
                }
            }
            arr.push(arrItem);
        }
        res.status(200).send(arr);
    });
}

exports.delete = (req, res) => {
    const { npm } = req.params;
    let query = `
        DELETE 
            FROM 
        mahasiswa 
            WHERE
        mahasiswa.npm = '${npm}'
    `;
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}
