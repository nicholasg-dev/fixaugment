import * as vscode from 'vscode';
import * as logger from './logger';
import * as configManager from './configManager';

/**
 * Optimize input text for Augment
 * @param text The text to optimize
 * @returns The optimized text
 */
export function optimizeInput(text: string): string {
  try {
    // Remove excessive whitespace
    let optimized = text.replace(/\s+/g, ' ');

    // Trim the text
    optimized = optimized.trim();

    // Add clear instructions for better results
    if (!optimized.toLowerCase().includes('please') && !optimized.toLowerCase().includes('could you')) {
      optimized = 'Please ' + optimized.charAt(0).toLowerCase() + optimized.slice(1);
    }

    // Add a period at the end if missing
    if (!optimized.endsWith('.') && !optimized.endsWith('?') && !optimized.endsWith('!')) {
      optimized += '.';
    }

    logger.debug(`Optimized input from ${text.length} to ${optimized.length} characters`);
    return optimized;
  } catch (error) {
    logger.error('Error optimizing input', error);
    return text; // Return original text if optimization fails
  }
}

/**
 * Split text into chunks of a specified size
 * @param text The text to chunk
 * @param maxSize The maximum size of each chunk
 * @returns An array of text chunks
 */
export function chunkText(text: string, maxSize: number): string[] {
  try {
    const chunks: string[] = [];

    // Try to split at paragraph boundaries first
    const paragraphs = text.split(/\n\s*\n/);

    let currentChunk = '';

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed the max size, start a new chunk
      if (currentChunk.length + paragraph.length > maxSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Add to the current chunk with a paragraph separator if needed
        if (currentChunk.length > 0) {
          currentChunk += '\n\n' + paragraph;
        } else {
          currentChunk = paragraph;
        }
      }
    }

    // Add the last chunk if it has content
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // If we still have chunks that are too large, split them further
    const result: string[] = [];

    for (const chunk of chunks) {
      if (chunk.length <= maxSize) {
        result.push(chunk);
      } else {
        // Split at sentence boundaries
        let remainingText = chunk;
        while (remainingText.length > maxSize) {
          // Find a good breaking point (end of sentence) near the max size
          let breakPoint = remainingText.lastIndexOf('.', maxSize);
          if (breakPoint === -1 || breakPoint < maxSize / 2) {
            // If no good sentence break, try line break
            breakPoint = remainingText.lastIndexOf('\n', maxSize);
          }
          if (breakPoint === -1 || breakPoint < maxSize / 2) {
            // If still no good break, just break at the max size
            breakPoint = maxSize;
          } else {
            // Include the period or line break
            breakPoint += 1;
          }

          result.push(remainingText.substring(0, breakPoint));
          remainingText = remainingText.substring(breakPoint).trim();
        }

        if (remainingText.length > 0) {
          result.push(remainingText);
        }
      }
    }

    logger.debug(`Split text into ${result.length} chunks`);
    return result;
  } catch (error) {
    logger.error('Error chunking text', error);
    return [text]; // Return original text as a single chunk if chunking fails
  }
}

/**
 * Smart chunk text into pieces that preserve context
 * @param text The text to chunk
 * @param maxSize The maximum size of each chunk
 * @returns An array of text chunks with preserved context
 */
