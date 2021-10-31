import { Editor } from 'obsidian';
import { WHOLE_SENTENCE } from './constants';

export const deleteToBoundary = (editor: Editor, boundary: 'start' | 'end') => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  const sentences = paragraphText.matchAll(WHOLE_SENTENCE);
  for (const sentence of sentences) {
    if (
      cursorPosition.ch >= sentence.index &&
      cursorPosition.ch < sentence.index + sentence[0].length
    ) {
      const cursorPositionInSentence = cursorPosition.ch - sentence.index;
      if (boundary === 'start') {
        const cutPortion = sentence[0].substring(0, cursorPositionInSentence);
        const newParagraph = paragraphText.replace(cutPortion, '');
        editor.setLine(cursorPosition.line, newParagraph);
        editor.setCursor({
          line: cursorPosition.line,
          ch: cursorPosition.ch - cutPortion.length,
        });
      } else {
        const cutPortion = sentence[0].substring(cursorPositionInSentence);
        const newParagraph = paragraphText.replace(cutPortion, '');
        editor.setLine(cursorPosition.line, newParagraph);
        editor.setCursor({
          line: cursorPosition.line,
          ch: cursorPosition.ch,
        });
      }
    }
  }
};

export const moveToStartOfCurrentSentence = (editor: Editor) => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  if (cursorPosition.ch === 0) {
    const previousParText = editor.getLine(cursorPosition.line - 1);
    editor.setCursor({
      line: cursorPosition.line - 1,
      ch: previousParText.length - 1,
    });
  } else {
    const sentences = paragraphText.matchAll(WHOLE_SENTENCE);
    for (const sentence of sentences) {
      if (
        cursorPosition.ch >= sentence.index &&
        sentence.index + sentence[0].length >= cursorPosition.ch
      ) {
        editor.setCursor({
          line: cursorPosition.line,
          ch: sentence.index - 2,
        });
      }
    }
  }
};

export const moveToStartOfNextSentence = (editor: Editor) => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  if (cursorPosition.ch === paragraphText.length) {
    editor.setCursor({ line: cursorPosition.line + 1, ch: 0 });
  } else {
    const sentences = paragraphText.matchAll(WHOLE_SENTENCE);
    for (const sentence of sentences) {
      if (
        cursorPosition.ch >= sentence.index &&
        cursorPosition.ch < sentence.index + sentence[0].length
      ) {
        editor.setCursor({
          line: cursorPosition.line,
          ch: sentence.index + sentence[0].length + 1,
        });
      }
    }
  }
};

export const selectSentence = (editor: Editor) => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  const sentences = paragraphText.matchAll(WHOLE_SENTENCE);
  for (const sentence of sentences) {
    if (
      sentence.index - 2 < cursorPosition.ch &&
      cursorPosition.ch < sentence.index + sentence[0].length
    ) {
      editor.setSelection(
        { line: cursorPosition.line, ch: sentence.index },
        {
          line: cursorPosition.line,
          ch: sentence.index + sentence[0].length + 1,
        },
      );
    }
  }
};
