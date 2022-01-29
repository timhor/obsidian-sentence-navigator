import { Editor } from 'obsidian';
import {
  getLineBoundaries,
  getCursorAndParagraphText,
  forEachSentence,
  setCursorAtStartOfLine,
  setCursorAtEndOfLine,
  setCursorAtNextWordCharacter,
  getPrevNonEmptyLine,
  getNextNonEmptyLine,
} from './utils';

export const deleteToBoundary = (editor: Editor, boundary: 'start' | 'end') => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);

  // move cursor to next position that is not a space, to handle leading and
  // trailing space characters that might be in the path of deletion
  const originalCursorPosition = cursorPosition;
  if (
    paragraphText.charAt(cursorPosition.ch) === ' ' ||
    paragraphText.charAt(cursorPosition.ch - 1) === ' '
  ) {
    setCursorAtNextWordCharacter({
      editor,
      cursorPosition,
      paragraphText,
      direction: boundary,
    });
    ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));
  }

  let done = false;
  forEachSentence(paragraphText, (sentence) => {
    if (
      !done &&
      cursorPosition.ch >= sentence.index &&
      cursorPosition.ch <= sentence.index + sentence[0].length
    ) {
      if (boundary === 'start') {
        const newParagraph =
          paragraphText.substring(0, sentence.index) +
          paragraphText.substring(originalCursorPosition.ch);
        const cutPortionLength = paragraphText.length - newParagraph.length;
        const { start, end } = getLineBoundaries(editor, cursorPosition.line);
        editor.replaceRange(newParagraph, start, end);
        editor.setCursor({
          line: cursorPosition.line,
          ch: originalCursorPosition.ch - cutPortionLength,
        });
      } else {
        const remainingSentenceLength =
          sentence.index + sentence[0].length - cursorPosition.ch;
        const newParagraph =
          paragraphText.substring(0, originalCursorPosition.ch) +
          paragraphText.substring(cursorPosition.ch + remainingSentenceLength);
        const { start, end } = getLineBoundaries(editor, cursorPosition.line);
        editor.replaceRange(newParagraph, start, end);
        editor.setCursor(originalCursorPosition);
      }
      done = true;
    }
  });
};

export const moveToStartOfCurrentSentence = (editor: Editor) => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);

  if (cursorPosition.ch === 0) {
    // if cursor is already at the start of this paragraph, move to the previous paragraph
    setCursorAtEndOfLine(
      editor,
      getPrevNonEmptyLine(editor, cursorPosition.line),
    );
  }
  ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));

  forEachSentence(paragraphText, (sentence) => {
    const startOfSentence = sentence.index;

    // handle any spaces behind the cursor
    while (
      cursorPosition.ch > 0 &&
      paragraphText.charAt(cursorPosition.ch - 1) === ' '
    ) {
      editor.setCursor({
        line: cursorPosition.line,
        ch: cursorPosition.ch - 1,
      });
      ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));
    }

    if (
      cursorPosition.ch > startOfSentence &&
      startOfSentence + sentence[0].length >= cursorPosition.ch
    ) {
      const newPosition = startOfSentence;
      editor.setCursor({
        line: cursorPosition.line,
        ch: newPosition,
      });
      if (newPosition >= paragraphText.length) {
        setCursorAtStartOfLine(
          editor,
          getPrevNonEmptyLine(editor, cursorPosition.line),
        );
      }
    }
  });
};

export const moveToStartOfNextSentence = (editor: Editor) => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);
  if (cursorPosition.ch === paragraphText.length) {
    // if cursor is already at the end of this paragraph, move to the next paragraph
    setCursorAtStartOfLine(
      editor,
      getNextNonEmptyLine(editor, cursorPosition.line),
    );
  } else {
    forEachSentence(paragraphText, (sentence) => {
      const startOfSentence = sentence.index;
      const endOfSentence = startOfSentence + sentence[0].length;

      // handle any spaces in front of the cursor
      while (
        cursorPosition.ch < paragraphText.length &&
        paragraphText.charAt(cursorPosition.ch) === ' '
      ) {
        editor.setCursor({
          line: cursorPosition.line,
          ch: cursorPosition.ch + 1,
        });
        ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));
      }

      if (
        cursorPosition.ch >= startOfSentence &&
        cursorPosition.ch <= endOfSentence
      ) {
        const newPosition = {
          line: cursorPosition.line,
          ch: endOfSentence,
        };
        setCursorAtNextWordCharacter({
          editor,
          cursorPosition: newPosition,
          paragraphText,
          direction: 'end',
        });
        if (endOfSentence >= paragraphText.length) {
          setCursorAtStartOfLine(
            editor,
            getNextNonEmptyLine(editor, cursorPosition.line),
          );
        }
      }
    });
  }
};

export const selectSentence = (editor: Editor) => {
  const { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);
  let found = false;
  forEachSentence(paragraphText, (sentence) => {
    if (!found && cursorPosition.ch <= sentence.index + sentence[0].length) {
      editor.setSelection(
        { line: cursorPosition.line, ch: sentence.index },
        {
          line: cursorPosition.line,
          ch: sentence.index + sentence[0].length + 1, // including space
        },
      );
      found = true;
    }
  });
};
