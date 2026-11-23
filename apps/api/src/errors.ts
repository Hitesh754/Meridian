import type { ProblemDetails } from '@meridian/contracts';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function createProblemDetails(params: {
  status: number;
  title: string;
  detail: string;
  type?: string;
  instance?: string;
  code?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
}): ProblemDetails {
  return {
    type: params.type ?? `https://api.meridian.app/v1/problems/${params.status}`,
    title: params.title,
    status: params.status,
    detail: params.detail,
    instance: params.instance,
    code: params.code,
    invalidParams: params.invalidParams,
  };
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const status =
    error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;

  // Log internal error with pino, but never leak stack trace to client
  request.log.error(
    {
      err: {
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
    },
    `Request error occurred: ${error.message}`,
  );

  const problem: ProblemDetails = {
    type: `https://api.meridian.app/v1/problems/${status}`,
    title: status >= 500 ? 'Internal Server Error' : error.name || 'Request Error',
    status,
    detail:
      status >= 500 ? 'An unexpected error occurred while processing the request.' : error.message,
    instance: request.raw.url,
    code: error.code || 'INTERNAL_ERROR',
  };

  reply.status(status).header('content-type', 'application/problem+json').send(problem);
}
