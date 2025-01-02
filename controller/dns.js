const sql = require("./db");
const tableName = "dns";

exports.getDNSmahasiswa = (req, res) => {
    let queryValue;
    const { npm } = req.params;
    queryValue =
        `
            SELECT 
                dns.*
            FROM 
                ${tableName}
            WHERE
                npm = ${npm}
        `;

    sql.query(queryValue, (err, result) => {
        if (err) {
            console.log("error: ", err);
            res.status(500).send(err);
            return;
        };
        const sortResult = result.sort((a, b) => b.ni_ipk - a.ni_ipk)
        res.status(200).send(sortResult);
    });
}