const Joi = require('joi');
const { messageText } = require('../scripts/messageText');
const sql = require("./db");
const { filterQuery } = require('../scripts/filterQuery');
const tableName = "jurusan";
const primaryKey = "id_jurusan";
const schema = Joi.object({
    id_jurusan: Joi.number().required().error(errors => {
        messageText(errors, "Id Jurusan");
        return errors;
    }),
    jurusan: Joi.required().error(errors => {
        messageText(errors, "Jurusan");
        return errors;
    }),
});

exports.checkInput = async (req, res) => {
    try {
        const value = await schema.validateAsync({ ...req.body });
        res.status(200).send(value);
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
                ${tableName}.*,
                IF(
                    EXISTS(
                        SELECT
                            prodi.id_jurusan
                        FROM
                            prodi
                        WHERE jurusan.id_jurusan=prodi.id_jurusan
                    ),
                    "1",
                    "0"
                ) AS isExist
            FROM 
                ${tableName}
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