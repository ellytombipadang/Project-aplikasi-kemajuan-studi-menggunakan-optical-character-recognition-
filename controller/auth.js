const Joi = require('joi');
const { messageText } = require('../scripts/messageText');
const sql = require("./db");
const accessToken = require('../scripts/accesstoken');

const schema = Joi.object({
    id_prodi: Joi.string(),
    id_jurusan: Joi.string(),
    id_users: Joi.string(),
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

exports.inputUser = async (req, res) => {
    try {
        const value = await schema.validateAsync({ ...req.body });
        let queryValue;
        queryValue = `INSERT INTO users_ SET ?`;
        sql.query(queryValue, req.body, (err, result) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send(err);
                return;
            }
            res.status(200).send(result);
        });
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.signIn = async (req, res) => {
    try {
        const value = await schema.validateAsync({ ...req.body });
        const { role, username, password } = req.body;
        let queryValue;
        queryValue = `
            SELECT
                *
            FROM
                users_
            WHERE
                username = "${username}"
            AND
                password = "${password}"
            AND
                role = "${role}"
        `
        sql.query(queryValue, req.body, (err, result) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send(err);
                return;
            }
            if (result.length === 0) {
                res.status(401).send({
                    details: [
                        {
                            message: "Username atau password salah"
                        }
                    ]
                });
                return;
            }
            res.status(200).send(result);
        });
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getUserData = async (req, res) => {
    const { role, id_user } = req.query;
    const roles = {
        "admin": {
            "username": "username",
            "tableName": "admin"
        },
        "prodi": {
            "username": "username",
            "tableName": "prodi"
        },
        "dosen wali": {
            "username": "username",
            "tableName": "dosen_wali"
        },
        "mahasiswa": {
            "username": "npm",
            "tableName": "mahasiswa"
        }
    }
    let queryValue;
    queryValue = `
        SELECT
            *
        FROM
            ${roles[role]?.tableName}
            ${role == "dosen wali" ?
                `
                    LEFT JOIN
                        dosen
                    ON
                        dosen_wali.id_dosen=dosen.id_dosen
                ` : ""
            }
        WHERE
            id_users="${id_user}"
    `
    sql.query(queryValue, req.body, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        }
        let title = ""
        if (role === "prodi") {
            title = "Teknik informatika";
            if (result[0]?.id_jurusan == "421") {
                title = "Sistem informasi"
            };
        } else if (role === "mahasiswa") {
            title = `${result[0]?.nama.split(" ")[0]}`;
        } else if (role === "dosen wali"){
            title = `${result[0]?.jenis_kelamin == "Laki-laki" ? "Pak" : "Ibu"} ${result[0]?.nama.split(" ")[0]}`;
        }
        // if (role !== "admin") {
        //     if (role === "prodi") {
        //         queryValue = `
        //             SELECT
        //                 id_jurusan
        //             WHERE
        //                 id_users = "${result[0]}"
        //         `
        //     }
        // }
        accessToken({ ...result[0], role: role, title: title }).then((token) => {
            console.log(result)
            res.status(200).send(token);
        })
    });
}

exports.delete = async (req, res) => {
    try {
        let queryValue;
        const {id_user} = req.params;
        queryValue = `
            DELETE
                FROM
            users_
                WHERE
            users_.id_users="${id_user}"
        `
        sql.query(queryValue, (err, result) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send(err);
                return;
            }
            res.status(200).send(result);
        });
    } catch (err) {
        res.status(500).send(err);
    }
}