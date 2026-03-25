"use client";

import { useMemo, useState } from "react";
import { PlPanel, PlTableShell } from "@/components/preline/layout-primitives";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BookingNewPage() {
  const [supplier, setSupplier] = useState("Bangkok Stay");
  const [quantity, setQuantity] = useState(10);
  const [unitPrice, setUnitPrice] = useState(2500000);
  const [deposit, setDeposit] = useState(0);
  const [dueDate, setDueDate] = useState("2026-03-31");
  const [proof, setProof] = useState("");

  const total = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);
  const invalidDeposit = deposit < 0 || deposit > total;
  const missingDueDate = dueDate.trim() === "";

  return (
    <div className="grid gap-4">
      <PlPanel>
        <h2 className="text-lg font-semibold">Form tạo phiếu dịch vụ</h2>
        <p className="text-sm text-muted-foreground">Điền theo 4 bước: Thông tin dịch vụ, thanh toán, tài liệu, xác nhận.</p>
      </PlPanel>
      <PlTableShell>
        <div className="space-y-4 p-3">
          <section className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
            <h3 className="md:col-span-2 text-sm font-semibold">1) Thông tin dịch vụ</h3>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Nhà cung cấp</p>
              <NativeSelect value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                <option>Bangkok Stay</option>
                <option>Ẩm Thực Sông Nước</option>
                <option>An Bình Transport</option>
              </NativeSelect>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Hạn thanh toán</p>
              <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Số lượng</p>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="VD: 10" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Đơn giá (VND)</p>
              <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} placeholder="VD: 2500000" />
            </div>
          </section>

          <section className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
            <h3 className="md:col-span-2 text-sm font-semibold">2) Thanh toán và tài liệu</h3>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tiền cọc (VND)</p>
              <Input type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} placeholder="VD: 5000000" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mã file xác nhận (nếu có)</p>
              <Input value={proof} onChange={(e) => setProof(e.target.value)} placeholder="VD: FILE-CNF-001" />
            </div>
          </section>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <Badge variant="info">NCC: {supplier}</Badge>
          <Badge variant="info">Tổng giá trị: {total.toLocaleString("vi-VN")} VND</Badge>
          <Badge variant={invalidDeposit ? "danger" : "success"}>
            {invalidDeposit ? "Lỗi: tiền cọc phải từ 0 đến tổng giá trị" : "Tiền cọc hợp lệ"}
          </Badge>
          <Badge variant={missingDueDate ? "danger" : "success"}>{missingDueDate ? "Lỗi: thiếu hạn thanh toán" : "Hạn thanh toán hợp lệ"}</Badge>
          <Badge variant={proof ? "success" : "warning"}>{proof ? "Đã đính file" : "Chưa đính file"}</Badge>
        </div>
        <div className="flex items-center justify-between p-3">
          <p className="text-xs text-muted-foreground">Mẹo: nếu cần xác nhận NCC ngay, hãy nhập mã file trước khi tạo phiếu.</p>
          <Button disabled={invalidDeposit || missingDueDate}>Tạo phiếu DV</Button>
        </div>
      </PlTableShell>
    </div>
  );
}
