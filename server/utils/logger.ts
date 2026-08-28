export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'http';

interface LogContext {
  [key: string]: unknown;
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// ANSI colors for Next.js-style console output
const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

function getStatusColor(status: number): string {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.white;
}

export const logger = {
  info(message: string, context?: LogContext) {
    const timestamp = formatTimestamp();
    if (isProduction && process.env.LOG_FORMAT === 'json') {
      console.log(JSON.stringify({ level: 'info', timestamp, message, ...context }));
    } else {
      console.log(
        `${colors.dim}[${timestamp}]${colors.reset} ${colors.cyan}▲ [Next/API]${colors.reset} ${colors.green}INFO:${colors.reset} ${message}`,
        context ? colors.dim + JSON.stringify(context) + colors.reset : ''
      );
    }
  },

  warn(message: string, context?: LogContext) {
    const timestamp = formatTimestamp();
    if (isProduction && process.env.LOG_FORMAT === 'json') {
      console.warn(JSON.stringify({ level: 'warn', timestamp, message, ...context }));
    } else {
      console.warn(
        `${colors.dim}[${timestamp}]${colors.reset} ${colors.cyan}▲ [Next/API]${colors.reset} ${colors.yellow}WARN:${colors.reset} ${message}`,
        context ? colors.dim + JSON.stringify(context) + colors.reset : ''
      );
    }
  },

  error(message: string, error?: unknown, context?: LogContext) {
    const timestamp = formatTimestamp();
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : error;

    if (isProduction && process.env.LOG_FORMAT === 'json') {
      console.error(
        JSON.stringify({
          level: 'error',
          timestamp,
          message,
          error: errorDetails,
          ...context,
        })
      );
    } else {
      console.error(
        `${colors.dim}[${timestamp}]${colors.reset} ${colors.cyan}▲ [Next/API]${colors.reset} ${colors.red}ERROR:${colors.reset} ${message}`,
        errorDetails ? '\n' + colors.red + JSON.stringify(errorDetails, null, 2) + colors.reset : '',
        context ? colors.dim + JSON.stringify(context) + colors.reset : ''
      );
    }
  },

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'production' && !process.env.DEBUG) return;
    const timestamp = formatTimestamp();
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.gray}▲ [Debug]${colors.reset} ${message}`,
      context ? JSON.stringify(context) : ''
    );
  },

  http(method: string, path: string, status: number, durationMs: number, context?: LogContext) {
    const timestamp = formatTimestamp();
    const statusColor = getStatusColor(status);
    const methodFormatted = `${colors.bold}${method.padEnd(6)}${colors.reset}`;
    const statusFormatted = `${statusColor}${status}${colors.reset}`;
    const durationFormatted = `${colors.dim}${durationMs.toFixed(1)}ms${colors.reset}`;

    if (isProduction && process.env.LOG_FORMAT === 'json') {
      console.log(
        JSON.stringify({
          level: 'http',
          timestamp,
          method,
          path,
          status,
          durationMs,
          ...context,
        })
      );
    } else {
      console.log(
        `${colors.dim}[${timestamp}]${colors.reset} ${colors.cyan}▲ Next.js /api${colors.reset} ${methodFormatted} ${path} ${statusFormatted} in ${durationFormatted}`
      );
    }
  },
};
