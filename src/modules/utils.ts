import * as vscode from 'vscode';
import * as logger from './logger';

/**
 * Interface for the Augment extension API
 */
export interface AugmentExtension {
  sendInput?: (input: string) => Promise<string>;
  formatOutput?: (output: string) => string;
}

/**
 * Check if the Augment extension is installed and available
 * @returns The Augment extension API or undefined if not found
 */
export async function checkForAugmentExtension(): Promise<AugmentExtension | undefined> {
  try {
    const augmentExtension = vscode.extensions.getExtension('augment.vscode-augment');
    
    if (augmentExtension) {
      logger.info('Augment extension detected');
      return augmentExtension.exports as AugmentExtension;
    } else {
      logger.warn('Augment extension not found');
      return undefined;
    }
  } catch (error) {
    logger.error('Error checking for Augment extension', error);
    return undefined;
  }
}

/**
 * Show an information message with a progress indicator
 * @param title The title of the progress indicator
 * @param task The task to execute
 * @returns The result of the task
 */
export async function withProgress<T>(title: string, task: (progress: vscode.Progress<{ message?: string }>, token: vscode.CancellationToken) => Promise<T>): Promise<T> {
  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title,
    cancellable: true
  }, task);
}

/**
 * Get the selected text from the active editor
 * @returns The selected text or undefined if no selection
 */
export function getSelectedText(): string | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    logger.debug('No active editor found');
    return undefined;
  }
  
  const selection = editor.selection;
  if (selection.isEmpty) {
    logger.debug('No text selected');
    return undefined;
  }
  
  return editor.document.getText(selection);
}

/**
 * Replace the selected text in the active editor
 * @param text The text to replace the selection with
 * @returns True if the replacement was successful, false otherwise
 */
export async function replaceSelectedText(text: string): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    logger.debug('No active editor found');
    return false;
  }
  
  const selection = editor.selection;
  if (selection.isEmpty) {
    logger.debug('No text selected');
    return false;
  }
  
  try {
    await editor.edit(editBuilder => {
      editBuilder.replace(selection, text);
    });
    return true;
  } catch (error) {
    logger.error('Error replacing selected text', error);
    return false;
  }
}

/**
 * Check if text appears to be an Augment response
 * @param text The text to check
 * @returns True if the text appears to be an Augment response, false otherwise
 */
export function isAugmentResponse(text: string): boolean {
  return text.includes('function_results') ||
         (text.includes('```') && text.includes('augment')) ||
         text.includes('<augment_code_snippet');
}

/**
 * Create a status bar item
 * @param alignment The alignment of the status bar item
 * @param priority The priority of the status bar item
 * @param text The text to display
 * @param tooltip The tooltip to display
 * @param command The command to execute when clicked
 * @returns The created status bar item
 */
export function createStatusBarItem(
  alignment: vscode.StatusBarAlignment,
  priority: number,
  text: string,
  tooltip: string,
  command?: string
): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(alignment, priority);
  item.text = text;
  item.tooltip = tooltip;
  if (command) {
    item.command = command;
  }
  return item;
}
