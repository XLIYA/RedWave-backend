// src/utils/normalize.js
export const normalize = (s = '') => s.toString().toLowerCase().replace(/[^a-z0-9]+/g, '');
