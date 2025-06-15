const Joi = require('joi');
const { messageText } = require('../scripts/messageText');
const sql = require("./db");
const { filterQuery } = require('../scripts/filterQuery');
const tableName = "prodi";
const primaryKey = "id_prodi";

const schema = Joi.object({
    jurusan: Joi.required().error(errors => {
        messageText(errors, "Jurusan");
        return errors;
    }),
    id_jurusan: Joi.number().required().error(errors => {
        messageText(errors, "Id Jurusan");
        return errors;
    }),
    username: Joi.required().error(errors => {
        messageText(errors, "Username");
        return errors;
    }),
    password: Joi.required().error(errors => {
        messageText(errors, "Password");
        return errors;
    }),
})

exports.inputJurusan = async (req, res) => {
    let sqlQuery;
    try {
        const value = await schema.validateAsync({ ...req.body });
        sqlQuery = `
            SELECT
                jurusan.id_jurusan
            FROM
                jurusan
            WHERE
                jurusan.id_jurusan=${req.body.id_jurusan}
        `
        sql.query(sqlQuery, (err, result) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send(err);
                return;
            };
            if (result.length === 0) {
                sqlQuery = `
                    INSERT INTO jurusan (id_jurusan, jurusan) VALUES ('${req.body.id_jurusan}', '${req.body.jurusan}')
                `
                sql.query(sqlQuery, (err, result) => {
                    if (err) {
                        console.log("error: ", err);
                        res.status(500).send(err);
                        return;
                    }
                    res.status(200).send(req.body);
                });
            } else {
                res.status(200).send(req.body);
            }
        });
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.inputProdi = async (req, res) => {
    let sqlQuery;
    sqlQuery = `
       INSERT INTO prodi SET ?
    `
    sql.query(sqlQuery, req.body, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        };
        res.status(200).send(result);
    });
}

exports.getData = (req, res) => {
    let queryValue;
    const query = req.query;
    queryValue =
        `
            SELECT
                users_.*,
                ${tableName}.*,
                jurusan.jurusan
            FROM 
                ${tableName}
            LEFT JOIN
                users_
            ON
                users_.id_users=${tableName}.id_users
            LEFT JOIN
                jurusan
            ON
                jurusan.id_jurusan=${tableName}.id_jurusan
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

