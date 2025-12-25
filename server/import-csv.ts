import { db } from "./db";
import { students, type InsertStudent } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

async function importCSV() {
  const csvPath = path.join(process.cwd(), "attached_assets", "الصف_الأول_-_الصف_الأول.csv_(1)_1764952718193.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found at:", csvPath);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n");
  
  // Skip header row
  const header = lines[0].split(",");
  console.log("CSV Headers:", header);
  
  const studentsToInsert: InsertStudent[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handling commas in quoted fields)
    const values = parseCSVLine(line);
    
    if (values.length < 20) continue;
    
    try {
      const student: InsertStudent = {
        classCode: values[0] || null,
        serialNumber: parseInt(values[1]) || null,
        name: values[3] || "",
        classRoom: values[4] || null,
        studentCode: values[5] || null,
        nationalId: values[6] || "",
        birthDate: values[7] || null,
        birthDay: parseInt(values[8]) || null,
        birthMonth: parseInt(values[9]) || null,
        birthYear: parseInt(values[10]) || null,
        birthGovernorate: values[11] || null,
        gender: values[12] || null,
        religion: values[13] || null,
        nationality: values[14] || null,
        lastCertificate: values[15] || null,
        lastSchool: values[16] || null,
        totalScore: values[17] || null,
        guardianName: values[18] || null,
        studentAddress: values[19] || null,
        stage: values[20] || null,
        orphanStatus: values[21] || null,
        enrollmentStatus: values[22] || null,
        tabletSerial: values[23] || null,
        imei: values[24] || null,
        insuranceNumber: values[25] || null,
        enrollmentDate: values[26] || null,
        notes: values[27] || null,
      };
      
      if (student.name && student.nationalId) {
        studentsToInsert.push(student);
      }
    } catch (err) {
      console.error(`Error parsing line ${i}:`, err);
    }
  }
  
  console.log(`Parsed ${studentsToInsert.length} students from CSV`);
  
  if (studentsToInsert.length > 0) {
    try {
      // Insert in batches of 50 to avoid issues
      const batchSize = 50;
      let insertedCount = 0;
      
      for (let i = 0; i < studentsToInsert.length; i += batchSize) {
        const batch = studentsToInsert.slice(i, i + batchSize);
        await db.insert(students).values(batch).onConflictDoNothing();
        insertedCount += batch.length;
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${insertedCount}/${studentsToInsert.length})`);
      }
      
      console.log(`Successfully imported ${studentsToInsert.length} students`);
    } catch (error) {
      console.error("Error inserting students:", error);
    }
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

importCSV()
  .then(() => {
    console.log("Import completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
