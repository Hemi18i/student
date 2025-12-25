import * as XLSX from "xlsx";
import fs from "fs";

const files = fs.readdirSync("./attached_assets/");
const file = files.find(f => f.includes("الصف_الأول"));
console.log("Found file:", file);

if (file) {
  const workbook = XLSX.readFile(`./attached_assets/${file}`);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  
  console.log("\n=== COLUMN HEADERS (في الترتيب) ===");
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    headers.forEach((h, i) => {
      console.log(`العمود ${i}: "${h}"`);
    });
  }
  
  console.log("\n=== FIRST 2 ROWS ===");
  console.log(JSON.stringify(data.slice(0, 2), null, 2));
}
