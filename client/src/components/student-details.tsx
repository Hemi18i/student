import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  FileText, 
  Edit, 
  Printer, 
  Calendar, 
  MapPin, 
  Phone, 
  School, 
  Award,
  Users,
  Home,
  Flag,
  BookOpen,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import type { Student } from "@shared/schema";

interface StudentDetailsProps {
  student: Student;
  onTransferRequest: () => void;
  onEdit: () => void;
  onWarning: () => void;
  onEnrollmentStatement: () => void;
}

// Known fields to exclude from additional display
const knownFields = new Set([
  'id', 'name', 'nationalId', 'classRoom', 'studentCode', 'classCode',
  'serialNumber', 'birthDate', 'birthDay', 'birthMonth', 'birthYear',
  'birthGovernorate', 'gender', 'religion', 'nationality', 'lastCertificate',
  'lastSchool', 'totalScore', 'guardianName', 'studentAddress', 'stage',
  'orphanStatus', 'enrollmentStatus', 'tabletSerial', 'imei', 'insuranceNumber',
  'enrollmentDate', 'notes'
]);

function hasAdditionalFields(student: Student): boolean {
  return Object.keys(student).some(key => !knownFields.has(key));
}

function renderAdditionalFields(student: Student) {
  return Object.entries(student)
    .filter(([key]) => !knownFields.has(key))
    .map(([key, value]) => {
      if (!value) return null;
      const displayLabel = String(key)
        .replace(/([A-Z])/g, ' $1')
        .trim();
      return (
        <InfoItem
          key={key}
          label={displayLabel}
          value={String(value)}
        />
      );
    });
}

export function StudentDetails({ student, onTransferRequest, onEdit, onWarning, onEnrollmentStatement }: StudentDetailsProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = () => {
    if (student.birthDay && student.birthMonth && student.birthYear) {
      return `${student.birthDay}/${student.birthMonth}/${student.birthYear}`;
    }
    return student.birthDate || "غير محدد";
  };

  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{student.name}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1" dir="ltr">
                {student.nationalId}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              data-testid="button-print-details"
            >
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              data-testid="button-edit-student"
            >
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTransferRequest}
              data-testid="button-transfer-request"
            >
              <FileText className="h-4 w-4 ml-2" />
              طلب تحويل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onWarning}
              data-testid="button-warning"
            >
              <AlertTriangle className="h-4 w-4 ml-2" />
              إنذار
            </Button>
            <Button
              size="sm"
              onClick={onEnrollmentStatement}
              data-testid="button-enrollment-statement"
            >
              <ClipboardList className="h-4 w-4 ml-2" />
              بيان قيد
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Info Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            البيانات الشخصية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem 
              icon={<User className="h-4 w-4" />}
              label="الاسم" 
              value={student.name} 
            />
            <InfoItem 
              icon={<FileText className="h-4 w-4" />}
              label="الرقم القومي" 
              value={student.nationalId}
              mono 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="تاريخ الميلاد" 
              value={formatDate()} 
            />
            <InfoItem 
              icon={<MapPin className="h-4 w-4" />}
              label="محافظة الميلاد" 
              value={student.birthGovernorate} 
            />
            <InfoItem 
              icon={<Users className="h-4 w-4" />}
              label="النوع" 
              value={student.gender} 
            />
            <InfoItem 
              icon={<BookOpen className="h-4 w-4" />}
              label="الديانة" 
              value={student.religion} 
            />
            <InfoItem 
              icon={<Flag className="h-4 w-4" />}
              label="الجنسية" 
              value={student.nationality} 
            />
          </div>
        </div>

        <Separator />

        {/* Academic Info Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <School className="h-4 w-4" />
            البيانات الدراسية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem 
              icon={<School className="h-4 w-4" />}
              label="الفصل" 
              value={student.classRoom} 
            />
            <InfoItem 
              icon={<FileText className="h-4 w-4" />}
              label="كود الفصل" 
              value={student.classCode}
              mono 
            />
            <InfoItem 
              icon={<FileText className="h-4 w-4" />}
              label="كود الطالب" 
              value={student.studentCode}
              mono 
            />
            <InfoItem 
              icon={<Award className="h-4 w-4" />}
              label="المرحلة" 
              value={student.stage} 
            />
            <InfoItem 
              icon={<Award className="h-4 w-4" />}
              label="آخر شهادة" 
              value={student.lastCertificate} 
            />
            <InfoItem 
              icon={<School className="h-4 w-4" />}
              label="آخر مدرسة" 
              value={student.lastSchool} 
            />
            <InfoItem 
              icon={<Award className="h-4 w-4" />}
              label="المجموع" 
              value={student.totalScore} 
            />
            <InfoItem 
              icon={<FileText className="h-4 w-4" />}
              label="حالة القيد" 
              value={student.enrollmentStatus} 
            />
          </div>
        </div>

        <Separator />

        {/* Guardian & Address Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Home className="h-4 w-4" />
            بيانات ولي الأمر والعنوان
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem 
              icon={<Users className="h-4 w-4" />}
              label="اسم ولي الأمر" 
              value={student.guardianName} 
            />
            <InfoItem 
              icon={<Home className="h-4 w-4" />}
              label="العنوان" 
              value={student.studentAddress} 
            />
          </div>
        </div>

        {/* Device & Insurance Info */}
        {(student.tabletSerial || student.imei || student.insuranceNumber || student.enrollmentDate) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                معلومات الجهاز والتأمين
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {student.tabletSerial && (
                  <InfoItem 
                    icon={<FileText className="h-4 w-4" />}
                    label="رقم مسلسل التابلت" 
                    value={student.tabletSerial}
                    mono 
                  />
                )}
                {student.imei && (
                  <InfoItem 
                    icon={<FileText className="h-4 w-4" />}
                    label="IMEI" 
                    value={student.imei}
                    mono 
                  />
                )}
                {student.insuranceNumber && (
                  <InfoItem 
                    icon={<FileText className="h-4 w-4" />}
                    label="رقم بوليصة التأمين" 
                    value={student.insuranceNumber}
                    mono 
                  />
                )}
                {student.enrollmentDate && (
                  <InfoItem 
                    icon={<Calendar className="h-4 w-4" />}
                    label="تاريخ الالتحاق" 
                    value={student.enrollmentDate} 
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Additional Info */}
        {(student.orphanStatus || student.notes || hasAdditionalFields(student)) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                معلومات إضافية
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {student.orphanStatus && (
                  <InfoItem 
                    icon={<Users className="h-4 w-4" />}
                    label="حالة اليتم" 
                    value={student.orphanStatus} 
                  />
                )}
                {student.notes && (
                  <InfoItem 
                    icon={<FileText className="h-4 w-4" />}
                    label="ملاحظات" 
                    value={student.notes} 
                  />
                )}
                {renderAdditionalFields(student)}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}

function InfoItem({ icon, label, value, mono }: InfoItemProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`} dir={mono ? "ltr" : undefined}>
        {value || "غير محدد"}
      </p>
    </div>
  );
}
