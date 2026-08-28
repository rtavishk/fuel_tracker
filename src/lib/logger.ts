// Client-side structured logger styled like Next.js telemetry

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'action';

const badgeStyle = 'background: #0070f3; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;';
const successStyle = 'background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;';
const warnStyle = 'background: #f59e0b; color: black; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;';
const errorStyle = 'background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;';

export const clientLogger = {
  info(message: string, ...args: unknown[]) {
    console.log(`%c▲ Next/App%c ${message}`, badgeStyle, 'color: #94a3b8;', ...args);
  },

  success(message: string, ...args: unknown[]) {
    console.log(`%c▲ Next/Success%c ${message}`, successStyle, 'color: #34d399;', ...args);
  },

  warn(message: string, ...args: unknown[]) {
    console.warn(`%c▲ Next/Warn%c ${message}`, warnStyle, 'color: #fbbf24;', ...args);
  },

  error(message: string, ...args: unknown[]) {
    console.error(`%c▲ Next/Error%c ${message}`, errorStyle, 'color: #f87171;', ...args);
  },

  action(actionName: string, payload?: unknown) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `%c▲ Next/Action%c [${timestamp}] ${actionName}`,
      badgeStyle,
      'color: #38bdf8; font-weight: 500;',
      payload || ''
    );
  },
};
