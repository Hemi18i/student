import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertTransferRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Import students from CSV (must be before :id route)
  app.post("/api/students/import", async (req, res) => {
    try {
      const { students: studentsData, groupName } = req.body;
      
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        return res.status(400).json({ message: "Invalid data: expected array of students" });
      }

      let groupId: number | undefined;
      if (groupName) {
        const group = await storage.createGroup({ 
          name: groupName, 
          createdAt: new Date().toISOString() 
        });
        groupId = group.id;
      }

      // Map headers to schema field names - comprehensive mapping
      const mappedStudents = studentsData.map((row, rowIdx) => {
        const mapped: any = { groupId };
        
        // Helper function to check if value is meaningful
        const hasValue = (val: any) => val !== undefined && val !== null && String(val).trim() !== '';
        
        // Helper to normalize and trim strings - removes all special characters and extra spaces
        const normalizeKey = (key: string): string => {
          return String(key)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '') // Remove ALL spaces
            .replace(/\u064E/g, '') // Remove Arabic diacritics
            .replace(/[\u0610-\u061A]/g, '') // Remove more Arabic marks
            .replace(/\u064B/g, ''); // Remove more diacritics
        };
        
        // Special case for Excel Date Objects and serial numbers
        const formatValue = (val: any) => {
          if (!hasValue(val)) return "";
          const str = String(val).trim();
          if (!str) return "";
          return str;
        };
        
        for (const [key, value] of Object.entries(row)) {
          if (!hasValue(value)) continue;
          
          const normKey = normalizeKey(String(key));
          const formattedValue = formatValue(value);
          
          if (!formattedValue) continue;

          // Name mapping - all variants (now works even with weird spacing in source)
          if (normKey.includes('الاس') || normKey === 'اسم' || normKey === 'name' ||
              normKey.includes('name')) {
            mapped.name = formattedValue;
          }
          // National ID mapping  
          else if (normKey.includes('قومي') || normKey.includes('national')) {
            mapped.nationalId = formattedValue;
          }
          // Class code mapping
          else if (normKey.includes('كود') && normKey.includes('فصل')) {
            mapped.classCode = formattedValue;
          }
          // Class/Section mapping
          else if (normKey.includes('فصل') && !normKey.includes('كود')) {
            mapped.classRoom = formattedValue;
          }
          // Student code
          else if (normKey.includes('كود') && normKey.includes('طالب')) {
            mapped.studentCode = formattedValue;
          }
          // Birth date
          else if (normKey.includes('تاريخ') && normKey.includes('ميلاد')) {
            mapped.birthDate = formattedValue;
          }
          // Guardian name
          else if (normKey.includes('ولي') && normKey.includes('امر')) {
            mapped.guardianName = formattedValue;
          }
          // Address mapping
          else if (normKey.includes('عنوان') && !normKey.includes('محافظة')) {
            mapped.studentAddress = formattedValue;
          }
          // Birth place
          else if (normKey.includes('محافظة') && normKey.includes('ميلاد')) {
            mapped.birthGovernorate = formattedValue;
          }
          // Stage/Level
          else if (normKey.includes('مرحل')) {
            mapped.stage = formattedValue;
          }
          // Enrollment status
          else if (normKey.includes('قيد') || normKey.includes('حالة')) {
            mapped.enrollmentStatus = formattedValue;
          }
          // Orphan status
          else if (normKey.includes('ايتام')) {
            mapped.orphanStatus = formattedValue;
          }
          // Tablet serial
          else if ((normKey.includes('رقم') && normKey.includes('مسلسل') && normKey.includes('تابلت')) ||
                   normKey.includes('tablet')) {
            mapped.tabletSerial = formattedValue;
          }
          // IMEI
          else if (normKey === 'imei') {
            mapped.imei = formattedValue;
          }
          // Insurance number
          else if (normKey.includes('بوليصة') || normKey.includes('تامين')) {
            mapped.insuranceNumber = formattedValue;
          }
          // Gender mapping
          else if (normKey.includes('نوع')) {
            mapped.gender = formattedValue;
          }
          // Religion mapping
          else if (normKey.includes('ديان')) {
            mapped.religion = formattedValue;
          }
          // Nationality mapping
          else if (normKey.includes('جنسي')) {
            mapped.nationality = formattedValue;
          }
          // Last certificate
          else if (normKey.includes('اخر') && normKey.includes('شهاد')) {
            mapped.lastCertificate = formattedValue;
          }
          // Last school
          else if (normKey.includes('اخر') && normKey.includes('مدرس')) {
            mapped.lastSchool = formattedValue;
          }
          // Total score
          else if (normKey.includes('مجموع') || normKey.includes('total')) {
            mapped.totalScore = formattedValue;
          }
        }
        
        // Ensure name is set
        if (!mapped.name) {
          // Try to find any field with "اسم"
          for (const [key, value] of Object.entries(row)) {
            if (hasValue(value) && String(key).includes('اسم')) {
              mapped.name = formatValue(value);
              break;
            }
          }
        }

        // Clean up any numeric-only fields that shouldn't be there
        // Guardian name should be a name, not a number
        if (mapped.guardianName && /^\d+$/.test(String(mapped.guardianName).trim())) {
          // If guardianName is all digits, it's probably insurance number
          if (!mapped.insuranceNumber) {
            mapped.insuranceNumber = mapped.guardianName;
          }
          mapped.guardianName = undefined;
        }

        // Same for other text fields
        if (mapped.stage && /^\d+$/.test(String(mapped.stage).trim())) {
          mapped.stage = undefined;
        }

        return mapped;
      });

      const students = await storage.bulkCreateStudents(mappedStudents);
      res.status(201).json({ 
        message: `Successfully imported ${students.length} students`,
        count: students.length 
      });
    } catch (error) {
      console.error("Error importing students:", error);
      res.status(500).json({ message: "Error importing students", error: String(error) });
    }
  });

  // Groups routes
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Error fetching groups" });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "Invalid group ID" });
      }
      const success = await storage.deleteGroup(groupId);
      if (!success) {
        return res.status(404).json({ message: "Group not found or could not be deleted" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ message: "Error deleting group", error: String(error) });
    }
  });

  // Get all students
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Error fetching students" });
    }
  });

  // Search students
  app.get("/api/students/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const type = req.query.type as "nationalId" | "name";
      
      if (!query) {
        const students = await storage.getAllStudents();
        return res.json(students);
      }
      
      const students = await storage.searchStudents(query, type || "nationalId");
      res.json(students);
    } catch (error) {
      console.error("Error searching students:", error);
      res.status(500).json({ message: "Error searching students" });
    }
  });

  // Get student by ID
  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudentById(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Error fetching student" });
    }
  });

  // Create student
  app.post("/api/students", async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Error creating student" });
    }
  });

  // Update student
  app.patch("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, data);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Error updating student" });
    }
  });

  // Delete student
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }
      const success = await storage.deleteStudent(id);
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Error deleting student" });
    }
  });

  // Create transfer request
  app.post("/api/transfer-requests", async (req, res) => {
    try {
      const data = insertTransferRequestSchema.parse(req.body);
      const request = await storage.createTransferRequest(data);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating transfer request:", error);
      res.status(500).json({ message: "Error creating transfer request" });
    }
  });

  // Get transfer requests for a student
  app.get("/api/students/:id/transfer-requests", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const requests = await storage.getTransferRequestsByStudentId(studentId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching transfer requests:", error);
      res.status(500).json({ message: "Error fetching transfer requests" });
    }
  });

  return httpServer;
}
