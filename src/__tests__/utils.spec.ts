import CodeMirror from 'codemirror';
import type { Editor } from 'codemirror';
import {
  getLineBoundaries,
  getCursorAndParagraphText,
  forEachSentence,
  setCursorAtStartOfLine,
  setCursorAtEndOfLine,
  setCursorAtNextWordCharacter,
  getPrevNonEmptyLine,
  getNextNonEmptyLine,
} from '../utils';

// fixes jsdom type error - https://github.com/jsdom/jsdom/issues/3002#issuecomment-655748833
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = jest.fn(() => ({
    item: () => null,
    length: 0,
  }));

  return range;
};

describe('Sentence Navigator: utils', () => {
  let editor: Editor;
  const originalLine1 =
    "This is a sentence. Here's another one!  This is a different and " +
    'longer sentence with several other words in it?';
  const originalLine2 = '\n\n\nContinuing on a **SEPARATE** paragraph now';
  const originalDoc = originalLine1 + originalLine2;

  beforeAll(() => {
    editor = CodeMirror(document.body);
  });

  beforeEach(() => {
    editor.setValue(originalDoc);
    editor.setCursor({ line: 3, ch: 15 });
  });

  it('should get line boundaries', () => {
    const boundaries = getLineBoundaries(editor as any, 3);
    expect(boundaries).toEqual({
      start: {
        line: 3,
        ch: 0,
      },
      end: {
        line: 3,
        ch: 42,
      },
    });
  });

  it('should get cursor and paragraph text', () => {
    const cursorAndParagraph = getCursorAndParagraphText(editor as any);
    expect(cursorAndParagraph).toEqual({
      cursorPosition: {
        line: 3,
        ch: 15,
      },
      paragraphText: 'Continuing on a **SEPARATE** paragraph now',
    });
  });

  it('should execute a callback for each sentence', () => {
    const sentences: string[] = [];
    const indices: number[] = [];
    forEachSentence(
      'First sentence. Second sentence! Third sentence?',
      (sentence) => {
        sentences.push(sentence[0]);
        indices.push(sentence.index);
      },
    );
    expect(sentences).toEqual([
      'First sentence.',
      'Second sentence!',
      'Third sentence?',
    ]);
    expect(indices).toEqual([0, 16, 33]);
  });

  it('should set cursor at start of line', () => {
    setCursorAtStartOfLine(editor as any, 0);
    expect(editor.getCursor()).toEqual(
      expect.objectContaining({
        line: 0,
        ch: 0,
      }),
    );
  });

  it('should set cursor at end of line', () => {
    setCursorAtEndOfLine(editor as any, 0);
    expect(editor.getCursor()).toEqual(
      expect.objectContaining({
        line: 0,
        ch: 112,
      }),
    );
  });

  describe('setting cursor at next word character', () => {
    it('should search forwards', () => {
      setCursorAtNextWordCharacter({
        editor: editor as any,
        cursorPosition: { line: 0, ch: 40 },
        paragraphText: originalLine1,
        direction: 'end',
      });
      expect(editor.getCursor()).toEqual(
        expect.objectContaining({
          line: 0,
          ch: 41,
        }),
      );
    });

    it('should search backwards', () => {
      setCursorAtNextWordCharacter({
        editor: editor as any,
        cursorPosition: { line: 0, ch: 40 },
        paragraphText: originalLine1,
        direction: 'start',
      });
      expect(editor.getCursor()).toEqual(
        expect.objectContaining({
          line: 0,
          ch: 39,
        }),
      );
    });
  });

  it('should get previous non-empty line', () => {
    const prevLine = getPrevNonEmptyLine(editor as any, 2);
    expect(prevLine).toEqual(0);
  });

  it('should get next non-empty line', () => {
    const nextLine = getNextNonEmptyLine(editor as any, 1);
    expect(nextLine).toEqual(3);
  });
});
