import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: string,
  statusCode: number = 500,
  code: string = 'ERROR'
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  });
};
