const Joi = require('joi');
const { messageText } = require('../scripts/messageText');
const sql = require("./db");
const accessToken = require('../scripts/accesstoken');

const schema = Joi.object({
    id_prodi: Joi.string(),
    id_jurusan: Joi.string(),
    username: Joi.string().required().error(errors => {
        messageText(errors, "Username");
        return errors;
    }),
    password: Joi.string().required().error(errors => {
        messageText(errors, "Password");
        return errors;
    }),
    role: Joi.string().required().error(errors => {
        messageText(errors, "Role");
        return errors;
    }),
})

exports.signIn = async (req, res) => {
    const roles = {
        "admin": {
            "username": "username",
            "tableName": "admin"
        },
        "prodi": {
            "username": "username",
            "tableName": "prodi"
        },
        "dosen": {
            "username": "nidn",
            "tableName": "dosen"
        },
        "mahasiswa": {
            "username": "npm",
            "tableName": "mahasiswa"
        }
    }
    try {
        const value = await schema.validateAsync({ ...req.body });
        const { role, username, password } = req.body;
        let queryValue;
        queryValue = `
            SELECT
                *
            FROM
                ${roles[role]["tableName"]}
            WHERE
                ${roles[role]["username"]} = "${username}"
            AND
                password = "${password}"
        `
        sql.query(queryValue, req.body, (err, result) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send(err);
                return;
            }
            if(result.length === 0) {
                res.status(401).send({
                    details: [
                        {
                            message: "Username atau password salah"
                        }
                    ]
                });
                return;
            }
            accessToken({ ...result[0], role: role }).then((token) => {
                res.status(200).send(token);
            })
        });
    } catch (err) {
        res.status(500).send(err);
    }
}