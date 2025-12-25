import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, Trash2 } from "lucide-react";
import type { Student, StudentGroup } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface StudentListProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
}

export function StudentList({ students, selectedStudent, onSelectStudent }: StudentListProps) {
  const { toast } = useToast();
  const { data: groups = [] } = useQuery<StudentGroup[]>({
    queryKey: ["/api/groups"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الطالب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل حذف الطالب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">لا يوجد طلاب</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px]">
      <div className="divide-y divide-border">
        {students.map((student) => (
          <div
            key={student.id}
            className={`w-full text-right p-4 transition-colors hover-elevate active-elevate-2 flex items-center justify-between group ${
              selectedStudent?.id === student.id
                ? "bg-accent"
                : ""
            }`}
          >
            <button
              onClick={() => onSelectStudent(student)}
              className="flex-1 text-right"
              data-testid={`student-row-${student.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate mb-1">
                    {student.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                    {student.nationalId}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {student.classRoom || "غير محدد"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {student.gender === "أنثى" ? "طالبة" : "طالب"}
                  </span>
                </div>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
                  deleteMutation.mutate(student.id);
                }
              }}
              data-testid={`button-delete-student-${student.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
