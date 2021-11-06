import { Editor } from 'obsidian';
import { forEachSentence } from './utils';

export const deleteToBoundary = (editor: Editor, boundary: 'start' | 'end') => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  forEachSentence(paragraphText, (sentence) => {
    if (
      cursorPosition.ch >= sentence.index &&
      cursorPosition.ch <= sentence.index + sentence[0].length
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
  });
};

export const moveToStartOfCurrentSentence = (editor: Editor) => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  if (cursorPosition.ch === 0) {
    const previousParagraphText = editor.getLine(cursorPosition.line - 1);
    editor.setCursor({
      line: cursorPosition.line - 1,
      ch: previousParagraphText.length - 1,
    });
  } else {
    forEachSentence(paragraphText, (sentence) => {
      if (
        cursorPosition.ch >= sentence.index &&
        sentence.index + sentence[0].length >= cursorPosition.ch
      ) {
        editor.setCursor({
          line: cursorPosition.line,
          ch: sentence.index,
        });
      }
    });
  }
};

export const moveToStartOfNextSentence = (editor: Editor) => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  if (cursorPosition.ch === paragraphText.length) {
    editor.setCursor({ line: cursorPosition.line + 1, ch: 0 });
  } else {
    forEachSentence(paragraphText, (sentence) => {
      if (
        cursorPosition.ch >= sentence.index &&
        cursorPosition.ch < sentence.index + sentence[0].length
      ) {
        editor.setCursor({
          line: cursorPosition.line,
          ch: sentence.index + sentence[0].length + 1,
        });
      }
    });
  }
};

export const selectSentence = (editor: Editor) => {
  const cursorPosition = editor.getCursor();
  const paragraphText = editor.getLine(cursorPosition.line);
  let found = false;
  forEachSentence(paragraphText, (sentence) => {
    if (!found && cursorPosition.ch <= sentence.index + sentence[0].length) {
      editor.setSelection(
        { line: cursorPosition.line, ch: sentence.index },
        {
          line: cursorPosition.line,
          ch: sentence.index + sentence[0].length + 1,
        },
      );
      found = true;
    }
  });
};
