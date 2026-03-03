# Laporan Situasi (Lightweight Web App)

## Struktur
- `src/reports/situasi30m/`
  - `schema.js`: field/default/options
  - `validation.js`: validasi form
  - `formatters.js`: formatter Telegram + Google Sheets
  - `page.js`: renderer UI + submit flow
- `src/shared/`: komponen UI 공용, 시간/키 유틸
- `src/integrations/`: Telegram/Sheets HTTP 호출 분리

## API 계약 (frontend -> backend)
- `POST /api/telegram/send` body: `{ message }`
- `POST /api/sheets/append` body: `{ row }`
- 공통 헤더: `X-Idempotency-Key`

## 원칙 적용
- 시간 필드는 시스템 시간 read-only
- 재시도 시 localStorage pending payload + 동일 idempotency key 사용
- Telegram 성공 후 Sheets 백업 저장
