const data = [
    {
        "id_nilai_dns": 129,
        "id_dns": "pctaynv82zs",
        "nilai_akhir": "E",
        "st_mk": "1",
        "id_mata_kuliah": "4122101",
        "mata_kuliah": "MULTIMEDIA",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 126,
        "id_dns": "pctaynv82zs",
        "nilai_akhir": "D",
        "st_mk": "1",
        "id_mata_kuliah": "4121911",
        "mata_kuliah": "PEMROGRAMAN WEB II",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 139,
        "id_dns": "h8g1srhhyh",
        "nilai_akhir": "D",
        "st_mk": "2",
        "id_mata_kuliah": "4121812",
        "mata_kuliah": "PRAKTEK PEMROGRAMAN WEB I",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 138,
        "id_dns": "h8g1srhhyh",
        "nilai_akhir": "E",
        "st_mk": "2",
        "id_mata_kuliah": "4121811",
        "mata_kuliah": "PEMROGRAMAN WEB I",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 137,
        "id_dns": "h8g1srhhyh",
        "nilai_akhir": "D",
        "st_mk": "2",
        "id_mata_kuliah": "4121401",
        "mata_kuliah": "TEKNIK RISET OPERASIONAL",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 141,
        "id_dns": "xhm8l39wvz",
        "nilai_akhir": "E",
        "st_mk": "2",
        "id_mata_kuliah": "34072",
        "mata_kuliah": "KERJA PRAKTEK",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 125,
        "id_dns": "pctaynv82zs",
        "nilai_akhir": "E",
        "st_mk": "1",
        "id_mata_kuliah": "34072",
        "mata_kuliah": "KERJA PRAKTEK",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 147,
        "id_dns": "s623f39u17g",
        "nilai_akhir": "E",
        "st_mk": "2",
        "id_mata_kuliah": "310631",
        "mata_kuliah": "PRAKTEK INTERAKSI MANUSIA DAN KOMPUTER",
        "npm": "18411060"
    },
    {
        "id_nilai_dns": 135,
        "id_dns": "h8g1srhhyh",
        "nilai_akhir": "D",
        "st_mk": "1",
        "id_mata_kuliah": "20743",
        "mata_kuliah": "STRUKTUR DATA",
        "npm": "18411060"
    }
]
let arr = [];
for (let i = 0; i < data.length; i++) {
    let arrItem = []
    arrItem[0] = {
        ...data[i]
    }
    const idMatkul = data[i]["id_mata_kuliah"];
    for (let j = i + 1; j < data.length; j++) {
        const idMatkul2 = data[j]["id_mata_kuliah"];
        if (idMatkul === idMatkul2) {
            arrItem.push({
                ...data[j]
            })
        }else {
            arr.push(arrItem);
            break
        }
    }
}
console.log(arr);