import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, X } from "lucide-react";
import type { Student } from "@shared/schema";

interface EnrollmentStatementFormProps {
  student: Student;
  onClose: () => void;
}

export function EnrollmentStatementForm({ student, onClose }: EnrollmentStatementFormProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [academicYear, setAcademicYear] = useState("2018-2019");

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>بيان قيد طالب - ${student.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            padding: 20px;
            font-size: 14px;
            line-height: 1.8;
          }
          .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 15px;
          }
          .student-code-box {
            border: 2px solid #000;
            padding: 8px 20px;
            display: inline-flex;
            gap: 20px;
            align-items: center;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 25px 0;
            text-decoration: underline;
          }
          .info-row {
            display: flex;
            gap: 15px;
            margin: 12px 0;
            padding: 5px 0;
          }
          .label {
            font-weight: bold;
            min-width: 120px;
          }
          .value {
            flex: 1;
          }
          .signature-section {
            margin-top: 60px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            padding: 0 50px;
          }
          .signature-item {
            text-align: center;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 30px;
          }
          @media print {
            body { padding: 0; }
            .container { padding: 10mm; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getClassText = () => {
    const classMap: Record<string, string> = {
      "1": "الأول",
      "2": "الثاني", 
      "3": "الثالث",
    };
    return classMap[student.classRoom || ""] || student.classRoom || "";
  };

  const formatBirthDate = () => {
    if (student.birthDate) {
      const parts = student.birthDate.split("/");
      if (parts.length === 3) {
        const months: string[] = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", 
                        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const day = parseInt(parts[2]);
        const monthIndex = parseInt(parts[1]) - 1;
        const year = parts[0];
        return `${day} ${months[monthIndex] || ""} ${year}`;
      }
    }
    return student.birthDate || "";
  };

  return (
    <Card className="print:shadow-none print:border-none">
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 p-4 border-b print:hidden flex-wrap">
        <h2 className="text-lg font-semibold" data-testid="text-enrollment-title">بيان قيد طالب</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onClose} data-testid="button-close-enrollment">
            <X className="h-4 w-4 ml-2" />
            إغلاق
          </Button>
          <Button size="sm" onClick={handlePrint} data-testid="button-print-enrollment">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="p-4 bg-muted/30 border-b print:hidden">
        <p className="text-sm text-muted-foreground mb-3">قم بتعبئة البيانات التالية قبل الطباعة:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="academic-year">العام الدراسي</Label>
            <Input
              id="academic-year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2018-2019"
              data-testid="input-academic-year"
            />
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div ref={printRef} className="p-6 bg-white text-black" dir="rtl">
        <div className="container">
          {/* Student Code Header */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ border: "2px solid #000", padding: "8px 20px", display: "inline-flex", gap: "20px", alignItems: "center" }}>
              <span style={{ fontWeight: "bold" }}>كود الطالب</span>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>{student.studentCode || student.id}</span>
            </div>
          </div>

          {/* School Header */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>إدارة بندر كفر الدوار التعليمية</div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>مدرسة السعرانية الثانية المشتركة</div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", textDecoration: "underline" }}>
              بيان قيد طالب
            </h2>
          </div>

          {/* Student Information */}
          <div style={{ padding: "0 30px" }}>
            {/* Name */}
            <div style={{ display: "flex", marginBottom: "15px" }}>
              <span style={{ fontWeight: "bold", minWidth: "130px" }}>الاســــــــــــم :</span>
              <span>{student.name}</span>
            </div>

            {/* Class and Section */}
            <div style={{ display: "flex", marginBottom: "15px", gap: "50px" }}>
              <div style={{ display: "flex" }}>
                <span style={{ fontWeight: "bold", minWidth: "130px" }}>الصـــــــــف :</span>
                <span>{getClassText()}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ fontWeight: "bold" }}>الفصل :</span>
                <span style={{ marginRight: "10px" }}>{student.serialNumber || ""}</span>
              </div>
            </div>

            {/* Birth Date and National ID */}
            <div style={{ display: "flex", marginBottom: "15px", gap: "30px" }}>
              <div style={{ display: "flex" }}>
                <span style={{ fontWeight: "bold", minWidth: "130px" }}>تاريخ الميلاد :</span>
                <span>{formatBirthDate()}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ fontWeight: "bold" }}>قومي</span>
                <span style={{ marginRight: "10px" }}>{student.nationalId}</span>
              </div>
            </div>

            {/* Enrollment Status */}
            <div style={{ display: "flex", marginBottom: "15px" }}>
              <span style={{ fontWeight: "bold", minWidth: "130px" }}>حالة القيـــد :</span>
              <span>{student.enrollmentStatus} للعام الدراسي {academicYear} م</span>
            </div>

            {/* Birth Governorate */}
            <div style={{ display: "flex", marginBottom: "15px" }}>
              <span style={{ fontWeight: "bold", minWidth: "130px" }}>جهة الميــلاد :</span>
              <span>محافظة {student.birthGovernorate}</span>
            </div>

            {/* Guardian */}
            <div style={{ display: "flex", marginBottom: "15px" }}>
              <span style={{ fontWeight: "bold", minWidth: "130px" }}>ولي الأمر</span>
              <span>{student.guardianName}</span>
            </div>
          </div>

          {/* Request Reason */}
          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <span style={{ fontWeight: "bold" }}>بناء علي طلب ولي الامر</span>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: "60px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 50px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold", marginBottom: "30px" }}>وكيل شؤون الطلاب</div>
                <div>احمد غانم</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold", marginBottom: "30px" }}>يعتمد ؛؛</div>
                <div style={{ fontWeight: "bold" }}>مدير المدرسة</div>
                <div>إبراهيم السباعي</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
