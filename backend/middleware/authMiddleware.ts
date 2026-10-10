import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  adminId: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Please log in.",
    });
  }

  if (!secret) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      message: "Authentication is not configured",
    });
  }

  const token = authorization.slice(7);

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      typeof decoded.adminId !== "string"
    ) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    (req as Request & { adminId: string }).adminId =
      decoded.adminId;

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
};