export function smartChunkText(text: string, maxSize: number): string[] {
  try {
    const chunks: string[] = [];

    // Try to split at paragraph boundaries first
    const paragraphs = text.split(/\n\s*\n/);

    let currentChunk = '';
    let currentContext = '';

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed the max size, start a new chunk
      if (currentChunk.length + paragraph.length > maxSize && currentChunk.length > 0) {
        // Add a small context from the end of the previous chunk
        const contextSize = Math.min(200, currentChunk.length / 4);
        currentContext = currentChunk.substring(currentChunk.length - contextSize);

        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Add to the current chunk with a paragraph separator if needed
        if (currentChunk.length > 0) {
          currentChunk += '\n\n' + paragraph;
        } else {
          // If we have context from a previous chunk, prepend it
          if (currentContext.length > 0) {
            currentChunk = '--- CONTEXT FROM PREVIOUS CHUNK ---\n' + currentContext + '\n\n--- CONTINUATION ---\n\n' + paragraph;
            currentContext = '';
          } else {
            currentChunk = paragraph;
          }
        }
      }
    }

    // Add the last chunk if it has content
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // If we still have chunks that are too large, split them further
    const result: string[] = [];

    for (const chunk of chunks) {
      if (chunk.length <= maxSize) {
        result.push(chunk);
      } else {
        // Split at sentence boundaries
        let remainingText = chunk;
        while (remainingText.length > maxSize) {
          // Find a good breaking point (end of sentence) near the max size
          let breakPoint = remainingText.lastIndexOf('.', maxSize);
          if (breakPoint === -1 || breakPoint < maxSize / 2) {
            // If no good sentence break, try line break
            breakPoint = remainingText.lastIndexOf('\n', maxSize);
          }
          if (breakPoint === -1 || breakPoint < maxSize / 2) {
            // If still no good break, just break at the max size
            breakPoint = maxSize;
          } else {
            // Include the period or line break
            breakPoint += 1;
          }

          result.push(remainingText.substring(0, breakPoint));
          remainingText = remainingText.substring(breakPoint).trim();
        }

        if (remainingText.length > 0) {
          result.push(remainingText);
        }
      }
    }

    logger.debug(`Smart chunked text into ${result.length} chunks with context preservation`);
    return result;
  } catch (error) {
    logger.error('Error smart chunking text', error);
    return [text]; // Return original text as a single chunk if chunking fails
  }
}

/**
 * Process input for Augment with smart chunking and code block preservation
 * @param text The text to process
 * @returns The processed text
 */
export function processInput(text: string): string {
  try {
    const config = configManager.getConfig();
    
    // If the input is small enough, just optimize it
    if (text.length <= config.maxInputSize) {
      return optimizeInput(text);
    }
    
    let chunks: string[] = [];
    
    // Check if we need to preserve code blocks
    if (config.preserveCodeBlocks && text.includes('```')) {
      // Split by code blocks and preserve them
      const codeBlockRegex = /(```[\s\S]*?```)/g;
      const parts = text.split(codeBlockRegex);
      
      for (const part of parts) {
        if (part.startsWith('```') && part.endsWith('```')) {
          // This is a code block, keep it intact if possible
          if (part.length > config.maxInputSize) {
            // Code block is too large, we need to split it
            const lines = part.split('\n');
            let currentChunk = '';
            
            for (const line of lines) {
              if (currentChunk.length + line.length + 1 > config.maxInputSize && currentChunk.length > 0) {
                chunks.push(currentChunk);
                currentChunk = line;
              } else {
                if (currentChunk.length > 0) {
                  currentChunk += '\n' + line;
                } else {
                  currentChunk = line;
                }
              }
            }
            
            if (currentChunk.length > 0) {
              chunks.push(currentChunk);
            }
          } else {
            // Code block fits within size limit
            chunks.push(part);
          }
        } else if (part.trim().length > 0) {
          // This is regular text, chunk it smartly
          const textChunks = config.smartChunking ?
            smartChunkText(part, config.maxInputSize) :
            chunkText(part, config.maxInputSize);
          
          chunks = chunks.concat(textChunks);
        }
      }
    } else {
      // No code blocks or preservation disabled
      chunks = config.smartChunking ?
        smartChunkText(text, config.maxInputSize) :
        chunkText(text, config.maxInputSize);
    }
    
    // Join the chunks with a clear separator
    return chunks.join('\n\n--- CHUNK BOUNDARY ---\n\n');
  } catch (error) {
    logger.error('Error processing input', error);
    return text; // Return original text if processing fails
  }
}
