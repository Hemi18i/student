import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, FileText, GraduationCap, X, Upload, Plus, Trash2 } from "lucide-react";
import { StudentList } from "@/components/student-list";
import { StudentDetails } from "@/components/student-details";
import { TransferRequestForm } from "@/components/transfer-request-form";
import { WarningForm } from "@/components/warning-form";
import { EnrollmentStatementForm } from "@/components/enrollment-statement-form";
import { EditStudentModal } from "@/components/edit-student-modal";
import { ImportStudentsModal } from "@/components/import-students-modal";
import { AddStudentModal } from "@/components/add-student-modal";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { Student, StudentGroup } from "@shared/schema";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"nationalId" | "name">("nationalId");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showWarningForm, setShowWarningForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: groups = [] } = useQuery<StudentGroup[]>({
    queryKey: ["/api/groups"],
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<Student[]>({
    queryKey: ["/api/students/search", debouncedSearchQuery, searchType],
    queryFn: async () => {
      const response = await fetch(`/api/students/search?q=${encodeURIComponent(debouncedSearchQuery)}&type=${searchType}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedSearchQuery.length > 0,
  });

  const displayStudents = useMemo(() => {
    let list = debouncedSearchQuery.length > 0 ? (searchResults || []) : (students || []);
    if (selectedGroupId !== "all") {
      list = list.filter(s => s.groupId === parseInt(selectedGroupId));
    }
    return list;
  }, [debouncedSearchQuery, searchResults, students, selectedGroupId]);

  const totalStudents = students?.length || 0;

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowTransferForm(false);
    setShowWarningForm(false);
    setShowEnrollmentForm(false);
  };

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setSelectedGroupId("all");
      toast({ title: "تم حذف المجموعة بنجاح" });
    },
    onError: (error) => {
      console.error("Delete group error:", error);
      toast({ 
        title: "خطأ في حذف المجموعة", 
        description: "تأكد من إفراغ المجموعة من الطلاب أولاً أو حاول مرة أخرى",
        variant: "destructive" 
      });
    }
  });

  const handleTransferRequest = () => {
    if (selectedStudent) {
      setShowTransferForm(true);
      setShowWarningForm(false);
      setShowEnrollmentForm(false);
    }
  };

  const handleWarning = () => {
    if (selectedStudent) {
      setShowWarningForm(true);
      setShowTransferForm(false);
      setShowEnrollmentForm(false);
    }
  };

  const handleEnrollmentStatement = () => {
    if (selectedStudent) {
      setShowEnrollmentForm(true);
      setShowTransferForm(false);
      setShowWarningForm(false);
    }
  };

  const handleEditStudent = () => {
    if (selectedStudent) {
      setShowEditModal(true);
    }
  };

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الطالب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setSelectedStudent(null);
    },
    onError: () => {
      toast({
        title: "خطأ في حذف الطالب",
        variant: "destructive",
      });
    },
  });

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الطالب؟")) {
      deleteStudentMutation.mutate(selectedStudent.id);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground" data-testid="text-app-title">
                  نظام إدارة بيانات الطلاب
                </h1>
                <p className="text-sm text-muted-foreground" data-testid="text-school-name">
                  السعرانية الثانوية المشتركة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1" data-testid="badge-student-count">
                <Users className="h-3 w-3" />
                <span>{totalStudents} طالب</span>
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowImportModal(true)}
                className="gap-2"
                data-testid="button-import-students"
              >
                <Upload className="h-4 w-4" />
                استيراد
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="gap-2"
                data-testid="button-add-student"
              >
                <Plus className="h-4 w-4" />
                إضافة
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter Section */}
      <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-[200px]" data-testid="select-group">
                  <SelectValue placeholder="تصفية حسب المجموعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المجموعات</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {groups.length > 0 && selectedGroupId !== "all" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={deleteGroupMutation.isPending}
                  onClick={() => {
                    const groupId = parseInt(selectedGroupId);
                    const groupName = groups.find(g => g.id === groupId)?.name || '';
                    if (!deleteGroupMutation.isPending && confirm(`سيتم حذف المجموعة "${groupName}" وجميع طلابها، هل أنت متأكد؟`)) {
                      deleteGroupMutation.mutate(groupId);
                    }
                  }}
                  title="حذف المجموعة المختارة"
                  data-testid="button-delete-group"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={searchType === "nationalId" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("nationalId")}
                data-testid="button-search-national-id"
              >
                بالرقم القومي
              </Button>
              <Button
                variant={searchType === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("name")}
                data-testid="button-search-name"
              >
                بالاسم
              </Button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchType === "nationalId" ? "ابحث بالرقم القومي..." : "ابحث بالاسم..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-10"
                data-testid="input-search"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={clearSearch}
                  data-testid="button-clear-search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  قائمة الطلاب
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingStudents || isSearching ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <StudentList
                    students={displayStudents || []}
                    selectedStudent={selectedStudent}
                    onSelectStudent={handleSelectStudent}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Details / Forms */}
          <div className="lg:col-span-2">
            {showTransferForm && selectedStudent ? (
              <TransferRequestForm
                student={selectedStudent}
                onClose={() => setShowTransferForm(false)}
              />
            ) : showWarningForm && selectedStudent ? (
              <WarningForm
                student={selectedStudent}
                onClose={() => setShowWarningForm(false)}
              />
            ) : showEnrollmentForm && selectedStudent ? (
              <EnrollmentStatementForm
                student={selectedStudent}
                onClose={() => setShowEnrollmentForm(false)}
              />
            ) : selectedStudent ? (
              <div className="space-y-4">
                <StudentDetails
                  student={selectedStudent}
                  onTransferRequest={handleTransferRequest}
                  onEdit={handleEditStudent}
                  onWarning={handleWarning}
                  onEnrollmentStatement={handleEnrollmentStatement}
                />
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={handleDeleteStudent}
                  disabled={deleteStudentMutation.isPending}
                  data-testid="button-delete-student"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteStudentMutation.isPending ? "جاري الحذف..." : "حذف الطالب"}
                </Button>
              </div>
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    اختر طالباً لعرض بياناته
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    يمكنك البحث بالرقم القومي أو الاسم للعثور على الطالب المطلوب
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedStudent) => {
            setSelectedStudent(updatedStudent);
            setShowEditModal(false);
          }}
        />
      )}
      <ImportStudentsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
      <AddStudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
