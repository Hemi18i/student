import { 
  type Student, 
  type InsertStudent,
  type TransferRequest,
  type InsertTransferRequest,
  type User,
  type InsertUser,
  type StudentGroup,
  type InsertStudentGroup,
  students,
  studentGroups,
  transferRequests,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getAllStudents(): Promise<Student[]>;
  getStudentById(id: number): Promise<Student | undefined>;
  getStudentByNationalId(nationalId: string): Promise<Student | undefined>;
  searchStudents(query: string, type: "nationalId" | "name"): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, data: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  bulkCreateStudents(students: InsertStudent[]): Promise<Student[]>;
  
  // Group methods
  getGroups(): Promise<StudentGroup[]>;
  createGroup(group: InsertStudentGroup): Promise<StudentGroup>;
  deleteGroup(id: number): Promise<boolean>;

  // Transfer request methods
  createTransferRequest(request: InsertTransferRequest): Promise<TransferRequest>;
  getTransferRequestsByStudentId(studentId: number): Promise<TransferRequest[]>;
}

export class DatabaseStorage implements IStorage {
  // Group methods
  async getGroups(): Promise<StudentGroup[]> {
    return await db.select().from(studentGroups);
  }

  async createGroup(group: InsertStudentGroup): Promise<StudentGroup> {
    const [newGroup] = await db.insert(studentGroups).values(group).returning();
    return newGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    try {
      // First, get all student IDs in this group
      const studentList = await db.select({ id: students.id }).from(students).where(eq(students.groupId, id));
      const studentIds = studentList.map(s => s.id);
      
      if (studentIds.length > 0) {
        // Delete transfer requests associated with these students
        for (const studentId of studentIds) {
          await db.delete(transferRequests).where(eq(transferRequests.studentId, studentId));
        }
        // Delete students in this group
        await db.delete(students).where(eq(students.groupId, id));
      }
      
      // Finally delete the group
      const result = await db.delete(studentGroups).where(eq(studentGroups.id, id));
      return true;
    } catch (e) {
      console.error("Error deleting group:", e);
      return false;
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Student methods
  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(students.name);
  }

  async getStudentById(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByNationalId(nationalId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.nationalId, nationalId));
    return student;
  }

  async searchStudents(query: string, type: "nationalId" | "name"): Promise<Student[]> {
    const filter = type === "nationalId" 
      ? ilike(students.nationalId, `%${query}%`)
      : ilike(students.name, `%${query}%`);
    
    return await db.select().from(students).where(filter).orderBy(students.name);
  }

  async bulkCreateStudents(studentsList: any[]): Promise<Student[]> {
    const created: Student[] = [];
    for (const studentData of studentsList) {
      if (!studentData.name && !studentData.nationalId) continue;
      
      const cleaned: any = {};
      for (const [key, value] of Object.entries(studentData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleaned[key] = value;
        }
      }
      
      if (!cleaned.name) cleaned.name = 'Unknown';
      if (!cleaned.nationalId) cleaned.nationalId = `temp-${Date.now()}-${Math.random()}`;

      try {
        const [newStudent] = await db.insert(students).values(cleaned).returning();
        created.push(newStudent);
      } catch (e) {
        console.error("Error inserting student in bulk:", e);
      }
    }
    return created;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, data: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db.update(students).set(data).where(eq(students.id, id)).returning();
    return updated;
  }

  async deleteStudent(id: number): Promise<boolean> {
    await db.delete(students).where(eq(students.id, id));
    return true;
  }

  // Transfer request methods
  async createTransferRequest(request: InsertTransferRequest): Promise<TransferRequest> {
    const [newRequest] = await db.insert(transferRequests).values(request).returning();
    return newRequest;
  }

  async getTransferRequestsByStudentId(studentId: number): Promise<TransferRequest[]> {
    return await db.select().from(transferRequests).where(eq(transferRequests.studentId, studentId));
  }
}

export const storage = new DatabaseStorage();
