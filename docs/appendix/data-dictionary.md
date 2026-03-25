# Appendix B - Data dictionary

## 1) Branch

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| code | string | yes | HCM, CT, HN, CM, QB |
| name | string | yes | Ten chi nhanh |
| is_active | boolean | yes | Trang thai su dung |

## 2) User

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| branch_id | uuid | yes | FK Branch |
| full_name | string | yes | Ho ten |
| role | enum | yes | OPS, MANAGER, ADMIN |
| email | string | yes | Unique |
| is_active | boolean | yes | Trang thai |

## 3) Tour

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| tour_code | string | yes | Unique |
| tour_name | string | yes | Ten tour |
| tour_type | enum | yes | DOMESTIC, INTERNATIONAL, INBOUND |
| customer_type | enum | yes | RETAIL, GROUP |
| branch_id | uuid | yes | FK Branch |
| departure_date | date | yes | Ngay khoi hanh |
| end_date | date | yes | Ngay ket thuc |
| pax_total | int | yes | Tong so khach |
| operator_id | uuid | no | FK User |
| status | enum | yes | Theo state machine |
| expected_revenue | decimal(18,2) | no | Doanh thu du kien |
| expected_cost | decimal(18,2) | no | Chi phi du kien |
| expected_profit | decimal(18,2) | no | Loi nhuan du kien |
| created_at | datetime | yes | UTC |
| updated_at | datetime | yes | UTC |

## 4) TourStatusHistory

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| tour_id | uuid | yes | FK Tour |
| from_status | enum | yes | Trang thai cu |
| to_status | enum | yes | Trang thai moi |
| action_name | string | yes | Ten action |
| actor_id | uuid | yes | FK User |
| note | text | no | Ghi chu |
| created_at | datetime | yes | UTC |

## 5) ServiceBooking

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| booking_code | string | yes | Ma phieu DV |
| tour_id | uuid | yes | FK Tour |
| service_type | enum | yes | FLIGHT, HOTEL, CAR, RESTAURANT, VISA, TEAMBUILDING, GUIDE |
| supplier_id | uuid | yes | FK Supplier |
| usage_date | date | yes | Ngay su dung |
| quantity | decimal(10,2) | yes | SL/Don vi |
| unit_price | decimal(18,2) | yes | Don gia |
| total_amount | decimal(18,2) | yes | Thanh tien |
| deposit_amount | decimal(18,2) | no | Tien coc |
| paid_amount | decimal(18,2) | yes | Tong da thanh toan |
| payment_status | enum | yes | UNPAID, DEPOSITED, PAID_FULL |
| due_date | date | no | Han thanh toan |
| booking_status | enum | yes | DRAFT, SENT, PARTIAL_CONFIRMED, CONFIRMED, CLOSED, CANCELLED |
| operator_id | uuid | yes | FK User |
| created_at | datetime | yes | UTC |
| updated_at | datetime | yes | UTC |

## 6) Supplier

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| supplier_code | string | yes | Unique |
| supplier_name | string | yes | Ten NCC |
| service_type | enum | yes | Loai dich vu chinh |
| contact_name | string | no | Dau moi |
| contact_phone | string | no | SDT |
| tax_code | string | no | MST |
| is_active | boolean | yes | Trang thai |

## 7) PaymentTransaction

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| service_booking_id | uuid | yes | FK ServiceBooking |
| amount | decimal(18,2) | yes | Co the am neu hoan/can tru |
| transaction_type | enum | yes | PAY, REFUND, OFFSET |
| payment_date | date | yes | Ngay giao dich |
| proof_attachment_id | uuid | no | FK Attachment |
| created_by | uuid | yes | FK User |
| created_at | datetime | yes | UTC |

## 8) Settlement

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| tour_id | uuid | yes | FK Tour |
| guide_id | uuid | yes | FK User/Guide |
| advance_amount | decimal(18,2) | yes | Tam ung |
| actual_cost | decimal(18,2) | yes | Chi phi thuc te |
| variance_amount | decimal(18,2) | yes | Chenh lech |
| status | enum | yes | SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID_OUT |
| reviewed_by | uuid | no | FK User |
| reviewed_at | datetime | no | UTC |

## 9) Refund

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| settlement_id | uuid | yes | FK Settlement |
| amount | decimal(18,2) | yes | So tien hoan/thu |
| direction | enum | yes | TO_GUIDE, FROM_GUIDE |
| status | enum | yes | PENDING, COMPLETED, FAILED |
| paid_at | datetime | no | UTC |
| note | text | no | Ghi chu |

## 10) Attachment

| Field | Type | Required | Note |
|---|---|---|---|
| id | uuid | yes | PK |
| entity_type | enum | yes | TOUR, SERVICE_BOOKING, SETTLEMENT, PAYMENT |
| entity_id | uuid | yes | ID ban ghi lien quan |
| file_name | string | yes | Ten file |
| file_url | string | yes | Duong dan luu tru |
| mime_type | string | yes | Kieu file |
| uploaded_by | uuid | yes | FK User |
| uploaded_at | datetime | yes | UTC |
