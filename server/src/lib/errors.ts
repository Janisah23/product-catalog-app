export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message = 'Resource not found') => new HttpError(404, 'NOT_FOUND', message);
export const unauthorized = (message = 'Authentication required') => new HttpError(401, 'UNAUTHORIZED', message);
export const conflict = (code: string, message: string) => new HttpError(409, code, message);
