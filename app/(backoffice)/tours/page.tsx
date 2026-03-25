"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { GlassTableContainer, GlassStat } from "@/components/glass/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";

type TourRow = {
  code: string;
  name: string;
  type: string;
  customerType: string;
  branch: string;
  dateRange: string;
  pax: number;
  operator: string;
  status: string;
  payment: string;
  booking: string;
  revenue: number;
  cost: number;
  profit: number;
};

const tourRows: TourRow[] = [
  {
    code: "TN-HCM-24031",
    name: "Miền Tây 3N2Đ",
    type: "Trong nước",
    customerType: "Đoàn",
    branch: "HCM",
    dateRange: "24/03 - 26/03",
    pax: 35,
    operator: "Nguyễn Văn A",
    status: "Đang diễn ra",
    payment: "Đã cọc",
    booking: "Còn chưa xác nhận",
    revenue: 420000000,
    cost: 358000000,
    profit: 62000000,
  },
  {
    code: "QT-HN-24012",
    name: "Thái Lan 4N3Đ",
    type: "Quốc tế",
    customerType: "Lẻ",
    branch: "Hà Nội",
    dateRange: "28/03 - 31/03",
    pax: 19,
    operator: "Trần Thị B",
    status: "Đang dự toán",
    payment: "Chưa thanh toán",
    booking: "Chưa xác nhận",
    revenue: 510000000,
    cost: 441000000,
    profit: 69000000,
  },
  {
    code: "IB-CT-24008",
    name: "Mekong Discovery",
    type: "Inbound",
    customerType: "Đoàn",
    branch: "Cần Thơ",
    dateRange: "02/04 - 05/04",
    pax: 22,
    operator: "Lê Quốc C",
    status: "Bàn giao HDV",
    payment: "Đã thanh toán đủ",
    booking: "Đã xác nhận",
    revenue: 625000000,
    cost: 507000000,
    profit: 118000000,
  },
];

export default function ToursPage() {
  const { filters, updateFilter, setManyFilters, resetFilters, hasActiveFilters } = useQueryFilters({
    branch: "Tất cả chi nhánh",
    tourType: "Tất cả loại tour",
    customerType: "Tất cả loại khách",
    status: "Tất cả trạng thái",
    page: "1",
    sort: "startDate_desc",
    search: "",
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      branch: params.get("branch") ?? "Tất cả chi nhánh",
      tourType: params.get("tourType") ?? "Tất cả loại tour",
      customerType: params.get("customerType") ?? "Tất cả loại khách",
      status: params.get("status") ?? "Tất cả trạng thái",
      page: params.get("page") ?? "1",
      sort: params.get("sort") ?? "startDate_desc",
      search: params.get("search") ?? "",
    });
  }, [setManyFilters]);
  useEffect(() => {
    const query = new URLSearchParams({
      branch: filters.branch,
      tourType: filters.tourType,
      customerType: filters.customerType,
      status: filters.status,
      page: filters.page,
      sort: filters.sort,
      search: filters.search,
    });
    window.history.replaceState({}, "", `/tours?${query.toString()}`);
  }, [filters]);
  const filteredRows = useMemo(
    () =>
      tourRows.filter(
        (row) =>
          (filters.branch === "Tất cả chi nhánh" || row.branch === filters.branch) &&
          (filters.tourType === "Tất cả loại tour" || row.type === filters.tourType) &&
          (filters.customerType === "Tất cả loại khách" || row.customerType === filters.customerType) &&
          (filters.status === "Tất cả trạng thái" || row.status === filters.status) &&
          (filters.search.trim() === "" || row.code.toLowerCase().includes(filters.search.toLowerCase()) || row.name.toLowerCase().includes(filters.search.toLowerCase()))
      ),
    [filters]
  );

  const totals = useMemo(() => {
    const revenue = filteredRows.reduce((sum, row) => sum + row.revenue, 0);
    const cost = filteredRows.reduce((sum, row) => sum + row.cost, 0);
    return { totalTours: filteredRows.length, revenue, cost, profit: revenue - cost };
  }, [filteredRows]);

  return (
    <>
      <UnifiedFilterBar
        title="List Tour"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        rightActions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Export
            </Button>
            <Button size="sm">Bulk assign NVĐH</Button>
          </div>
        }
      >
        <NativeSelect className="w-full" value={filters.branch} onChange={(e) => updateFilter("branch", e.target.value)}>
          <option>Tất cả chi nhánh</option>
          <option>HCM</option>
          <option>Hà Nội</option>
          <option>Cần Thơ</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.tourType} onChange={(e) => updateFilter("tourType", e.target.value)}>
          <option>Tất cả loại tour</option>
          <option>Trong nước</option>
          <option>Quốc tế</option>
          <option>Inbound</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.customerType} onChange={(e) => updateFilter("customerType", e.target.value)}>
          <option>Tất cả loại khách</option>
          <option>Lẻ</option>
          <option>Đoàn</option>
        </NativeSelect>
        <Input className="bg-card/80 backdrop-blur-sm" placeholder="Tìm mã/tên tour" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <NativeSelect className="w-full" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option>Tất cả trạng thái</option>
          <option>Đang diễn ra</option>
          <option>Đang dự toán</option>
          <option>Bàn giao HDV</option>
        </NativeSelect>
      </UnifiedFilterBar>

      <section className="grid gap-3 md:grid-cols-4">
        <GlassStat title="Tổng tour" value={totals.totalTours} />
        <GlassStat title="Doanh thu dự kiến" value={totals.revenue.toLocaleString("vi-VN")} />
        <GlassStat title="Chi phí dự kiến" value={totals.cost.toLocaleString("vi-VN")} />
        <GlassStat title="Lợi nhuận dự kiến" value={totals.profit.toLocaleString("vi-VN")} />
      </section>

      <GlassTableContainer>
        <Table className="min-w-[1600px]">
          <TableHeader>
            <TableRow className="table-head-sticky">
              <TableHead>Mã tour</TableHead>
              <TableHead>Tên tour</TableHead>
              <TableHead>Loại tour</TableHead>
              <TableHead>Loại khách</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Ngày KH-KT</TableHead>
              <TableHead>Số khách</TableHead>
              <TableHead>NVĐH</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>TT DV</TableHead>
              <TableHead>Phiếu DV</TableHead>
              <TableHead>Doanh thu</TableHead>
              <TableHead>Chi phí</TableHead>
              <TableHead>LN</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.code}>
                <TableCell className="font-medium">{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.customerType}</TableCell>
                <TableCell>{row.branch}</TableCell>
                <TableCell>{row.dateRange}</TableCell>
                <TableCell>{row.pax}</TableCell>
                <TableCell>{row.operator}</TableCell>
                <TableCell><Badge variant="info">{row.status}</Badge></TableCell>
                <TableCell>
                  <Badge variant={row.payment === "Chưa thanh toán" ? "danger" : row.payment === "Đã cọc" ? "warning" : "success"}>{row.payment}</Badge>
                </TableCell>
                <TableCell>{row.booking}</TableCell>
                <TableCell>{row.revenue.toLocaleString("vi-VN")}</TableCell>
                <TableCell>{row.cost.toLocaleString("vi-VN")}</TableCell>
                <TableCell className="font-semibold">{row.profit.toLocaleString("vi-VN")}</TableCell>
                <TableCell className="space-x-2">
                  <Link href={`/tours/${row.code}`} className="text-primary">
                    Xem chi tiết
                  </Link>
                  <Button size="sm" variant="default">
                    Mở step hiện tại
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassTableContainer>
    </>
  );
}
