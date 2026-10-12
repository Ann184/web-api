import type { Request, Response, NextFunction } from 'express';

function logger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    console.log(
      `[${new Date().toLocaleString()}] ` +
      `${req.method} ${req.originalUrl} ` +
      `${res.statusCode} ${duration}ms`,
    );
  });

  next();
}

export default logger;