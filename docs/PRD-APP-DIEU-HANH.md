# PRD - APP DIEU HANH TOUR (Back-office Dieu hanh)

## 1. Tong quan san pham

- Ten san pham: App Dieu hanh tour.
- Muc tieu: So hoa toan bo quy trinh dieu hanh tour, theo doi tai chinh dich vu va quyet toan HDV theo chi nhanh.
- Nhom nguoi dung:
  - NV Dieu hanh theo chi nhanh.
  - Giam doc/Quan ly xem tong quan he thong.
- Pham vi chuc nang:
  - Dashboard, List tour, Tour detail stepper, List dich vu thanh toan, List phieu dat dich vu, quyet toan/hoan tien.

## 2. KPI san pham

- Ty le tour dung han xu ly theo step >= 95%.
- Ty le dich vu qua han thanh toan <= 3%.
- Thoi gian trung binh tu `Cho nhan` den `Dang du toan` <= 4h lam viec.
- Ty le ho so ban giao HDV day du ngay lan dau >= 98%.
- Ty le sai lech quyet toan sau khi dong tour <= 1%.

## 3. Vai tro va phan quyen

### NV Dieu hanh

- Xem du lieu trong chi nhanh duoc phan quyen.
- Thuc hien action trang thai tour.
- Tao/cap nhat phieu DV, cap nhat thanh toan DV.
- Tao de nghi quyet toan/hoan tien.

### Giam doc/Quan ly

- Xem tong quan theo cong ty/chi nhanh.
- Xem bang tong hop theo NVĐH.
- Duyet ngoai le chi phi, duyet quyet toan khi vuot nguong.

## 4. IA va dieu huong

- Chon chi nhanh (luu theo user profile + session).
- Menu:
  - Tong quan.
  - Tour trong nuoc (le/doan).
  - Tour quoc te (le/doan).
  - Tour inbound (le/doan).
  - Dich vu khac (ve may bay, khach san, xe, nha hang, visa-ho chieu, team-gala-event).

## 5. Module specs

## 5.1 Dashboard NV Dieu hanh

### Muc tieu

Cho phep NVĐH theo doi so luong tour, loi nhuan, trang thai tour, thanh toan DV, phieu DV trong mot man hinh.

### Thanh phan UI

- Cards tong quan:
  - Tong so tour (le/doan) theo bo loc thoi gian.
  - Tong loi nhuan le.
  - Tong loi nhuan doan.
- Charts:
  - So tour le vs doan.
  - Loi nhuan le vs doan.
- 10 cards trang thai tour: click vao card mo list da loc san.
- 3 cards thanh toan DV: Chua TT, Da coc, TT du.
- 2 cards phieu DV: Chua xac nhan, Da xac nhan.

### Bo loc

- Chi nhanh, tu ngay-den ngay, loai tour, loai khach, NVĐH.

### States can thiet

- Loading skeleton.
- Empty state co CTA quay ve list tour.
- Error state co thao tac thu lai.

## 5.2 Dashboard Giam doc

- Charts:
  - So tour theo trong nuoc/quoc te/inbound x le/doan.
  - Loi nhuan theo trong nuoc/quoc te/inbound x le/doan.
- Bang tong hop theo NVĐH:
  - So tour theo trang thai.
  - Theo doi thanh toan DV.
  - Theo doi phieu DV.
- Bo loc: chi nhanh, khoang thoi gian, loai tour/khach.

## 5.3 List Tour

### Bo loc

- Chi nhanh, loai tour, loai khach, thoi gian.
- Trang thai tour.
- TT DV, phieu DV.
- NVĐH.
- Search ma/tour.

### Cot du lieu

- Ma tour, ten tour, loai tour, loai khach, chi nhanh.
- Ngay khoi hanh, ngay ket thuc, so ngay.
- So khach, NV dieu hanh.
- Trang thai tour, TT DV, phieu DV.
- Doanh thu du kien, chi phi du kien, LN du kien.
- Actions: Xem chi tiet, Mo step hien tai.

