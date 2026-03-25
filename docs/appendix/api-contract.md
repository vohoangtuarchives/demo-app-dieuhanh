# Appendix C - API contract

Quy uoc chung:

- Base path: `/api/v1`
- Auth: Bearer JWT.
- Timezone: luu UTC, hien thi local `Asia/Ho_Chi_Minh`.
- Pagination: `page`, `pageSize`, `total`.
- Error model:
  - `code`: string
  - `message`: string
  - `details`: object|null

## 1) Dashboard APIs

### GET `/dashboards/operator/summary`

Query:

- `branchId` (required)
- `fromDate`, `toDate` (required)
- `tourType` (optional)
- `customerType` (optional)

Response:

```json
{
  "tourCountRetail": 120,
  "tourCountGroup": 88,
  "profitRetail": 320000000,
  "profitGroup": 510000000
}
```

### GET `/dashboards/operator/status-cards`

Response gom 10 trang thai tour + 3 thanh toan DV + 2 phieu DV.

### GET `/dashboards/manager/overview`

Tra ve so lieu chart theo:

- `tourType` x `customerType`
- loi nhuan theo cung chieu
- bang tong hop theo `operatorId`

## 2) Tour APIs

### GET `/tours`

Filters:

- `branchId`, `tourType`, `customerType`
- `status`, `paymentStatus`, `bookingStatus`
- `operatorId`, `keyword`
- `fromDate`, `toDate`

### GET `/tours/{tourId}`

Tra ve thong tin header + current step + bo du lieu theo step.

### POST `/tours/{tourId}/actions/accept`

- Role: OPS
- Idempotent key header: `Idempotency-Key`

### POST `/tours/{tourId}/actions/start-budgeting`
### POST `/tours/{tourId}/actions/finalize-budget`
### POST `/tours/{tourId}/actions/handover-guide`
### POST `/tours/{tourId}/actions/mark-on-tour`
### POST `/tours/{tourId}/actions/finish-tour`

Trang thai hop le duoc kiem tra o backend theo state machine.

## 3) Service booking APIs

### GET `/service-bookings`

Filter:

- `serviceType`, `paymentStatus`, `bookingStatus`
- `branchId`, `operatorId`, `supplierId`, `tourId`
- `fromDate`, `toDate`, `overdueOnly`

### POST `/service-bookings`

Tao phieu DV moi.

### PATCH `/service-bookings/{id}`

Cap nhat thong tin phieu DV khi con o `DRAFT`/`SENT`.

### POST `/service-bookings/{id}/confirm`

Body:

```json
{
  "status": "CONFIRMED",
  "attachmentId": "uuid"
}
```

Validation:

- `attachmentId` bat buoc neu `status=CONFIRMED`.

### POST `/service-bookings/{id}/payments`

Body:

```json
{
  "amount": 12000000,
  "transactionType": "PAY",
  "paymentDate": "2026-03-24",
  "proofAttachmentId": "uuid"
}
```

Sau khi ghi giao dich, backend tinh lai `paidAmount`, `paymentStatus`, `overdue`.

## 4) Settlement/Refund APIs

### POST `/tours/{tourId}/settlements`

Tao ho so quyet toan HDV.

### POST `/settlements/{id}/submit`
### POST `/settlements/{id}/approve`
### POST `/settlements/{id}/reject`

- `approve/reject` yeu cau role MANAGER hoac OPS co quyen dac biet.

### POST `/settlements/{id}/refunds`

Body:

```json
{
  "amount": 3500000,
  "direction": "TO_GUIDE",
  "note": "Hoan phan tam ung thieu"
}
```

### POST `/refunds/{id}/complete`

Hoan tat giao dich hoan/thu, cap nhat trang thai tour neu du dieu kien.

## 5) Attachment APIs

### POST `/attachments/presign`

Tra ve URL upload tam thoi.

### POST `/attachments/commit`

Gan file vao entity.

## 6) Error codes de xuat

- `TOUR_INVALID_TRANSITION`
- `PERMISSION_DENIED`
- `BOOKING_CONFIRM_ATTACHMENT_REQUIRED`
- `PAYMENT_AMOUNT_INVALID`
- `SETTLEMENT_REVIEW_REQUIRED`
- `CONCURRENT_UPDATE_CONFLICT`
