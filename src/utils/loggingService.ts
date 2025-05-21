/**
 * Logging service to capture and store console logs
 * This service overrides the default console methods to capture logs
 * and makes them available for viewing in the admin dashboard
 */

// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error'
}

// Define log entry interface
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any[];
  stack?: string;
}

// Maximum number of logs to keep in memory
const MAX_LOGS = 1000;

// Class to manage logs
class LoggingService {
  private logs: LogEntry[] = [];
  private originalConsole: Record<LogLevel, Function> = {
    [LogLevel.DEBUG]: console.debug,
    [LogLevel.INFO]: console.info,
    [LogLevel.LOG]: console.log,
    [LogLevel.WARN]: console.warn,
    [LogLevel.ERROR]: console.error
  };
  private isInitialized = false;

  constructor() {
    // Load logs from localStorage if available
    this.loadLogs();
  }

  /**
   * Initialize the logging service by overriding console methods
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Override console methods
    console.debug = (...args: any[]) => this.captureLog(LogLevel.DEBUG, args);
    console.info = (...args: any[]) => this.captureLog(LogLevel.INFO, args);
    console.log = (...args: any[]) => this.captureLog(LogLevel.LOG, args);
    console.warn = (...args: any[]) => this.captureLog(LogLevel.WARN, args);
    console.error = (...args: any[]) => this.captureLog(LogLevel.ERROR, args);

    // Add window error handler
    window.addEventListener('error', (event) => {
      this.captureLog(LogLevel.ERROR, [event.message], event.error?.stack);
    });

    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureLog(LogLevel.ERROR, ['Unhandled Promise Rejection:', event.reason],
        event.reason?.stack || new Error().stack);
    });

    this.isInitialized = true;
    this.captureLog(LogLevel.INFO, ['Logging service initialized']);
  }

  /**
   * Restore original console methods
   */
  restore(): void {
    if (!this.isInitialized) return;

    console.debug = this.originalConsole[LogLevel.DEBUG] as Console['debug'];
    console.info = this.originalConsole[LogLevel.INFO] as Console['info'];
    console.log = this.originalConsole[LogLevel.LOG] as Console['log'];
    console.warn = this.originalConsole[LogLevel.WARN] as Console['warn'];
    console.error = this.originalConsole[LogLevel.ERROR] as Console['error'];

    this.isInitialized = false;
    this.originalConsole[LogLevel.INFO]('Logging service restored');
  }

  /**
   * Capture a log entry
   */
  private captureLog(level: LogLevel, args: any[], stack?: string): void {
    // Call original console method
    this.originalConsole[level](...args);

    // Create log entry
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message: this.formatLogMessage(args),
      data: this.cloneData(args),
      stack: stack || (level === LogLevel.ERROR ? new Error().stack : undefined)
    };

    // Add to logs
    this.logs.unshift(logEntry);

    // Trim logs if needed
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(0, MAX_LOGS);
    }

    // Save logs to localStorage
    this.saveLogs();
  }

  /**
   * Format log message for display
   */
  private formatLogMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message;
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
  }

  /**
   * Clone data to prevent circular references
   */
  private cloneData(data: any[]): any[] {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      // If circular reference, return simplified version
      return data.map(item => {
        if (typeof item === 'object' && item !== null) {
          return `[${item.constructor.name}]`;
        }
        return item;
      });
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogs(): void {
    try {
      // Only save the last 100 logs to localStorage to prevent exceeding storage limits
      const logsToSave = this.logs.slice(0, 100);
      localStorage.setItem('appLogs', JSON.stringify(logsToSave));
    } catch (e) {
      // If localStorage is full, clear it and try again
      try {
        localStorage.removeItem('appLogs');
        localStorage.setItem('appLogs', JSON.stringify(this.logs.slice(0, 50)));
      } catch (e) {
        // If still failing, just ignore
      }
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogs(): void {
    try {
      const savedLogs = localStorage.getItem('appLogs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (e) {
      // If error loading logs, clear localStorage
      localStorage.removeItem('appLogs');
    }
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('appLogs');
    this.captureLog(LogLevel.INFO, ['Logs cleared']);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs filtered by search term
   */
  searchLogs(term: string): LogEntry[] {
    const lowerTerm = term.toLowerCase();
    return this.logs.filter(log =>
      log.message.toLowerCase().includes(lowerTerm) ||
      (log.stack && log.stack.toLowerCase().includes(lowerTerm))
    );
  }

  /**
   * Get logs within a time range
   */
  getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this.logs.filter(log =>
      log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Import logs from JSON
   */
  importLogs(json: string): void {
    try {
      const importedLogs = JSON.parse(json) as LogEntry[];
      this.logs = importedLogs;
      this.saveLogs();
      this.captureLog(LogLevel.INFO, ['Logs imported successfully']);
    } catch (e) {
      this.captureLog(LogLevel.ERROR, ['Failed to import logs:', e]);
    }
  }
}

// Create singleton instance
export const loggingService = new LoggingService();

// Export default instance
export default loggingService;
