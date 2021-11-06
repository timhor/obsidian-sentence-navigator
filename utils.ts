import { Editor } from 'obsidian';
import { WHOLE_SENTENCE } from './constants';

export const forEachSentence = (
  paragraphText: string,
  callback: (sentence: RegExpMatchArray) => void,
) => {
  const sentences = paragraphText.matchAll(WHOLE_SENTENCE);
  for (const sentence of sentences) {
    callback(sentence);
  }
};

export const setCursorAtStartOfLine = (editor: Editor, line: number) => {
  editor.setCursor({
    line,
    ch: 0,
  });
};

export const setCursorAtEndOfLine = (editor: Editor, line: number) => {
  editor.setCursor({
    line,
    ch: editor.getLine(line).length,
  });
};

export const getPrevNonEmptyLine = (editor: Editor, currentLine: number) => {
  let prevLine = currentLine - 1;
  while (prevLine > 0 && editor.getLine(prevLine).length === 0) {
    prevLine--;
  }
  return prevLine;
};

export const getNextNonEmptyLine = (editor: Editor, currentLine: number) => {
  let nextLine = currentLine + 1;
  while (
    nextLine < editor.lineCount() &&
    editor.getLine(nextLine).length === 0
  ) {
    nextLine++;
  }
  return nextLine;
};
