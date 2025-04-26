import * as marked from 'marked';
import * as logger from './logger';
import * as configManager from './configManager';
import * as syntaxHighlighter from './syntaxHighlighter';

/**
 * Format Augment output with enhanced formatting and syntax highlighting
 * @param text The text to format
 * @returns The formatted text
 */
export function formatOutput(text: string): string {
  try {
    // Get the configuration for output format
    const config = configManager.getConfig();
    
    if (config.outputFormat === 'default') {
      // Don't modify the output
      return text;
    }
    
    // Process code blocks with syntax highlighting
    let enhanced = text;
    
    if (config.outputFormat === 'markdown' || config.outputFormat === 'enhanced') {
      // Improve code block formatting
      enhanced = enhanced.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, language, code) => {
        // Add proper language tag if missing
        if (!language) {
          // Try to detect the language
          const detectedLang = syntaxHighlighter.detectLanguage(code);
          language = detectedLang || '';
        }
        
        // Format the code block
        return `\`\`\`${language}\n${code.trim()}\n\`\`\``;
      });
      
      // Improve function call formatting
      enhanced = enhanced.replace(/<fnr>(([\s\S]*?))<\/function_results>/g, (match, content) => {
        return `<details>\n<summary>Function Results</summary>\n\n\`\`\`\n${content.trim()}\n\`\`\`\n</details>\n`;
      });
      
      // Add proper XML tags for code snippets
      enhanced = enhanced.replace(/<augment_code_snippet([^>]*)>([\s\S]*?)<\/augment_code_snippet>/g, (match, attrs, content) => {
        // Extract path and mode attributes
        const pathMatch = attrs.match(/path="([^"]*)"/i);
        const modeMatch = attrs.match(/mode="([^"]*)"/i);
        
        const path = pathMatch ? pathMatch[1] : 'unknown';
        const mode = modeMatch ? modeMatch[1] : 'EXCERPT';
        
        // Format the code snippet with proper attributes
        return `<augment_code_snippet path="${path}" mode="${mode}">\n${content.trim()}\n</augment_code_snippet>`;
      });
    }
    
    if (config.outputFormat === 'html') {
      // Convert markdown to HTML
      enhanced = marked.parse(enhanced) as string;
      
      // Add syntax highlighting
      enhanced = enhanced.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, language, code) => {
        try {
          // Use the correct highlight.js API for version 11.x
          const highlighted = syntaxHighlighter.highlightCode(code, language);
          return `<pre><code class="language-${language} hljs">${highlighted}</code></pre>`;
        } catch (e) {
          logger.error('Highlight.js error', e);
          return match;
        }
      });
      
      // Add theme CSS
      const themeCSS = syntaxHighlighter.getThemeCSS(config.syntaxTheme);
      if (themeCSS) {
        enhanced = `<style>${themeCSS}</style>\n${enhanced}`;
      }
    }
    
    logger.debug(`Formatted output from ${text.length} to ${enhanced.length} characters`);
    return enhanced;
  } catch (error) {
    logger.error('Error formatting output', error);
    return text; // Return original text if formatting fails
  }
}

/**
 * Optimize code blocks in text
 * @param text The text containing code blocks
 * @returns The text with optimized code blocks
 */
export function optimizeCodeBlocks(text: string): string {
  try {
    // Find and optimize code blocks
    const optimized = text.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, language, code) => {
      // Add proper language tag if missing
      if (!language) {
        // Try to detect the language
        const detectedLang = syntaxHighlighter.detectLanguage(code);
        language = detectedLang || '';
      }
      
      // Format the code block
      const formattedCode = code.trim()
        .replace(/^\s+/gm, (spaces: string) => spaces.replace(/\s/g, ' ')) // Replace tabs with spaces
        .replace(/\n{3,}/g, '\n\n'); // Remove excessive blank lines
      
      return `\`\`\`${language}\n${formattedCode}\n\`\`\``;
    });
    
    logger.debug(`Optimized code blocks in text of length ${text.length}`);
    return optimized;
  } catch (error) {
    logger.error('Error optimizing code blocks', error);
    return text; // Return original text if optimization fails
  }
}
