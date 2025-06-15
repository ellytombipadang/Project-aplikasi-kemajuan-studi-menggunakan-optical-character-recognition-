const Joi = require('joi');
const { messageText } = require('../scripts/messageText');
const sql = require("./db");
const { filterQuery } = require('../scripts/filterQuery');
const accessToken = require('../scripts/accesstoken');
const tableName = "dosen_wali";
const primaryKey = "id_prodi";

const schema = Joi.object({
    id_dosen: Joi.number().required().error(errors => {
        messageText(errors, "Dosen");
        return errors;
    }),
    id_users: Joi.string(),
})

exports.inputDosenWali = async (req, res) => {
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
    const { id_jurusan } = req.params;
    queryValue =
        `
            SELECT 
                dosen.nama AS dosen,
                dosen.no_hp,
                dosen.nidn,
                users_.username,
                users_.password,
                users_.id_users,
                ${tableName}.id_dosen_wali,
                ${tableName}.id_dosen
            FROM 
                ${tableName}
            LEFT JOIN
                dosen
            ON
                ${tableName}.id_dosen=dosen.id_dosen
            LEFT JOIN
                users_
            ON
                users_.id_users=${tableName}.id_users
            LEFT JOIN
                jurusan
            ON
                dosen.id_jurusan=jurusan.id_jurusan
            WHERE
                jurusan.id_jurusan="${id_jurusan}"
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

