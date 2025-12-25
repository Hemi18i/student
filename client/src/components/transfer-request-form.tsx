import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Printer, X, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Student } from "@shared/schema";

interface TransferRequestFormProps {
  student: Student;
  onClose: () => void;
}

export function TransferRequestForm({ student, onClose }: TransferRequestFormProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [fromSchool, setFromSchool] = useState("السعرانية الثانوية المشتركة");
  const [toSchool, setToSchool] = useState("");
  const [transferReason, setTransferReason] = useState("قرب محل السكن");
  const [stayDuration, setStayDuration] = useState("سنة");
  const [isSaved, setIsSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/transfer-requests", {
        studentId: student.id,
        fromSchool,
        toSchool,
        transferReason,
        requestDate: getCurrentDate(),
        status: "pending",
      });
    },
    onSuccess: () => {
      setIsSaved(true);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ طلب التحويل بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students", student.id, "transfer-requests"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ طلب التحويل",
        variant: "destructive",
      });
    },
  });

  const formatDate = () => {
    if (student.birthDay && student.birthMonth && student.birthYear) {
      return `${student.birthDay}/${student.birthMonth}/${student.birthYear}`;
    }
    return student.birthDate || "";
  };

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
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طلب تحويل طالب</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Cairo', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            padding: 20px;
            background: white;
            color: black;
          }
          .form-container {
            max-width: 210mm;
            margin: 0 auto;
            border: 2px solid black;
          }
          .header {
            text-align: center;
            padding: 15px;
            border-bottom: 2px solid black;
            font-weight: bold;
            font-size: 16px;
          }
          .section {
            padding: 10px 15px;
            border-bottom: 1px solid black;
          }
          .section:last-child {
            border-bottom: none;
          }
          .row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            margin-bottom: 8px;
          }
          .label {
            font-weight: 600;
            margin-left: 5px;
          }
          .value {
            border-bottom: 1px dotted black;
            min-width: 100px;
            padding: 0 5px;
          }
          .value-long {
            flex: 1;
            min-width: 200px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }
          .checkbox-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 5px 0;
          }
          .checkbox {
            width: 16px;
            height: 16px;
            border: 1px solid black;
            display: inline-block;
          }
          .signature-area {
            text-align: center;
            padding: 20px 10px;
          }
          .signature-line {
            border-top: 1px solid black;
            width: 150px;
            margin: 30px auto 5px;
          }
          .school-section {
            border: 1px solid black;
            margin: 10px 0;
            padding: 10px;
          }
          .school-header {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .text-center {
            text-align: center;
          }
          .text-bold {
            font-weight: bold;
          }
          .mt-2 {
            margin-top: 10px;
          }
          .mb-2 {
            margin-bottom: 10px;
          }
          @media print {
            body {
              padding: 0;
            }
            .form-container {
              border-width: 1px;
            }
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

  return (
    <Card className="print:shadow-none print:border-none">
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 p-4 border-b print:hidden flex-wrap">
        <h2 className="text-lg font-semibold" data-testid="text-transfer-title">طلب تحويل طالب</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onClose} data-testid="button-close-transfer">
            <X className="h-4 w-4 ml-2" />
            إغلاق
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => saveMutation.mutate()} 
            disabled={saveMutation.isPending || isSaved || !toSchool}
            data-testid="button-save-transfer"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 ml-2" />
            )}
            {isSaved ? "تم الحفظ" : "حفظ الطلب"}
          </Button>
          <Button size="sm" onClick={handlePrint} data-testid="button-print-transfer">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="p-4 bg-muted/30 border-b print:hidden">
        <p className="text-sm text-muted-foreground mb-3">قم بتعبئة البيانات التالية قبل الطباعة:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fromSchool">من مدرسة</Label>
            <Input
              id="fromSchool"
              value={fromSchool}
              onChange={(e) => setFromSchool(e.target.value)}
              className="mt-1"
              data-testid="input-from-school"
            />
          </div>
          <div>
            <Label htmlFor="toSchool">إلى مدرسة</Label>
            <Input
              id="toSchool"
              value={toSchool}
              onChange={(e) => setToSchool(e.target.value)}
              placeholder="أدخل اسم المدرسة المحول إليها"
              className="mt-1"
              data-testid="input-to-school"
            />
          </div>
          <div>
            <Label htmlFor="transferReason">سبب التحويل</Label>
            <Input
              id="transferReason"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="mt-1"
              data-testid="input-transfer-reason"
            />
          </div>
          <div>
            <Label htmlFor="stayDuration">مدة بقاء بالصف</Label>
            <Input
              id="stayDuration"
              value={stayDuration}
              onChange={(e) => setStayDuration(e.target.value)}
              className="mt-1"
              data-testid="input-stay-duration"
            />
          </div>
        </div>
      </div>

      {/* Printable Form */}
      <CardContent className="p-4">
        <div ref={printRef}>
          <div className="form-container border-2 border-black">
            {/* Header */}
            <div className="header text-center p-4 border-b-2 border-black font-bold text-lg">
              طلب تحويل طالب بين المدارس الرسمية
            </div>

            {/* To School Director - First Section */}
            <div className="section p-3 border-b border-black">
              <div className="row flex items-center gap-2 mb-2">
                <span className="label font-semibold">السيد الأستاذ / مدير مدرسة</span>
                <span className="value border-b border-dotted border-black px-2 min-w-[200px]">{fromSchool}</span>
              </div>
              <div className="text-center mb-2">تحية طيبة وبعد ::</div>
              <div className="row flex flex-wrap items-center gap-1 mb-2">
                <span>نرجوا من سيادتكم التكرم بالموافقة على تحويل ابني / ابنتي :</span>
                <span className="value border-b border-dotted border-black px-2 font-semibold min-w-[200px]">{student.name}</span>
              </div>
              <div className="row flex flex-wrap items-center gap-1 mb-2">
                <span className="label">من مدرسة :</span>
                <span className="value border-b border-dotted border-black px-2 min-w-[200px]">{fromSchool}</span>
                <span className="label mr-4">إلى مدرسة :</span>
                <span className="value border-b border-dotted border-black px-2 min-w-[200px]">{toSchool || "........................"}</span>
              </div>
              <div className="row flex items-center gap-1 mb-2">
                <span className="label">وذلك نظراً لـ :</span>
                <span className="value border-b border-dotted border-black px-2 flex-1">{transferReason}</span>
              </div>
              <div className="text-center mt-3 mb-2">وتفضلوا بقبول وافر التحية !!</div>
              <div className="row flex items-center gap-1">
                <span className="label">مقدمه لسيادتكم</span>
                <span className="value border-b border-dotted border-black px-2 min-w-[250px]">{student.guardianName}</span>
              </div>
            </div>

            {/* Student Info Section */}
            <div className="section p-3 border-b border-black">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">الاسم:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1">{student.name}</span>
                </div>
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">كود الطالب:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1 font-mono">{student.studentCode}</span>
                </div>
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">الصف الدراسي:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1">{student.classRoom || "الأول الثانوي"}</span>
                </div>
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">مدة بقائه بالصف:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1">{stayDuration}</span>
                </div>
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">تاريخ الميلاد:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1">{formatDate()}</span>
                </div>
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">اسم ولي الأمر:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1">{student.guardianName}</span>
                </div>
                <div className="row flex items-center gap-1 col-span-2">
                  <span className="label font-semibold">عنوان السكن:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1">{student.studentAddress}</span>
                </div>
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">سبب التحويل:</span>
                  <span className="value border-b border-dotted border-black px-2 flex-1">{transferReason}</span>
                </div>
                <div className="row flex items-center gap-1">
                  <span className="label font-semibold">الموقف من سداد الرسوم الدراسية:</span>
                  <span className="value border-b border-dotted border-black px-2">سدد</span>
                </div>
                <div className="row flex items-center gap-1 col-span-2">
                  <span className="label font-semibold">الموقف من استلام الكتب المدرسية:</span>
                  <span className="value border-b border-dotted border-black px-2">تسلم</span>
                </div>
              </div>
            </div>

            {/* Second School Director Section */}
            <div className="section p-3 border-b border-black">
              <div className="row flex items-center gap-2 mb-2">
                <span className="label font-semibold">السيد الأستاذ مدير مدرسة</span>
                <span className="value border-b border-dotted border-black px-2 min-w-[200px]">{toSchool || "........................"}</span>
              </div>
              <div className="text-center mb-2">تحية طيبة وبعد ::</div>
              <div className="mb-2">يرجاء التكرم بموافقتنا بإمكان تحويل الطالب المذكور بعالية إلى مدرستكم من عدمه</div>
              <div className="text-center mt-2">وتفضلوا بقبول فائق الإحترام!!</div>
              <div className="flex justify-between mt-4">
                <span>يعتمد ::</span>
                <span>مدير المدرسة</span>
              </div>
              <div className="text-left mt-2">التاريخ: {getCurrentDate()}</div>
            </div>

            {/* Receiving School Section */}
            <div className="section p-3 border-b border-black">
              <div className="row flex items-center gap-2 mb-3">
                <span className="label font-semibold">السيد الأستاذ / مدير مدرسة</span>
                <span className="value border-b border-dotted border-black px-2 min-w-[200px]">{fromSchool}</span>
              </div>
              <div className="flex gap-8 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border border-black inline-block"></span>
                  <span>يمكن قبول طلب التحويل</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border border-black inline-block"></span>
                  <span>لا يمكن قبول طلب التحويل</span>
                </div>
              </div>
              <div className="text-center mb-2">وتفضلوا بقبول فائق الإحترام!!!</div>
              <div className="flex justify-between">
                <span>التاريخ: ......./......./..............</span>
                <span>مدير المدرسة</span>
              </div>
            </div>

            {/* Guardian Declaration */}
            <div className="section p-3">
              <div className="text-center font-semibold mb-2">إقـــــرار</div>
              <div className="mb-2">
                أقر أنا / ولي أمر الطالب / الطالبة : <span className="border-b border-dotted border-black px-2">{student.name}</span>
              </div>
              <div className="mb-2">
                بأنني تنسقت على ابني / ابنتي وذلك لتقديمه إلى مدرسة ................................. 
              </div>
              <div className="flex justify-between mt-4">
                <span>الاسم: {student.guardianName}</span>
                <span>التوقيع: ........................</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
