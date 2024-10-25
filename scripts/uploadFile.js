const fs = require("fs");
const storage = {
    destination: function (dir) {

        if (!fs.existsSync(`./public/${dir}`)) {
            fs.mkdirSync(`./public/${dir}`, { recursive: true })
        }
        return `./public/${dir}`;
    },
    filename: function (fieldname, date, format) {
        return fieldname + `${date ? date : ""}` + `.${format}`;
    }
}
const uploadFile = (file, dir, format) => {
    let url = {}
    Object.keys(file).forEach((prop, idx) => {
        const fileName = storage.filename(prop, dir?.date, format);
        const destination = storage.destination(dir.fileDestination);
        file[prop].mv(destination + "/" + fileName);
        url = {
            ...url,
            [`url${idx + 1}`]: dir.protocol + "://" + dir.host + "/" + dir.fileDestination + '/' + fileName
        };
    });
    return url;
};

module.exports = { uploadFile };