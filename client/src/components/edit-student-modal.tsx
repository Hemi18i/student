import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save } from "lucide-react";
import type { Student } from "@shared/schema";

interface EditStudentModalProps {
  student: Student;
  open: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export function EditStudentModal({ student, open, onClose, onSave }: EditStudentModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Student>>({
    name: student.name,
    nationalId: student.nationalId,
    birthDate: student.birthDate || "",
    birthDay: student.birthDay,
    birthMonth: student.birthMonth,
    birthYear: student.birthYear,
    birthGovernorate: student.birthGovernorate || "",
    gender: student.gender || "",
    religion: student.religion || "",
    nationality: student.nationality || "",
    classRoom: student.classRoom || "",
    studentCode: student.studentCode || "",
    lastCertificate: student.lastCertificate || "",
    lastSchool: student.lastSchool || "",
    totalScore: student.totalScore || "",
    guardianName: student.guardianName || "",
    studentAddress: student.studentAddress || "",
    enrollmentStatus: student.enrollmentStatus || "",
    orphanStatus: student.orphanStatus || "",
    notes: student.notes || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const response = await apiRequest("PATCH", `/api/students/${student.id}`, data);
      return response as Student;
    },
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات الطالب بنجاح",
      });
      onSave(updatedStudent);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof Student, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الطالب</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold mb-4">البيانات الشخصية</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      className="mt-1"
                      data-testid="input-edit-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationalId">الرقم القومي *</Label>
                    <Input
                      id="nationalId"
                      value={formData.nationalId || ""}
                      onChange={(e) => handleChange("nationalId", e.target.value)}
                      required
                      className="mt-1 font-mono"
                      dir="ltr"
                      data-testid="input-edit-national-id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthGovernorate">محافظة الميلاد</Label>
                    <Input
                      id="birthGovernorate"
                      value={formData.birthGovernorate || ""}
                      onChange={(e) => handleChange("birthGovernorate", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-governorate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">النوع</Label>
                    <Input
                      id="gender"
                      value={formData.gender || ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-gender"
                    />
                  </div>
                  <div>
                    <Label htmlFor="religion">الديانة</Label>
                    <Input
                      id="religion"
                      value={formData.religion || ""}
                      onChange={(e) => handleChange("religion", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-religion"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">الجنسية</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality || ""}
                      onChange={(e) => handleChange("nationality", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-nationality"
                    />
                  </div>
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <h3 className="text-sm font-semibold mb-4">تاريخ الميلاد</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="birthDay">اليوم</Label>
                    <Input
                      id="birthDay"
                      type="number"
                      value={formData.birthDay || ""}
                      onChange={(e) => handleChange("birthDay", parseInt(e.target.value) || null)}
                      className="mt-1"
                      min={1}
                      max={31}
                      data-testid="input-edit-birth-day"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthMonth">الشهر</Label>
                    <Input
                      id="birthMonth"
                      type="number"
                      value={formData.birthMonth || ""}
                      onChange={(e) => handleChange("birthMonth", parseInt(e.target.value) || null)}
                      className="mt-1"
                      min={1}
                      max={12}
                      data-testid="input-edit-birth-month"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthYear">السنة</Label>
                    <Input
                      id="birthYear"
                      type="number"
                      value={formData.birthYear || ""}
                      onChange={(e) => handleChange("birthYear", parseInt(e.target.value) || null)}
                      className="mt-1"
                      data-testid="input-edit-birth-year"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h3 className="text-sm font-semibold mb-4">البيانات الدراسية</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="classRoom">الفصل</Label>
                    <Input
                      id="classRoom"
                      value={formData.classRoom || ""}
                      onChange={(e) => handleChange("classRoom", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-classroom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentCode">كود الطالب</Label>
                    <Input
                      id="studentCode"
                      value={formData.studentCode || ""}
                      onChange={(e) => handleChange("studentCode", e.target.value)}
                      className="mt-1 font-mono"
                      dir="ltr"
                      data-testid="input-edit-student-code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastCertificate">آخر شهادة</Label>
                    <Input
                      id="lastCertificate"
                      value={formData.lastCertificate || ""}
                      onChange={(e) => handleChange("lastCertificate", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-last-certificate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastSchool">آخر مدرسة</Label>
                    <Input
                      id="lastSchool"
                      value={formData.lastSchool || ""}
                      onChange={(e) => handleChange("lastSchool", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-last-school"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalScore">المجموع</Label>
                    <Input
                      id="totalScore"
                      value={formData.totalScore || ""}
                      onChange={(e) => handleChange("totalScore", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-total-score"
                    />
                  </div>
                  <div>
                    <Label htmlFor="enrollmentStatus">حالة القيد</Label>
                    <Input
                      id="enrollmentStatus"
                      value={formData.enrollmentStatus || ""}
                      onChange={(e) => handleChange("enrollmentStatus", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-enrollment-status"
                    />
                  </div>
                </div>
              </div>

              {/* Guardian & Address */}
              <div>
                <h3 className="text-sm font-semibold mb-4">بيانات ولي الأمر والعنوان</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guardianName">اسم ولي الأمر</Label>
                    <Input
                      id="guardianName"
                      value={formData.guardianName || ""}
                      onChange={(e) => handleChange("guardianName", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-guardian-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentAddress">العنوان</Label>
                    <Input
                      id="studentAddress"
                      value={formData.studentAddress || ""}
                      onChange={(e) => handleChange("studentAddress", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-address"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="text-sm font-semibold mb-4">معلومات إضافية</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orphanStatus">حالة اليتم</Label>
                    <Input
                      id="orphanStatus"
                      value={formData.orphanStatus || ""}
                      onChange={(e) => handleChange("orphanStatus", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-orphan-status"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Input
                      id="notes"
                      value={formData.notes || ""}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      className="mt-1"
                      data-testid="input-edit-notes"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
              data-testid="button-cancel-edit"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
