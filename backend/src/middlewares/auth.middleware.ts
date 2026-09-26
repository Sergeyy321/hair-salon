import { Request, Response, NextFunction } from 'express';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

const jwksUri = process.env.LOGTO_JWKS_URI ?? 'https://przl72.logto.app/oidc/jwks';
const issuer = process.env.LOGTO_ISSUER ?? 'https://przl72.logto.app/oidc';

const client = jwksRsa({
  jwksUri,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header: JwtHeader, callback: SigningKeyCallback): void {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string | undefined;
    [key: string]: unknown;
  } | undefined;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED_MISSING_TOKEN' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'UNAUTHORIZED_EMPTY_TOKEN' });
    return;
  }

  jwt.verify(token, getKey, { issuer }, (err, decoded) => {
    if (err || !decoded || typeof decoded === 'string') {
      res.status(401).json({ error: 'UNAUTHORIZED_INVALID_TOKEN' });
      return;
    }
    req.user = decoded;
    next();
  });
};