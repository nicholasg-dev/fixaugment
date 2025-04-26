import * as vscode from 'vscode';

/**
 * Configuration interface for the extension
 */
export interface FixAugmentConfig {
  enabled: boolean;
  maxInputSize: number;
  outputFormat: 'default' | 'enhanced' | 'markdown' | 'html';
  autoFormatOutput: boolean;
  syntaxTheme: 'default' | 'github' | 'monokai' | 'dracula' | 'nord';
  smartChunking: boolean;
  preserveCodeBlocks: boolean;
  apiKey: string;
  bypassLimits: boolean;
  requestDelay: number;
  maxRequestsPerSession: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: FixAugmentConfig = {
  enabled: true,
  maxInputSize: 10000,
  outputFormat: 'enhanced',
  autoFormatOutput: true,
  syntaxTheme: 'github',
  smartChunking: true,
  preserveCodeBlocks: true,
  apiKey: '',
  bypassLimits: false,
  requestDelay: 500,
  maxRequestsPerSession: 50
};

/**
 * Get the extension configuration
 * @returns The extension configuration
 */
export function getConfig(): FixAugmentConfig {
  const config = vscode.workspace.getConfiguration('fixAugmentWindsurf');
  
  return {
    enabled: config.get<boolean>('enabled') ?? DEFAULT_CONFIG.enabled,
    maxInputSize: config.get<number>('maxInputSize') ?? DEFAULT_CONFIG.maxInputSize,
    outputFormat: config.get<'default' | 'enhanced' | 'markdown' | 'html'>('outputFormat') ?? DEFAULT_CONFIG.outputFormat,
    autoFormatOutput: config.get<boolean>('autoFormatOutput') ?? DEFAULT_CONFIG.autoFormatOutput,
    syntaxTheme: config.get<'default' | 'github' | 'monokai' | 'dracula' | 'nord'>('syntaxTheme') ?? DEFAULT_CONFIG.syntaxTheme,
    smartChunking: config.get<boolean>('smartChunking') ?? DEFAULT_CONFIG.smartChunking,
    preserveCodeBlocks: config.get<boolean>('preserveCodeBlocks') ?? DEFAULT_CONFIG.preserveCodeBlocks,
    apiKey: config.get<string>('apiKey') ?? DEFAULT_CONFIG.apiKey,
    bypassLimits: config.get<boolean>('bypassLimits') ?? DEFAULT_CONFIG.bypassLimits,
    requestDelay: config.get<number>('requestDelay') ?? DEFAULT_CONFIG.requestDelay,
    maxRequestsPerSession: config.get<number>('maxRequestsPerSession') ?? DEFAULT_CONFIG.maxRequestsPerSession
  };
}

/**
 * Update a specific configuration value
 * @param key The configuration key to update
 * @param value The new value
 * @param target The configuration target (User, Workspace, etc.)
 */
export async function updateConfig<K extends keyof FixAugmentConfig>(
  key: K, 
  value: FixAugmentConfig[K], 
  target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
): Promise<void> {
  const config = vscode.workspace.getConfiguration('fixAugmentWindsurf');
  await config.update(key, value, target);
}

/**
 * Validate the configuration
 * @param config The configuration to validate
 * @returns True if the configuration is valid, false otherwise
 */
export function validateConfig(config: FixAugmentConfig): boolean {
  // Validate maxInputSize
  if (config.maxInputSize <= 0) {
    vscode.window.showErrorMessage('maxInputSize must be greater than 0');
    return false;
  }

  // Validate requestDelay
  if (config.requestDelay < 0) {
    vscode.window.showErrorMessage('requestDelay must be greater than or equal to 0');
    return false;
  }

  // Validate maxRequestsPerSession
  if (config.maxRequestsPerSession <= 0) {
    vscode.window.showErrorMessage('maxRequestsPerSession must be greater than 0');
    return false;
  }

  return true;
}
