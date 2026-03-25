# PRD vs UI Gap Matrix

## Bảng đối chiếu theo module

| Module | Theo PRD | Hiện trạng UI | Mức độ | Thiếu chính |
|---|---|---|---|---|
| Dashboard NVĐH | KPI + chart + 10 trạng thái + DV + phiếu + drill-down | Đã có đầy đủ khối chính | Trung bình | Chưa có skeleton/error chuẩn; chưa bind API thật |
| Dashboard GĐ | Chart tổng hợp + 3 bảng theo NVĐH | Đã có bảng tổng hợp + filter cơ bản | Trung bình | Chưa có chart đa chiều theo thời gian/chi nhánh |
| List Tour | Bộ lọc đầy đủ + cột tài chính + bulk action | Đã có bảng và filter chính | Trung bình | Chưa có saved filter, URL state, sort/pagination chuẩn |
| Tour Detail Stepper | Stepper + tabs theo trạng thái + checklist + audit | Đã có stepper và checklist cơ bản | Thiếu | Chưa có audit timeline, validate dữ liệu bắt buộc trước transition |
| List Dịch vụ | Rule TT DV + overdue + cập nhật chứng từ | Đã có cột và badge trạng thái | Trung bình | Chưa có dialog nhập payment transaction chuẩn |
| List Phiếu DV | Lifecycle xác nhận + file bắt buộc | Đã có upload/confirm giả lập | Trung bình | Chưa có flow reject/partial chi tiết + kiểm tra file theo action |
| Settlement/Refund | Duyệt theo ngưỡng + hoàn/thu tiền + link trạng thái tour | Đã có bảng và action cơ bản | Thiếu | Chưa có reject reason, ngưỡng duyệt, cập nhật trạng thái tour tự động |
| Forms P3 | Form dự toán + form phiếu DV có validate | Chưa có form riêng | Thiếu | Cần bổ sung form module đầy đủ |
| Alert/Reporting | Alert center + KPI tuần/tháng + so sánh chi nhánh | Chưa có trung tâm cảnh báo | Thiếu | Cần module cảnh báo + trang KPI nâng cao |

## Đối chiếu theo vai trò

| Vai trò | Chức năng yêu cầu | Hiện trạng | Thiếu |
|---|---|---|---|
| NV Điều hành | Nhận tour, dự toán, bàn giao, theo dõi DV, quyết toán | Có UI thao tác cơ bản | Thiếu guard dữ liệu bắt buộc + audit timeline |
| Giám đốc/Quản lý | Dashboard tổng hợp + duyệt ngoại lệ tài chính | Có dashboard + bảng | Thiếu rule duyệt ngưỡng và báo cáo sâu |

## Kết luận ưu tiên bổ sung

1. Chuẩn hóa `filter/query/drill-down` dùng chung.
2. Bổ sung `workflow guard + audit timeline`.
3. Nâng `services/bookings/settlement` theo lifecycle đầy đủ.
4. Tích hợp API contract và states loading/error/empty chuẩn.
5. Bổ sung alert center + KPI reporting + checklist UAT trong UI.
