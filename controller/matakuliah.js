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
const primaryKey = "npm";

const tableName = (kode) => {
    if (kode == "421") return "mata_kuliah_si";
    return "mata_kuliah_ti";
}

const schema = Joi.object({
    id_mata_kuliah: Joi.string().required().error(errors => {
        messageText(errors, "ID Matakuliah");
        return errors;
    }),
    mata_kuliah: Joi.string().required().error(errors => {
        messageText(errors, "Mata kuliah");
        return errors;
    }),
    semester: Joi.number().required().messages().error(errors => {
        messageText(errors, "Semester");
        return errors;
    }),
    sks: Joi.date().required().error(errors => {
        messageText(errors, "SKS");
        return errors;
    }),
    // id_jurusan: Joi.string(),
    id_kurikulum: Joi.string(),
});

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
                    // console.log(jsonArrayObj);
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
        const { id_jurusan } = req.params;
        const value = await schema.validateAsync({ ...req.body });
        let queryValue;
        queryValue = `INSERT INTO ${tableName(id_jurusan)} SET ?`;
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

exports.get_data = async (req, res) => {
    let queryValue;
    const { id_jurusan } = req.params;
    const query = { ...req.query }
    queryValue =
        `
            SELECT 
                ${tableName(id_jurusan)}.*
            FROM 
                ${tableName(id_jurusan)}
            ${filterQuery(query)}
                ORDER BY
            ${tableName(id_jurusan)}.mata_kuliah 
                ASC
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

exports.delete = (req, res) => {
    const { id_mata_kuliah, id_jurusan } = req.params;
    let query = `
        DELETE 
            FROM 
        ${tableName(id_jurusan)}
            WHERE
        ${tableName(id_jurusan)}.id_mata_kuliah  = '${id_mata_kuliah}'
    `;
    sql.query(query, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}