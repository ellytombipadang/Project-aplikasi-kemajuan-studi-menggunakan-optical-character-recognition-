const messageText = (errors, field) => {
    // let result;
    errors.forEach(err => {
        switch (err.code) {
            case "any.required":
                err.message = `${field} Harus diisi`;
                // result = `${field} Harus diisi`;
                break;
            case "number.base":
                err.message = `${field} Harus angka`;
                // result = `${field} Harus diisi`;
                break;
            default:
                break;
        }
    });
    return
    // return errors;
}

module.exports = {
    messageText
}