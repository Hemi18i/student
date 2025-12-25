import XLSX from "xlsx";
import fs from "fs";

const files = fs.readdirSync("./attached_assets/").filter(f => f.endsWith(".xlsx"));
const file = files[files.length - 1];
console.log("Analyzing file:", file);

const workbook = XLSX.read(fs.readFileSync(`./attached_assets/${file}`));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

if (data[0]) {
  console.log("\n=== ACTUAL HEADERS IN ORDER ===");
  Object.keys(data[0]).forEach((k, i) => console.log(`${i}: "${k}"`));
  
  console.log("\n=== FIRST ROW VALUES ===");
  Object.entries(data[0]).forEach(([k, v]) => {
    console.log(`"${k}" => "${v}"`);
  });
}
