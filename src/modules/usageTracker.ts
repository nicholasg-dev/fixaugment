import * as vscode from 'vscode';
import * as logger from './logger';
import * as configManager from './configManager';

// Usage tracking state
let requestCounter = 0;
let sessionStartTime = Date.now();
let limitBypassActive = false;

// Status bar items
let usageCounterStatusBarItem: vscode.StatusBarItem;
let limitBypassStatusBarItem: vscode.StatusBarItem;

/**
 * Initialize the usage tracker
 * @param context The extension context
 */
export function initUsageTracker(context: vscode.ExtensionContext): void {
  // Load saved state
  requestCounter = context.globalState.get('requestCounter', 0);
  sessionStartTime = context.globalState.get('sessionStartTime', Date.now());
  limitBypassActive = context.globalState.get('limitBypassActive', false);
  
  // Create limit bypass status bar item
  limitBypassStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  updateLimitBypassStatusBar();
  limitBypassStatusBarItem.show();
  context.subscriptions.push(limitBypassStatusBarItem);
  
  // Create usage counter status bar item
  usageCounterStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
  updateUsageCounterStatusBar();
  usageCounterStatusBarItem.show();
  context.subscriptions.push(usageCounterStatusBarItem);
  
  // Check if we need to auto-reset the counter
  checkAndResetCounter(context);
  
  logger.debug('Usage tracker initialized');
}

/**
 * Get the current request count
 * @returns The current request count
 */
export function getRequestCount(): number {
  return requestCounter;
}

/**
 * Get the session start time
 * @returns The session start time
 */
export function getSessionStartTime(): number {
  return sessionStartTime;
}

/**
 * Check if limit bypass is active
 * @returns True if limit bypass is active, false otherwise
 */
export function isLimitBypassActive(): boolean {
  return limitBypassActive;
}

/**
 * Increment the usage counter
 * @param context The extension context
 */
export function incrementUsageCounter(context: vscode.ExtensionContext): void {
  requestCounter++;
  context.globalState.update('requestCounter', requestCounter);
  
  updateUsageCounterStatusBar();
  
  // Check if we need to auto-reset
  checkAndResetCounter(context);
  
  logger.debug(`Usage counter incremented to ${requestCounter}`);
}

/**
 * Reset the usage counter
 * @param context The extension context
 */
export function resetUsageCounter(context: vscode.ExtensionContext): void {
  requestCounter = 0;
  sessionStartTime = Date.now();
  
  context.globalState.update('requestCounter', requestCounter);
  context.globalState.update('sessionStartTime', sessionStartTime);
  
  updateUsageCounterStatusBar();
  
  logger.info('Usage counter reset');
}

/**
 * Toggle the limit bypass feature
 * @param context The extension context
 */
export function toggleLimitBypass(context: vscode.ExtensionContext): void {
  limitBypassActive = !limitBypassActive;
  context.globalState.update('limitBypassActive', limitBypassActive);
  
  updateLimitBypassStatusBar();
  
  logger.info(`Limit bypass ${limitBypassActive ? 'activated' : 'deactivated'}`);
}

/**
 * Update the limit bypass status bar item
 */
function updateLimitBypassStatusBar(): void {
  if (limitBypassActive) {
    limitBypassStatusBarItem.text = '$(zap) Limits: BYPASS (Future)';
    limitBypassStatusBarItem.tooltip = 'Augment limit bypass is active (for future use). Click to toggle.';
    limitBypassStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else {
    limitBypassStatusBarItem.text = '$(zap) Limits: NORMAL';
    limitBypassStatusBarItem.tooltip = 'Augment limit bypass is inactive (for future use). Click to toggle.';
    limitBypassStatusBarItem.backgroundColor = undefined;
  }
  limitBypassStatusBarItem.command = 'fix-augment-windsurf.toggleLimitBypass';
}

/**
 * Update the usage counter status bar item
 */
function updateUsageCounterStatusBar(): void {
  const config = configManager.getConfig();
  const maxRequests = config.maxRequestsPerSession;
  
  usageCounterStatusBarItem.text = `$(graph) Usage: ${requestCounter}/${maxRequests}`;
  usageCounterStatusBarItem.tooltip = 'Augment usage counter. Click to reset.';
  usageCounterStatusBarItem.command = 'fix-augment-windsurf.resetUsageCounter';
  
  // Change color when approaching the limit
  if (requestCounter >= maxRequests * 0.8) {
    usageCounterStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  } else if (requestCounter >= maxRequests * 0.5) {
    usageCounterStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else {
    usageCounterStatusBarItem.backgroundColor = undefined;
  }
}

/**
 * Check if we need to auto-reset the counter based on max requests or time
 * @param context The extension context
 */
function checkAndResetCounter(context: vscode.ExtensionContext): void {
  const config = configManager.getConfig();
  const maxRequests = config.maxRequestsPerSession;
  
  // Auto-reset if we've reached the limit and bypass is active
  if (requestCounter >= maxRequests && limitBypassActive) {
    resetUsageCounter(context);
    logger.info('Usage counter auto-reset (limit reached)');
    vscode.window.showInformationMessage('Augment usage counter auto-reset (limit reached)');
  }
  
  // Also check time-based reset (24 hours)
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (Date.now() - sessionStartTime > oneDayMs) {
    resetUsageCounter(context);
    logger.info('Usage counter auto-reset (24 hours elapsed)');
  }
}

/**
 * Add a delay between requests if limit bypass is active
 * @returns A promise that resolves after the delay
 */
export async function addRequestDelay(): Promise<void> {
  if (limitBypassActive) {
    const config = configManager.getConfig();
    const requestDelay = config.requestDelay;
    
    // Add a small delay to avoid rate limiting
    if (requestDelay > 0) {
      logger.debug(`Adding request delay of ${requestDelay}ms`);
      return new Promise(resolve => setTimeout(resolve, requestDelay));
    }
  }
  
  return Promise.resolve();
}

/**
 * Dispose the usage tracker resources
 */
export function dispose(): void {
  if (usageCounterStatusBarItem) {
    usageCounterStatusBarItem.dispose();
  }
  if (limitBypassStatusBarItem) {
    limitBypassStatusBarItem.dispose();
  }
}
