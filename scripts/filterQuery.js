const filterQuery = (obj) => {
    let where = '';
    const value = (str) => {
        let result = str;
        return "%" + result + "%";
    }
    const column = (str) => {
        let result = str;
        let arr = ["dosen", "mahasiswa"];
        if (arr.includes(str)) {
            result = "CONCAT(nama_depan,' ',nama_belakang)"
        };
        return result;
    }
    if (Object.keys(obj).length > 0) {
        where = `
            WHERE
                ${Object.keys(obj).map(prop => {
            return (
                `${column(prop)} LIKE "${value(obj[prop])}"`
            )
        }).join(" AND ")}
        `
    };
    return where;
}

module.exports = { filterQuery };