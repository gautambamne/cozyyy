import { ZodError } from 'zod';

export const zodErrorFormatter = (error: ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  error.issues.forEach((err: any) => {
    const field = err.path.join('.');
    formattedErrors[field] = err.message;
  });
  return formattedErrors;
};