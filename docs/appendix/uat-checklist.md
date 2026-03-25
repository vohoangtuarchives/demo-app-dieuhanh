# Appendix D - UAT checklist va go-live readiness

## 1) Nguyen tac UAT

- Chay tren du lieu gan thuc te, toi thieu 3 chi nhanh.
- Moi testcase co actor ro rang (OPS, MANAGER).
- Luu ket qua pass/fail + bang chung (screenshot/log).

## 2) Test scenarios end-to-end

## A. Tour flow

1. Tao tour moi -> vao `Cho nhan`.
2. NVĐH nhan tour -> `Da nhan`.
3. Bat dau va chot du toan -> `Dang ban giao HDV`.
4. HDV nhan tour -> `HDV da nhan`.
5. Tour khoi hanh -> `Dang dien ra`.
6. Ket thuc tour -> `Ket thuc cho quyet toan`.
7. Nop va duyet quyet toan -> `HDV da quyet toan`.
8. Hoan/thu tien -> `Thanh cong`.

Tieu chi pass:

- Moi transition dung role.
- Khong bo qua buoc bat buoc.
- Lich su trang thai ghi du actor + timestamp.

## B. Thanh toan dich vu

1. Tao phieu DV voi `paid=0` -> `UNPAID`.
2. Ghi giao dich coc -> `DEPOSITED`.
3. Thanh toan du -> `PAID_FULL`.
4. Kiem tra qua han khi den han ma chua du tien.
5. Dinh chung tu va doi soat tong tien.

Tieu chi pass:

- Rule trang thai thanh toan tinh dung.
- Badge qua han hien dung.
- Tong so dashboard khop list chi tiet.

## C. Phieu DV va xac nhan NCC

1. Tao phieu o `DRAFT`.
2. Gui NCC -> `SENT`.
3. Thu xac nhan 1 phan -> `PARTIAL_CONFIRMED`.
4. Upload file xac nhan -> `CONFIRMED`.

Tieu chi pass:

- Khong cho `CONFIRMED` neu thieu file.
- Trang thai list va detail dong bo.

## D. Quyet toan/hoan tien

1. Tao settlement.
2. Nop duyet.
3. Phe duyet boi manager.
4. Tao hoan/thu tien.
5. Complete giao dich.

Tieu chi pass:

- Dung nguong phe duyet.
- Tour chi dong khi tai chinh da xong.

## 3) Permission test

- OPS chi thay du lieu chi nhanh minh.
- MANAGER thay tong hop theo quyen.
- User khong quyen khong duoc goi action API.

## 4) Regression checklist UI

- Filter giu trang thai khi quay lai man hinh.
- Pagination/sort khong mat bo loc.
- Empty/loading/error hien thi dung.

## 5) KPI acceptance

- So lieu card = so lieu chart = tong tu list theo cung bo loc.
- So lieu cap nhat duoi 5 phut (neu co cache) hoac realtime theo thiet ke.

## 6) Go-live checklist

- Danh muc branch/user/role da seed.
- Danh muc supplier da map loai dich vu.
- Nguong phe duyet quyet toan da cau hinh.
- Mau chung tu va kho luu tru file san sang.
- Backup/restore da test.
- Monitoring + alert overdue da bat.
- Runbook xu ly su co da ban giao.
