import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Student table for storing all student data from CSV
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id"),
  classCode: text("class_code"),
  serialNumber: integer("serial_number"),
  name: text("name").notNull(),
  classRoom: text("class_room"),
  studentCode: text("student_code"),
  nationalId: text("national_id").notNull().unique(),
  birthDate: text("birth_date"),
  birthDay: integer("birth_day"),
  birthMonth: integer("birth_month"),
  birthYear: integer("birth_year"),
  birthGovernorate: text("birth_governorate"),
  gender: text("gender"),
  religion: text("religion"),
  nationality: text("nationality"),
  lastCertificate: text("last_certificate"),
  lastSchool: text("last_school"),
  totalScore: text("total_score"),
  guardianName: text("guardian_name"),
  studentAddress: text("student_address"),
  stage: text("stage"),
  orphanStatus: text("orphan_status"),
  enrollmentStatus: text("enrollment_status"),
  tabletSerial: text("tablet_serial"),
  imei: text("imei"),
  insuranceNumber: text("insurance_number"),
  enrollmentDate: text("enrollment_date"),
  notes: text("notes"),
});

// Import groups table
export const studentGroups = pgTable("student_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertStudentGroupSchema = createInsertSchema(studentGroups).omit({
  id: true,
});

export type InsertStudentGroup = z.infer<typeof insertStudentGroupSchema>;
export type StudentGroup = typeof studentGroups.$inferSelect;

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Transfer request table for tracking transfer requests
export const transferRequests = pgTable("transfer_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  fromSchool: text("from_school").notNull(),
  toSchool: text("to_school").notNull(),
  transferReason: text("transfer_reason"),
  requestDate: text("request_date").notNull(),
  status: text("status").default("pending"),
});

export const insertTransferRequestSchema = createInsertSchema(transferRequests).omit({
  id: true,
});

export type InsertTransferRequest = z.infer<typeof insertTransferRequestSchema>;
export type TransferRequest = typeof transferRequests.$inferSelect;
