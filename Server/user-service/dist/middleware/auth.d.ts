import { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    id: number;
    email: string;
}
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export declare function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function generateToken(user: {
    id: number;
    email: string;
}): string;
export declare function requireActiveUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
