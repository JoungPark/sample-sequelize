declare namespace Express {
  export interface Request {
    userId?: string;
    tenantId?: string;
    role?: string;
    tier?: string;
  }
}