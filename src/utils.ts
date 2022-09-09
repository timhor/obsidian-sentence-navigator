import { Editor, EditorPosition } from 'obsidian';
import { State } from './state';

export const getLineBoundaries = (editor: Editor, line: number) => ({
  start: {
    line,
    ch: 0,
  },
  end: {
    line,
    ch: editor.getLine(line).length,
  },
});

export const getCursorAndParagraphText = (editor: Editor) => {
  const cursorPosition = editor.getCursor();
  return {
    cursorPosition,
    paragraphText: editor.getLine(cursorPosition.line),
  };
};

export const forEachSentence = (
  paragraphText: string,
  callback: (sentence: RegExpMatchArray) => void,
) => {
  const sentences = paragraphText.matchAll(State.sentenceRegex);
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

export const setCursorAtNextWordCharacter = ({
  editor,
  cursorPosition,
  paragraphText,
  direction,
}: {
  editor: Editor;
  cursorPosition: EditorPosition;
  paragraphText: string;
  direction: 'start' | 'end';
}) => {
  let ch = cursorPosition.ch;
  if (direction === 'start') {
    while (ch > 0 && paragraphText.charAt(ch - 1) === ' ') {
      ch--;
    }
  } else {
    while (ch < paragraphText.length && paragraphText.charAt(ch) === ' ') {
      ch++;
    }
  }
  editor.setCursor({
    ch,
    line: cursorPosition.line,
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
