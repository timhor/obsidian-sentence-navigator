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
  isAtStartOfListItem,
} from './utils';

export const deleteToBoundary = (editor: Editor, boundary: 'start' | 'end') => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);

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
        const sentenceTextBeforeCursor =
          paragraphText.substring(0, sentence.index) +
          paragraphText.substring(originalCursorPosition.ch);
        const cutPortionLength =
          paragraphText.length - sentenceTextBeforeCursor.length;
        const { start, end } = getLineBoundaries(editor, cursorPosition.line);
        editor.replaceRange(sentenceTextBeforeCursor, start, end);
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

/**
 * Selects from the cursor to the start or end of a sentence, with the current
 * cursor position as an anchor. Intended to be used from inside a sentence, so
 * does not handle any leading and trailing space characters.
 */
export const selectToBoundary = (editor: Editor, boundary: 'start' | 'end') => {
  const { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);

  let done = false;
  forEachSentence(paragraphText, (sentence) => {
    if (
      !done &&
      cursorPosition.ch >= sentence.index &&
      cursorPosition.ch <= sentence.index + sentence[0].length
    ) {
      // Don't change selection if it currently starts or ends at a boundary
      if (
        editor.getSelection().length > 0 &&
        (cursorPosition.ch === sentence.index ||
          cursorPosition.ch === sentence.index + sentence[0].length)
      ) {
        return true;
      }

      if (boundary === 'start') {
        const sentenceTextBeforeCursor =
          paragraphText.substring(0, sentence.index) +
          paragraphText.substring(cursorPosition.ch);
        const precedingLength =
          paragraphText.length - sentenceTextBeforeCursor.length;
        const start = {
          ...cursorPosition,
          ch: cursorPosition.ch - precedingLength,
        };
        editor.setSelection(cursorPosition, start);
      } else {
        const remainingLength =
          sentence.index + sentence[0].length - cursorPosition.ch;
        const end = {
          ...cursorPosition,
          ch: cursorPosition.ch + remainingLength,
        };
        editor.setSelection(cursorPosition, end);
      }
      done = true;
    }
  });
};

export const moveToStartOfCurrentSentence = (editor: Editor) => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);

  if (
    cursorPosition.ch === 0 ||
    isAtStartOfListItem(cursorPosition, paragraphText)
  ) {
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

  // Ignore markdown list characters
  let paragraphTextProcessed = paragraphText;
  let offset = 0;
  const matches = paragraphText.match(/^(\d+\.|[-*+]) /);
  if (matches) {
    offset = matches[0].length;
    paragraphTextProcessed = paragraphText.slice(offset);
  }

  forEachSentence(paragraphTextProcessed, (sentence) => {
    if (
      !found &&
      cursorPosition.ch <= offset + sentence.index + sentence[0].length
    ) {
      editor.setSelection(
        { line: cursorPosition.line, ch: offset + sentence.index },
        {
          line: cursorPosition.line,
          ch: offset + sentence.index + sentence[0].length,
        },
      );
      found = true;
    }
  });
};
