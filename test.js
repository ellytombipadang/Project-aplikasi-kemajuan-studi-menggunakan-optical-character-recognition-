const rawData = `{
  "npm,\"id_users\",\"nama\",\"id_dosen_wali\",\"asal_sma\",\"id_jurusan\",\"foto\",\"no_hp\",\"tanggal_lahir\",\"jenis_kelamin\",\"alamat": 
  "18411060,\"fhf5yaxryvs\",\"ELLY TOMBI PADANG\",\"4\",\"SMA 4 LUWU\",\"411\",\"\",\"081247577873\",\"2000-11-06\",\"Laki-laki\",\"Tasangkapura"
}`;

const fixJson = (data) => {
  // Extract the key-value pair
  const match = data.match(/\{(.*?):\s*"(.*?)"\}/s);
  if (!match) return null;

  // Get keys and values as strings
  const keysString = match[1].replace(/"/g, '');  // Remove quotes
  const valuesString = match[2];

  // Split into arrays
  const keys = keysString.split(",");
  const values = valuesString.split(",").map(v => v.replace(/"/g, '').trim());

  // Construct a valid object
  const obj = {};
  keys.forEach((key, index) => {
      obj[key.trim()] = values[index] || "";
  });

  return obj;
};

const user = fixJson(rawData);

console.log(user); // Output: "411"
