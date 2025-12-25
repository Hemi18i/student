import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, X } from "lucide-react";
import type { Student } from "@shared/schema";

interface WarningFormProps {
  student: Student;
  onClose: () => void;
}

export function WarningForm({ student, onClose }: WarningFormProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [warningNumber, setWarningNumber] = useState("1");
  const [absenceDays, setAbsenceDays] = useState("15");

  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  };

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
        <title>إنذار بالفصل - ${student.name}</title>
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
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
          }
          .header-right {
            text-align: right;
          }
          .header-left {
            text-align: left;
          }
          .student-code-box {
            border: 2px solid #000;
            padding: 8px 20px;
            display: inline-block;
            margin: 15px 0;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            text-decoration: underline;
          }
          .info-row {
            display: flex;
            gap: 30px;
            margin: 10px 0;
            padding: 5px 0;
          }
          .info-item {
            display: flex;
            gap: 10px;
          }
          .label {
            font-weight: bold;
          }
          .value {
            border-bottom: 1px solid #000;
            min-width: 150px;
            padding: 0 10px;
          }
          .body-text {
            text-align: justify;
            margin: 25px 0;
            line-height: 2;
            padding: 0 20px;
          }
          .signature-section {
            margin-top: 50px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
            padding: 0 30px;
          }
          .signature-item {
            text-align: center;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 30px;
          }
          .signature-name {
            border-top: 1px solid #000;
            padding-top: 5px;
            min-width: 120px;
          }
          .date-line {
            text-align: center;
            margin: 20px 0;
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

  return (
    <Card className="print:shadow-none print:border-none">
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 p-4 border-b print:hidden flex-wrap">
        <h2 className="text-lg font-semibold" data-testid="text-warning-title">إنذار بالفصل</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onClose} data-testid="button-close-warning">
            <X className="h-4 w-4 ml-2" />
            إغلاق
          </Button>
          <Button size="sm" onClick={handlePrint} data-testid="button-print-warning">
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
            <Label htmlFor="warning-number">رقم الإنذار</Label>
            <Input
              id="warning-number"
              value={warningNumber}
              onChange={(e) => setWarningNumber(e.target.value)}
              placeholder="1"
              data-testid="input-warning-number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="absence-days">عدد أيام الغياب</Label>
            <Input
              id="absence-days"
              value={absenceDays}
              onChange={(e) => setAbsenceDays(e.target.value)}
              placeholder="15"
              data-testid="input-absence-days"
            />
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div ref={printRef} className="p-6 bg-white text-black" dir="rtl">
        <div className="container">
          {/* Header */}
          <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold" }}>إدارة بندر كفر الدوار التعليمية</div>
              <div style={{ fontWeight: "bold" }}>مدرسة السعرانية الثانية المشتركة</div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div>السيد :</div>
              <div>العنوان :</div>
            </div>
          </div>

          {/* Student Code */}
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <div style={{ border: "2px solid #000", padding: "8px 30px", display: "inline-block" }}>
              <span style={{ fontWeight: "bold" }}>كود الطالب</span>
              <span style={{ marginRight: "20px" }}>{student.studentCode || student.id}</span>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", margin: "25px 0" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", textDecoration: "underline" }}>
              إنذار بالفصل رقم ( {warningNumber} )
            </h2>
          </div>

          {/* Student Info */}
          <div style={{ margin: "20px 0", padding: "0 20px" }}>
            <div style={{ display: "flex", gap: "30px", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ fontWeight: "bold" }}>السيد ولي أمر الطالب</span>
                <span style={{ borderBottom: "1px solid #000", minWidth: "200px", paddingRight: "10px" }}>
                  {student.guardianName}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "30px", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ fontWeight: "bold" }}>الصـــــــف :</span>
                <span>{getClassText()}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ fontWeight: "bold" }}>حالة القيد :</span>
                <span>{student.enrollmentStatus}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ fontWeight: "bold" }}>تفيدكم المدرسة بأن الطالب :</span>
              <span style={{ borderBottom: "1px solid #000", minWidth: "250px", paddingRight: "10px" }}>
                {student.name}
              </span>
            </div>
          </div>

          {/* Body Text */}
          <div style={{ textAlign: "justify", margin: "30px 20px", lineHeight: "2.2" }}>
            <p>
              قد استنفذ نسبة الغياب القانونية وستضطر المدرسة أسفة إلي تطبيق المادة ( 5 ) من القانون (136)
              لسنة 1981م التي تنص علي فصل الطالب الذي يتغيب ( {absenceDays} ) يوماً متصلاً أو منفصلاً بغير عذر
              مقبول
            </p>
            <p style={{ marginTop: "15px" }}>
              فإن لم يقدم الطالب الأعذار المقبول مع المواظبة التامه في ظرف ثلاثة أيام من تاريخه سيفصل
              مع قبول فائق الأحترام؛؛
            </p>
          </div>

          {/* Date */}
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <span style={{ fontWeight: "bold" }}>تحريراً في :</span>
            <span style={{ marginRight: "10px" }}>{getCurrentDate()}</span>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: "50px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ fontWeight: "bold" }}>شئون الطلاب</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 50px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold", marginBottom: "30px" }}>وكيل شئون الطلاب</div>
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
