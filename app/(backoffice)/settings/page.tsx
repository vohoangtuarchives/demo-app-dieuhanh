"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Plus,
  Save,
  Settings2,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

const UAT_ITEMS = [
  { key: "tourFlow", label: "Tour flow end-to-end", description: "Tạo → Dự toán → Bàn giao → Kết thúc → Quyết toán" },
  { key: "paymentFlow", label: "Payment flow end-to-end", description: "Cọc → Thanh toán đủ → Chứng từ" },
  { key: "settlementFlow", label: "Settlement/refund end-to-end", description: "Nộp QT → Duyệt → Hoàn/Thu tiền" },
  { key: "permissionCheck", label: "Permission matrix check", description: "OPS vs Manager quyền truy cập" },
] as const;

export default function SettingsPage() {
  const [uatChecks, setUatChecks] = useState<Record<string, boolean>>({
    tourFlow: false, paymentFlow: false, settlementFlow: false, permissionCheck: false,
  });
  const [uatNotes, setUatNotes] = useState<Record<string, string>>({
    tourFlow: "", paymentFlow: "", settlementFlow: "", permissionCheck: "",
  });

  const toggleCheck = (key: string) => setUatChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  const completedCount = useMemo(() => Object.values(uatChecks).filter(Boolean).length, [uatChecks]);
  const progressPercent = Math.round((completedCount / UAT_ITEMS.length) * 100);

  return (
    <div className="grid gap-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <SectionHeader
            icon={Settings2}
            title="Cài đặt hệ thống"
            description="Quản trị danh mục chi nhánh, vai trò, nhà cung cấp và ngưỡng duyệt quyết toán."
          />
        </CardContent>
      </Card>

      {/* Config cards */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><SectionHeader icon={Building2} title="Cấu hình phân quyền / ngưỡng duyệt" /></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Vai trò</label>
              <NativeSelect className="w-full">
                <option>Vai trò: NVĐH</option><option>Vai trò: Quản lý</option>
              </NativeSelect>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ngưỡng duyệt quyết toán</label>
              <Input placeholder="VD: 20,000,000" className="tabular-nums" />
            </div>
            <Button size="sm" className="gap-1.5"><Save className="size-3.5" />Lưu cấu hình</Button>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="success">Branch: Ready</Badge>
              <Badge variant="info">Role: Ready</Badge>
              <Badge variant="warning">Threshold: Pending review</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><SectionHeader icon={UserPlus} title="Thêm nhà cung cấp" /></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tên NCC</label>
              <Input placeholder="Nhập tên nhà cung cấp" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Loại dịch vụ</label>
              <NativeSelect className="w-full">
                <option>Chọn loại dịch vụ</option><option>Khách sạn</option><option>Xe du lịch</option><option>Nhà hàng</option>
              </NativeSelect>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Thông tin liên hệ</label>
              <Input placeholder="Email hoặc SĐT" />
            </div>
            <Button size="sm" className="gap-1.5"><Plus className="size-3.5" />Thêm NCC</Button>
          </CardContent>
        </Card>
      </section>

      {/* Branch table */}
      <Card>
        <CardHeader><SectionHeader icon={Building2} title="Danh sách cấu hình chi nhánh" /></CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Chi nhánh</TableHead>
                <TableHead>Quyền mặc định</TableHead>
                <TableHead>Ngưỡng duyệt</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">HCM</TableCell>
                <TableCell>OPS + MANAGER</TableCell>
                <TableCell className="tabular-nums">20,000,000</TableCell>
                <TableCell><Badge variant="success">Hoạt động</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Hà Nội</TableCell>
                <TableCell>OPS + MANAGER</TableCell>
                <TableCell className="tabular-nums">25,000,000</TableCell>
                <TableCell><Badge variant="success">Hoạt động</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* UAT checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <SectionHeader icon={ClipboardCheck} title="UAT checklist vận hành" />
            <Badge variant={completedCount === UAT_ITEMS.length ? "success" : "secondary"} className="tabular-nums">
              {completedCount}/{UAT_ITEMS.length}
            </Badge>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tiến độ kiểm thử</span>
              <span className={cn("font-semibold", progressPercent === 100 ? "text-emerald-600" : "text-primary")}>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="mt-1.5 h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {UAT_ITEMS.map((item) => (
            <div key={item.key} className="rounded-xl border border-border transition-all">
              <button
                type="button"
                onClick={() => toggleCheck(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-left transition-all",
                  uatChecks[item.key]
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-card hover:bg-muted/40",
                )}
              >
                <span className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                  uatChecks[item.key] ? "bg-emerald-600 text-white" : "border-2 border-border bg-background",
                )}>
                  {uatChecks[item.key] && <CheckCircle2 className="size-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium", uatChecks[item.key] ? "text-emerald-800 dark:text-emerald-300" : "text-foreground")}>{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                </div>
                {uatChecks[item.key] && (
                  <Badge variant="success" className="ml-auto text-[10px]">Passed</Badge>
                )}
              </button>
              <div className="border-t border-border px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <Input
                    value={uatNotes[item.key]}
                    onChange={(e) => setUatNotes((prev) => ({ ...prev, [item.key]: e.target.value }))}
                    placeholder={`Bằng chứng: ${item.label}`}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
