let csv_ = require('convert-csv-to-json');
const { uploadFile } = require('../scripts/uploadFile');
const fs = require('fs');

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
            let json = csv_.utf8Encoding().fieldDelimiter(',').getJsonFromCsv(csvFilePath);
            if (Object.keys(json[0]).filter(x => {
                return x.includes(";")
            }).length > 0) {
                json = csv_.utf8Encoding().fieldDelimiter(';').getJsonFromCsv(csvFilePath);
            }
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