### Actions nang cao

- Bulk assign NVĐH (co quyen).
- Export excel theo bo loc.
- Luu bo loc yeu thich.

## 5.4 Tour detail stepper 9 buoc

### Header thong tin chung

- Ma tour, ten, loai tour, loai khach, chi nhanh, ngay KH-KT, so khach, NVĐH.

### Noi dung theo buoc

- Dang du toan: lich trinh, chiet tinh, don hang, danh sach khach, bang du toan.
- Dang ban giao HDV: ho so 9 file va trang thai cho HDV nhan.
- HDV da nhan: checklist xac nhan.
- Dang dien ra: phat sinh, cap nhat su kien.
- Ket thuc -> quyet toan -> hoan tien.

### Rule UX

- Chi hien action hop le theo trang thai hien tai.
- Hien canh bao khi thieu tai lieu bat buoc.
- Luu lich su action va nguoi thao tac.

## 5.5 List Dich vu (thanh toan DV)

### Bo loc

- Loai DV, TT thanh toan, phieu DV, thoi gian, NCC, NVĐH, tour.

### Cot du lieu

- Ma phieu DV, ma tour, ten tour, loai DV, NCC, ngay su dung.
- SL/don vi, don gia, thanh tien, tien coc, con lai.
- TT thanh toan, han TT, qua han.
- Actions: Cap nhat TT, dinh chung tu.

### Rule hien thi

- Badge do cho qua han.
- Badge vang cho da coc.
- Badge xanh cho thanh toan du.

## 5.6 List Phieu dat DV

- Cot: ma phieu, ngay tao, ma tour, ten tour, loai DV, NCC, ngay su dung, tong GT, trang thai, file xac nhan.
- Actions:
  - Upload file xac nhan.
  - Cap nhat trang thai.
  - Mo lien ket tour.

## 5.7 Form tao/sua du toan va phieu DV

- Form du toan:
  - Header tour + danh muc chi phi.
  - Rule validate tong chi phi, gia tri am, vuot tran.
  - Tinh toan LN du kien realtime.
- Form phieu DV:
  - Chon NCC, ngay su dung, so luong, don gia, tong GT.
  - Upload tai lieu xac nhan.
  - Validate han TT va dieu kien dat coc.

## 6. Business rules (tom tat)

- State machine tour va action matrix: xem [state-machine.md](./appendix/state-machine.md).
- Rule thanh toan DV:
  - `paid=0` -> Chua thanh toan.
  - `0<paid<total` -> Da coc.
  - `paid>=total` -> Da thanh toan du.
  - Qua han khi `today > due_date` va chua thanh toan du.
- Rule phieu DV: can file xac nhan de ve `CONFIRMED`.

## 7. Data va API

- Data dictionary: xem [data-dictionary.md](./appendix/data-dictionary.md).
- API contract: xem [api-contract.md](./appendix/api-contract.md).

## 8. Bao mat, audit, compliance

- RBAC theo vai tro + chi nhanh.
- Audit log bat buoc cho:
  - Chuyen trang thai tour.
  - Cap nhat TT DV.
  - Duyet quyet toan/hoan tien.
- Soft delete cho chung tu va phieu DV, khong xoa cung.
- Masking thong tin nhay cam theo role.

## 9. Reporting va analytics

- Dashboard KPI theo ngay/tuan/thang.
- Drill-down tu card/chart xuong danh sach chi tiet.
- Bao cao so sanh chi nhanh.

## 10. UAT va van hanh

- UAT checklist: xem [uat-checklist.md](./appendix/uat-checklist.md).
- Go-live checklist gom:
  - Seed danh muc chi nhanh, vai tro, NCC.
  - Cau hinh phan quyen va nguong phe duyet.
  - Chay smoke test 3 luong: tour, DV, quyet toan.
