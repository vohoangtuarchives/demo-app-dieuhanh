"use client";

import { useState } from "react";
import { PlPanel, PlTableShell } from "@/components/preline/layout-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SettingsPage() {
  const [uatChecks, setUatChecks] = useState({
    tourFlow: false,
    paymentFlow: false,
    settlementFlow: false,
    permissionCheck: false,
  });
  const [uatNotes, setUatNotes] = useState<Record<string, string>>({
    tourFlow: "",
    paymentFlow: "",
    settlementFlow: "",
    permissionCheck: "",
  });

  const toggleCheck = (key: keyof typeof uatChecks) => {
    setUatChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid gap-4">
      <PlPanel>
        <h2 className="text-lg font-semibold">Cài đặt hệ thống</h2>
        <p className="mt-1 text-sm text-muted-foreground">Quản trị danh mục chi nhánh, vai trò, nhà cung cấp và ngưỡng duyệt quyết toán.</p>
      </PlPanel>

      <section className="grid gap-4 md:grid-cols-2">
        <PlPanel>
          <h3 className="text-sm font-semibold">Cấu hình phân quyền / ngưỡng duyệt</h3>
          <div className="mt-3 grid gap-2">
            <NativeSelect className="w-full">
              <option>Vai trò: NVĐH</option>
              <option>Vai trò: Quản lý</option>
            </NativeSelect>
            <Input className="bg-card/80 backdrop-blur-sm" placeholder="Ngưỡng duyệt quyết toán (VD: 20,000,000)" />
            <Button size="sm">Lưu cấu hình</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="success">Branch: Ready</Badge>
            <Badge variant="info">Role: Ready</Badge>
            <Badge variant="warning">Threshold: Pending review</Badge>
          </div>
        </PlPanel>

        <PlPanel>
          <h3 className="text-sm font-semibold">Thêm nhà cung cấp</h3>
          <div className="mt-3 grid gap-2">
            <Input className="bg-card/80 backdrop-blur-sm" placeholder="Tên NCC" />
            <NativeSelect className="w-full">
              <option>Loại dịch vụ</option>
              <option>Khách sạn</option>
              <option>Xe du lịch</option>
              <option>Nhà hàng</option>
            </NativeSelect>
            <Input className="bg-card/80 backdrop-blur-sm" placeholder="Liên hệ" />
            <Button size="sm">Thêm NCC</Button>
          </div>
        </PlPanel>
      </section>

      <PlTableShell>
        <div className="p-3 pb-0">
          <h3 className="font-semibold">Danh sách cấu hình chi nhánh</h3>
        </div>
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
              <TableCell>HCM</TableCell>
              <TableCell>OPS + MANAGER</TableCell>
              <TableCell>20,000,000</TableCell>
              <TableCell><Badge variant="success">Hoạt động</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Hà Nội</TableCell>
              <TableCell>OPS + MANAGER</TableCell>
              <TableCell>25,000,000</TableCell>
              <TableCell><Badge variant="success">Hoạt động</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PlTableShell>

      <PlPanel>
        <h3 className="font-semibold">UAT checklist vận hành</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Button variant={uatChecks.tourFlow ? "default" : "secondary"} onClick={() => toggleCheck("tourFlow")}>
            Tour flow end-to-end
          </Button>
          <Button variant={uatChecks.paymentFlow ? "default" : "secondary"} onClick={() => toggleCheck("paymentFlow")}>
            Payment flow end-to-end
          </Button>
          <Button variant={uatChecks.settlementFlow ? "default" : "secondary"} onClick={() => toggleCheck("settlementFlow")}>
            Settlement/refund end-to-end
          </Button>
          <Button variant={uatChecks.permissionCheck ? "default" : "secondary"} onClick={() => toggleCheck("permissionCheck")}>
            Permission matrix check
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tiến độ: {Object.values(uatChecks).filter(Boolean).length}/4 hạng mục hoàn tất.
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Input
            value={uatNotes.tourFlow}
            onChange={(e) => setUatNotes((prev) => ({ ...prev, tourFlow: e.target.value }))}
            placeholder="Bằng chứng Tour flow (screenshot/log)"
          />
          <Input
            value={uatNotes.paymentFlow}
            onChange={(e) => setUatNotes((prev) => ({ ...prev, paymentFlow: e.target.value }))}
            placeholder="Bằng chứng Payment flow"
          />
          <Input
            value={uatNotes.settlementFlow}
            onChange={(e) => setUatNotes((prev) => ({ ...prev, settlementFlow: e.target.value }))}
            placeholder="Bằng chứng Settlement flow"
          />
          <Input
            value={uatNotes.permissionCheck}
            onChange={(e) => setUatNotes((prev) => ({ ...prev, permissionCheck: e.target.value }))}
            placeholder="Bằng chứng Permission check"
          />
        </div>
      </PlPanel>
    </div>
  );
}
