import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export function generateAccessToken(payload: { id: number }) {
  return jwt.sign(payload, SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: { id: number; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(
  token: string,
): { id: number; email: string } | null {
  try {
    return jwt.verify(token, SECRET) as { id: number; email: string };
  } catch {
    return null;
  }
}
