const Joi = require('joi');
const { messageText } = require('../scripts/messageText');
const sql = require("./db");
const { uploadFile } = require('../scripts/uploadFile');
const { filterQuery } = require('../scripts/filterQuery');
const tableName = "dosen";
const primaryKey = "nidn";

const schema = Joi.object({
    nama: Joi.string().required().error(errors => {
        messageText(errors, "Nama");
        return errors;
    }),
    tanggal_lahir: Joi.date().required().error(errors => {
        messageText(errors, "Tanggal lahir");
        return errors;
    }),
    nidn: Joi.number().required().messages().error(errors => {
        messageText(errors, "nidn");
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
});

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
        // foto_ktp  
    }, url);
    let sqlQuery;
    sqlQuery = `
        UPDATE 
            dosen 
        SET
            foto = '${url1}' 
        WHERE
            dosen.nidn = '${id}'`
    sql.query(sqlQuery, (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(result);
    })
}

exports.getData = (req, res) => {
    let queryValue;
    const { id_jurusan } = req.params;
    let query = { ...req.query };
    if (id_jurusan !== "x") {
        query = { ...req.query, ["jurusan.id_jurusan"]: id_jurusan }
    }
    queryValue =
        `
            SELECT 
                ${tableName}.*,
                ${tableName}.nama AS dosen,
                jurusan.jurusan
            FROM 
                ${tableName}
            LEFT JOIN
                jurusan
            ON
                dosen.id_jurusan=jurusan.id_jurusan
            ${filterQuery(query)}
            GROUP BY
                ${tableName}.nidn
            ORDER BY
                ${tableName}.nama ASC
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

exports.selectedDosen = (req, res) => {
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

exports.delete = (req, res) => {
    const { nidn } = req.params;
    let query = `
        DELETE 
            FROM 
        dosen 
            WHERE
        dosen.nidn = '${nidn}'
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
