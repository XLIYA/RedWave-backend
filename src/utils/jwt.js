// src/utils/jwt.js
import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // در محیط توسعه اجازه می‌دیم ستارت بخوره اما هشدار بدیم
    if (process.env.NODE_ENV !== 'production') {
      return 'dev_only_secret_change_me';
    }
    throw new Error('JWT_SECRET is required in production');
  }
  return secret;
}

export function signJwt(payload, opts = {}) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '7d', ...opts });
}

export function verifyJwt(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}
