import hljs from 'highlight.js';
import * as logger from './logger';

/**
 * Detect the programming language of a code snippet
 * @param code The code snippet to analyze
 * @returns The detected language or undefined if detection fails
 */
export function detectLanguage(code: string): string | undefined {
  try {
    // Try to use highlight.js auto detection first
    try {
      const result = hljs.highlightAuto(code);
      if (result.language) {
        return result.language;
      }
    } catch (error) {
      logger.debug(`Auto language detection failed: ${error}`);
    }

    // Fallback to pattern-based detection
    if (code.includes('function') && (code.includes('{') || code.includes('=>'))) {
      return 'javascript';
    }
    if (code.includes('import') && code.includes('from') && code.includes('const')) {
      return 'typescript';
    }
    if (code.includes('def ') && code.includes(':')) {
      return 'python';
    }
    if (code.includes('class') && code.includes('{') && code.includes('public')) {
      return 'java';
    }
    if (code.includes('<html') || code.includes('<!DOCTYPE')) {
      return 'html';
    }
    if (code.includes('package ') && code.includes('import ') && code.includes('func ')) {
      return 'go';
    }
    if (code.includes('#include') && (code.includes('<stdio.h>') || code.includes('<iostream>'))) {
      return code.includes('cout') ? 'cpp' : 'c';
    }

    // Additional language patterns
    if (code.includes('<?php')) {
      return 'php';
    }
    if (code.includes('using namespace') || code.includes('template<')) {
      return 'cpp';
    }
    if (code.includes('SELECT') && code.includes('FROM') && (code.includes('WHERE') || code.includes('JOIN'))) {
      return 'sql';
    }
    if (code.includes('<!DOCTYPE html>') || (code.includes('<') && code.includes('</') && code.includes('>'))) {
      return 'html';
    }
    if (code.includes('import React') || (code.includes('import') && code.includes('from "react"'))) {
      return 'jsx';
    }
    if (code.includes('fn ') && code.includes('->') && code.includes('mut')) {
      return 'rust';
    }

    // Default to plaintext if we can't detect
    return undefined;
  } catch (error) {
    logger.error('Error detecting language', error);
    return undefined;
  }
}

/**
 * Highlight code with syntax highlighting
 * @param code The code to highlight
 * @param language The language of the code (optional)
 * @returns The highlighted code HTML
 */
export function highlightCode(code: string, language?: string): string {
  try {
    if (!language) {
      language = detectLanguage(code);
    }

    if (language) {
      try {
        return hljs.highlight(code, { language }).value;
      } catch (error) {
        logger.debug(`Highlight failed for language ${language}: ${error}`);
        // Try auto-highlight as fallback
        return hljs.highlightAuto(code).value;
      }
    } else {
      // No language specified, use auto-detection
      return hljs.highlightAuto(code).value;
    }
  } catch (error) {
    logger.error('Error highlighting code', error);
    return code; // Return original code if highlighting fails
  }
}

/**
 * Get CSS for the specified theme
 * @param theme The theme name
 * @returns The CSS for the theme
 */
export function getThemeCSS(theme: string): string {
  switch (theme.toLowerCase()) {
    case 'github':
      return `
        .hljs {
          color: #24292e;
          background: #f6f8fa;
        }
        .hljs-comment, .hljs-quote { color: #6a737d; }
        .hljs-keyword, .hljs-selector-tag { color: #d73a49; }
        .hljs-literal, .hljs-number, .hljs-tag .hljs-attr { color: #005cc5; }
        .hljs-attr, .hljs-template-variable, .hljs-variable { color: #e36209; }
        .hljs-doctag, .hljs-string { color: #032f62; }
        .hljs-section, .hljs-selector-id, .hljs-title { color: #6f42c1; }
        .hljs-meta { color: #005cc5; }
        .hljs-regexp, .hljs-selector-attr, .hljs-selector-pseudo { color: #22863a; }
        .hljs-attribute, .hljs-name, .hljs-type { color: #005cc5; }
        .hljs-bullet, .hljs-link, .hljs-symbol { color: #032f62; }
        .hljs-built_in, .hljs-builtin-name { color: #005cc5; }
        .hljs-class .hljs-title, .hljs-title.class_ { color: #6f42c1; }
      `;
    case 'monokai':
      return `
        .hljs {
          color: #f8f8f2;
          background: #272822;
        }
        .hljs-comment, .hljs-quote { color: #75715e; }
        .hljs-keyword, .hljs-selector-tag, .hljs-tag { color: #f92672; }
        .hljs-literal, .hljs-number, .hljs-template-variable, .hljs-variable { color: #ae81ff; }
        .hljs-doctag, .hljs-string { color: #e6db74; }
        .hljs-section, .hljs-selector-id, .hljs-title { color: #a6e22e; }
        .hljs-subst { color: #f8f8f2; }
        .hljs-regexp, .hljs-selector-attr, .hljs-selector-pseudo { color: #e6db74; }
        .hljs-attribute, .hljs-attr, .hljs-name, .hljs-type { color: #a6e22e; }
        .hljs-bullet, .hljs-link, .hljs-symbol { color: #66d9ef; }
        .hljs-built_in, .hljs-builtin-name { color: #66d9ef; }
        .hljs-class .hljs-title, .hljs-title.class_ { color: #a6e22e; }
      `;
    case 'dracula':
      return `
        .hljs {
          color: #f8f8f2;
          background: #282a36;
        }
        .hljs-comment, .hljs-quote { color: #6272a4; }
        .hljs-keyword, .hljs-selector-tag, .hljs-tag { color: #ff79c6; }
        .hljs-literal, .hljs-number, .hljs-template-variable, .hljs-variable { color: #bd93f9; }
        .hljs-doctag, .hljs-string { color: #f1fa8c; }
        .hljs-section, .hljs-selector-id, .hljs-title { color: #50fa7b; }
        .hljs-subst { color: #f8f8f2; }
        .hljs-regexp, .hljs-selector-attr, .hljs-selector-pseudo { color: #f1fa8c; }
        .hljs-attribute, .hljs-attr, .hljs-name, .hljs-type { color: #50fa7b; }
        .hljs-bullet, .hljs-link, .hljs-symbol { color: #8be9fd; }
        .hljs-built_in, .hljs-builtin-name { color: #8be9fd; }
        .hljs-class .hljs-title, .hljs-title.class_ { color: #50fa7b; }
      `;
    case 'nord':
      return `
        .hljs {
          color: #d8dee9;
          background: #2e3440;
        }
        .hljs-comment, .hljs-quote { color: #4c566a; }
        .hljs-keyword, .hljs-selector-tag, .hljs-tag { color: #81a1c1; }
        .hljs-literal, .hljs-number, .hljs-template-variable, .hljs-variable { color: #b48ead; }
        .hljs-doctag, .hljs-string { color: #a3be8c; }
        .hljs-section, .hljs-selector-id, .hljs-title { color: #8fbcbb; }
        .hljs-subst { color: #d8dee9; }
        .hljs-regexp, .hljs-selector-attr, .hljs-selector-pseudo { color: #a3be8c; }
        .hljs-attribute, .hljs-attr, .hljs-name, .hljs-type { color: #8fbcbb; }
        .hljs-bullet, .hljs-link, .hljs-symbol { color: #88c0d0; }
        .hljs-built_in, .hljs-builtin-name { color: #88c0d0; }
        .hljs-class .hljs-title, .hljs-title.class_ { color: #8fbcbb; }
      `;
    case 'default':
    default:
      return ''; // Use default highlight.js styling
  }
}
