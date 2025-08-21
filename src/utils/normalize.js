// src/utils/normalize.js
// نگه‌داشتن حروف و ارقام همهٔ زبان‌ها + حذف فاصله/نشانه‌ها
export const normalize = (s = '') =>
  s
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
