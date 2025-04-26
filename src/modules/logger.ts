import * as vscode from 'vscode';

/**
 * Log levels for the extension
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Current log level
 */
let currentLogLevel = LogLevel.INFO;

/**
 * Output channel for logging
 */
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Initialize the logger
 * @param context The extension context
 * @param level The initial log level
 */
export function initLogger(context: vscode.ExtensionContext, level: LogLevel = LogLevel.INFO): void {
  currentLogLevel = level;
  outputChannel = vscode.window.createOutputChannel('Fix Augment Windsurf');
  context.subscriptions.push(outputChannel);
}

/**
 * Set the current log level
 * @param level The new log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
  log(LogLevel.INFO, `Log level set to ${LogLevel[level]}`);
}

/**
 * Log a message at the specified level
 * @param level The log level
 * @param message The message to log
 */
export function log(level: LogLevel, message: string): void {
  if (level < currentLogLevel) {
    return;
  }

  if (!outputChannel) {
    // Fallback to console if output channel is not initialized
    console.log(`[${LogLevel[level]}] ${message}`);
    return;
  }

  const timestamp = new Date().toISOString();
  outputChannel.appendLine(`[${timestamp}] [${LogLevel[level]}] ${message}`);
}

/**
 * Log a debug message
 * @param message The message to log
 */
export function debug(message: string): void {
  log(LogLevel.DEBUG, message);
}

/**
 * Log an info message
 * @param message The message to log
 */
export function info(message: string): void {
  log(LogLevel.INFO, message);
}

/**
 * Log a warning message
 * @param message The message to log
 */
export function warn(message: string): void {
  log(LogLevel.WARN, message);
}

/**
 * Log an error message
 * @param message The message to log
 * @param error Optional error object
 */
export function error(message: string, error?: unknown): void {
  if (error instanceof Error) {
    log(LogLevel.ERROR, `${message}: ${error.message}\n${error.stack}`);
  } else {
    log(LogLevel.ERROR, `${message}: ${error}`);
  }
}

/**
 * Show the log output channel
 */
export function showOutputChannel(): void {
  outputChannel?.show();
}

/**
 * Dispose the logger resources
 */
export function dispose(): void {
  outputChannel?.dispose();
  outputChannel = undefined;
}
