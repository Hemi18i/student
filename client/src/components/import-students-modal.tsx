import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { apiRequest } from "@/lib/queryClient";

interface ImportStudentsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedRow {
  [key: string]: any;
}

export function ImportStudentsModal({ open, onClose }: ImportStudentsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [groupName, setGroupName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: ParsedRow[]) => {
      if (!groupName) throw new Error("يرجى إدخال اسم المجموعة");
      const response = await apiRequest("POST", "/api/students/import", {
        students: data,
        groupName
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد الطلاب في مجموعة ${groupName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      resetModal();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الاستيراد",
        description: error.message || "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let rows: ParsedRow[] = [];

      if (extension === "json") {
        const text = await file.text();
        const data = JSON.parse(text);
        rows = Array.isArray(data) ? data : [data];
      } else if (extension === "csv") {
        const text = await file.text();
        rows = parseCSV(text);
      } else if (extension === "xlsx" || extension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        rows = parseExcel(arrayBuffer);
      } else {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          rows = Array.isArray(data) ? data : [data];
        } catch {
          rows = parseCSV(text);
        }
      }

      if (rows.length === 0) {
        throw new Error("الملف فارغ أو لا يحتوي على بيانات");
      }

      setParsedData(rows);
      setShowPreview(true);
    } catch (error: any) {
      toast({
        title: "خطأ في قراءة الملف",
        description: error.message || "تأكد من أن الملف بصيغة صحيحة",
        variant: "destructive",
      });
    }
  };

  const parseExcel = (arrayBuffer: ArrayBuffer): ParsedRow[] => {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      throw new Error("الملف لا يحتوي على أوراق عمل");
    }

    const worksheet = workbook.Sheets[sheetName];
    // Get array of arrays first
    const rows = XLSX.utils.sheet_to_json(worksheet, { 
      defval: "",
      header: 1 // Get arrays instead of objects
    }) as any[][];
    
    if (rows.length < 2) {
      throw new Error("الملف يجب أن يحتوي على صف رؤوس وبيانات واحدة على الأقل");
    }

    // First row is headers
    const headers = rows[0].map((h: any) => String(h).trim());
    
    // Convert remaining rows to objects
    const data: ParsedRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i] || rows[i].every((cell: any) => !cell)) continue; // Skip empty rows
      const row: ParsedRow = {};
      headers.forEach((header, idx) => {
        row[header] = rows[i][idx] !== undefined ? String(rows[i][idx]).trim() : "";
      });
      data.push(row);
    }
    
    console.log("Parsed XLSX rows count:", data.length);
    return data;
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseCSVLine(lines[i]);
      const row: ParsedRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }

    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    // More robust CSV parser that handles quoted fields
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current.trim());
    
    return result;
  };

  const resetModal = () => {
    setSelectedFile(null);
    setParsedData([]);
    setShowPreview(false);
    setGroupName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = () => {
    if (parsedData.length === 0) return;
    importMutation.mutate(parsedData);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto text-right" dir="rtl" data-testid="dialog-import-students">
        <DialogHeader>
          <DialogTitle>استيراد بيانات الطلاب</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">اسم المجموعة (مثل: الصف الأول - 2024)</Label>
            <Input
              id="group-name"
              placeholder="أدخل اسم المجموعة أولاً"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="text-right"
            />
          </div>

          {!showPreview ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate cursor-pointer"
                onClick={() => {
                  if (!groupName) {
                    toast({
                      title: "تنبيه",
                      description: "يرجى إدخال اسم المجموعة أولاً قبل اختيار الملف",
                      variant: "destructive",
                    });
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                data-testid="area-file-drop"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  انقر لاختيار ملف
                </p>
                <p className="text-xs text-muted-foreground">
                  يدعم ملفات CSV و JSON و Excel
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  data-testid="input-file-upload"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">خطوات الاستيراد:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>أدخل اسم المجموعة أولاً</li>
                    <li>اختر الملف المراد رفعه</li>
                    <li>تأكد من وجود أسماء الأعمدة في الصف الأول</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">
                  معاينة البيانات (سيتم الحفظ في مجموعة: {groupName})
                </h3>
                <Badge className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {parsedData.length} صف
                </Badge>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {parsedData.slice(0, 5).map((row, idx) => (
                  <Card key={idx} className="p-3">
                    <p className="text-sm font-medium text-foreground mb-1">
                      السجل {idx + 1}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(row)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key}>
                            <p className="text-muted-foreground">{key}:</p>
                            <p className="text-foreground truncate">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </Card>
                ))}
              </div>

              {parsedData.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  ... و{parsedData.length - 5} صف إضافي
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row-reverse sm:justify-start gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-import"
          >
            إلغاء
          </Button>
          {showPreview && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                data-testid="button-back-import"
              >
                رجوع
              </Button>
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending}
                data-testid="button-confirm-import"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الاستيراد...
                  </>
                ) : (
                  "استيراد الآن"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
