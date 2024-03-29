import CodeMirror from 'codemirror';
import type { Editor } from 'codemirror';
import { getDocumentAndSelection } from './test-helpers';
import {
  deleteToBoundary,
  moveToStartOfCurrentSentence,
  moveToStartOfNextSentence,
  selectSentence,
  selectToBoundary,
} from '../actions';
import { State } from '../state';
import { WHOLE_SENTENCE } from '../constants';

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

describe('Sentence Navigator: actions', () => {
  let editor: Editor;
  const originalLine1 =
    "This is a sentence. Here's another one!  This is a different and " +
    'longer sentence with several other words in it?';
  const originalLine2 = '\n\nContinuing on a **SEPARATE** paragraph now';
  const originalDoc = originalLine1 + originalLine2;

  beforeAll(() => {
    editor = CodeMirror(document.body);
    State.sentenceRegex = WHOLE_SENTENCE;
  });

  beforeEach(() => {
    editor.setValue(originalDoc);
  });

  describe('deleteToBoundary -> start', () => {
    it.each([
      [
        'when cursor is in the first sentence',
        // preview: This is a |sentence. Here's another...
        { line: 0, ch: 10 },
        "sentence. Here's another one!  This is a different and longer " +
          'sentence with several other words in it?' +
          originalLine2,
        { line: 0, ch: 0 },
      ],
      [
        'when cursor is in a middle sentence',
        // preview: ...sentence. Here's an|other one...
        { line: 0, ch: 29 },
        'This is a sentence. other one!  This is a different and longer ' +
          'sentence with several other words in it?' +
          originalLine2,
        { line: 0, ch: 20 },
      ],
      [
        'when cursor is in the last sentence',
        // preview: ...longer sentence with |several other...
        { line: 0, ch: 86 },
        "This is a sentence. Here's another one!  several other words in it?" +
          originalLine2,
        { line: 0, ch: 41 },
      ],
      [
        'when cursor is between two sentences',
        // preview: ...another one! | This is a different...
        { line: 0, ch: 40 },
        'This is a sentence.  This is a different and longer sentence with ' +
          'several other words in it?' +
          originalLine2,
        { line: 0, ch: 20 },
      ],
      [
        'when cursor is in another paragraph',
        // preview: ...on a **SEPARATE** |paragraph now
        { line: 2, ch: 29 },
        originalLine1 + '\n\nparagraph now',
        { line: 2, ch: 0 },
      ],
      [
        'when cursor is on a blank line between paragraphs',
        { line: 1, ch: 0 },
        originalDoc,
        { line: 1, ch: 0 },
      ],
    ])(
      'should delete to beginning of sentence %s',
      (_scenario, cursorPos, expectedDoc, expectedCursorPos) => {
        editor.setCursor(cursorPos);

        deleteToBoundary(editor as any, 'start');

        const { doc, cursor } = getDocumentAndSelection(editor);
        expect(doc).toEqual(expectedDoc);
        expect(cursor).toEqual(expect.objectContaining(expectedCursorPos));
      },
    );
  });

  describe('deleteToBoundary -> end', () => {
    it.each([
      [
        'when cursor is in the first sentence',
        // preview: This is a |sentence. Here's another...
        { line: 0, ch: 10 },
        "This is a  Here's another one!  This is a different and longer " +
          'sentence with several other words in it?' +
          originalLine2,
        { line: 0, ch: 10 },
      ],
      [
        'when cursor is in a middle sentence',
        // preview: ...sentence. Here's an|other one...
        { line: 0, ch: 29 },
        "This is a sentence. Here's an  This is a different and longer " +
          'sentence with several other words in it?' +
          originalLine2,
        { line: 0, ch: 29 },
      ],
      [
        'when cursor is in the last sentence',
        // preview: ...longer sentence with |several other...
        { line: 0, ch: 86 },
        "This is a sentence. Here's another one!  This is a different and " +
          'longer sentence with ' +
          originalLine2,
        { line: 0, ch: 86 },
      ],
      [
        'when cursor is between two sentences',
        // preview: ...another one! | This is a different...
        { line: 0, ch: 40 },
        "This is a sentence. Here's another one! " + originalLine2,
        { line: 0, ch: 40 },
      ],
      [
        'when cursor is in another paragraph',
        // preview: ...on a **SEPARATE** |paragraph now
        { line: 2, ch: 29 },
        originalLine1 + '\n\nContinuing on a **SEPARATE** ',
        { line: 2, ch: 29 },
      ],
      [
        'when cursor is on a blank line between paragraphs',
        { line: 1, ch: 0 },
        originalDoc,
        { line: 1, ch: 0 },
      ],
    ])(
      'should delete to end of sentence %s',
      (_scenario, cursorPos, expectedDoc, expectedCursorPos) => {
        editor.setCursor(cursorPos);

        deleteToBoundary(editor as any, 'end');

        const { doc, cursor } = getDocumentAndSelection(editor);
        expect(doc).toEqual(expectedDoc);
        expect(cursor).toEqual(expect.objectContaining(expectedCursorPos));
      },
    );
  });

  describe('selectToBoundary -> start', () => {
    it.each([
      [
        'when cursor is in the first sentence',
        // preview: This is a |sentence. Here's another...
        { line: 0, ch: 10 },
        undefined,
        'This is a ',
      ],
      [
        'when cursor is in a middle sentence',
        // preview: ...sentence. Here's an|other one...
        { line: 0, ch: 29 },
        undefined,
        "Here's an",
      ],
      [
        'when cursor is in the last sentence',
        // preview: ...longer sentence with |several other...
        { line: 0, ch: 86 },
        undefined,
        'This is a different and longer sentence with ',
      ],
      [
        'when cursor is between two sentences',
        // preview: ...another one! | This is a different...
        { line: 0, ch: 40 },
        undefined,
        '',
      ],
      [
        'when cursor is in another paragraph',
        // preview: ...on a **SEPARATE** |paragraph now
        { line: 2, ch: 29 },
        undefined,
        'Continuing on a **SEPARATE** ',
      ],
      [
        'when cursor is on a blank line between paragraphs',
        { line: 1, ch: 0 },
        undefined,
        '',
      ],
      [
        'when selection head is at the start of a sentence',
        // preview: ...sentence. {<}Here's{>} another...
        { line: 0, ch: 26 },
        { line: 0, ch: 20 },
        "Here's",
      ],
    ])(
      'should select to start of sentence %s',
      (_scenario, anchor, head, expectedText) => {
        editor.setSelection(anchor, head);

        selectToBoundary(editor as any, 'start');

        const { doc, selectedText } = getDocumentAndSelection(editor);
        expect(doc).toEqual(originalDoc);
        expect(selectedText).toEqual(expectedText);
      },
    );
  });

  describe('selectToBoundary -> end', () => {
    it.each([
      [
        'when cursor is in the first sentence',
        // preview: This is a |sentence. Here's another...
        { line: 0, ch: 10 },
        undefined,
        'sentence.',
      ],
      [
        'when cursor is in a middle sentence',
        // preview: ...sentence. Here's an|other one...
        { line: 0, ch: 29 },
        undefined,
        'other one!',
      ],
      [
        'when cursor is in the last sentence',
        // preview: ...longer sentence with |several other...
        { line: 0, ch: 86 },
        undefined,
        'several other words in it?',
      ],
      [
        'when cursor is between two sentences',
        // preview: ...another one! | This is a different...
        { line: 0, ch: 40 },
        undefined,
        '',
      ],
      [
        'when cursor is in another paragraph',
        // preview: ...on a **SEPARATE** |paragraph now
        { line: 2, ch: 29 },
        undefined,
        'paragraph now',
      ],
      [
        'when cursor is on a blank line between paragraphs',
        { line: 1, ch: 0 },
        undefined,
        '',
      ],
      [
        'when selection head is at the start of a sentence',
        // preview: ...sentence. {<}Here's{>} another...
        { line: 0, ch: 27 },
        { line: 0, ch: 39 },
        'another one!',
      ],
    ])(
      'should select to end of sentence %s',
      (_scenario, anchor, head, expectedText) => {
        editor.setSelection(anchor, head);

        selectToBoundary(editor as any, 'end');

        const { doc, selectedText } = getDocumentAndSelection(editor);
        expect(doc).toEqual(originalDoc);
        expect(selectedText).toEqual(expectedText);
      },
    );
  });

  describe('moveToStartOfCurrentSentence', () => {
    it.each([
      [
        'when cursor is in the middle of a sentence',
        // preview: ...longer sentence with |several other...
        { line: 0, ch: 86 },
        { line: 0, ch: 41 },
      ],
      [
        'when cursor is between two sentences',
        // preview: ...another one! | This is a different...
        { line: 0, ch: 40 },
        { line: 0, ch: 20 },
      ],
    ])(
      'should jump to start of current sentence %s',
      (_scenario, cursorPos, expectedCursorPos) => {
        editor.setCursor(cursorPos);

        moveToStartOfCurrentSentence(editor as any);

        const { doc, cursor } = getDocumentAndSelection(editor);
        expect(doc).toEqual(originalDoc);
        expect(cursor).toEqual(expect.objectContaining(expectedCursorPos));
      },
    );

    it.each([
      [
        'when cursor is already at the start of a sentence',
        // preview: ...This is a sentence. |Here's another...
        { line: 0, ch: 20 },
        { line: 0, ch: 0 },
      ],
      [
        'when cursor is at the start of a paragraph',
        // preview: |Continuing on a **SEPARATE** paragraph...
        { line: 2, ch: 0 },
        { line: 0, ch: 41 },
      ],
      [
        'when cursor is on a blank line between paragraphs',
        { line: 1, ch: 0 },
        { line: 0, ch: 41 },
      ],
    ])(
      'should jump to start of previous sentence %s',
      (_scenario, cursorPos, expectedCursorPos) => {
        editor.setCursor(cursorPos);

        moveToStartOfCurrentSentence(editor as any);

        const { doc, cursor } = getDocumentAndSelection(editor);
        expect(doc).toEqual(originalDoc);
        expect(cursor).toEqual(expect.objectContaining(expectedCursorPos));
      },
    );

    it.each([
      [
        'when cursor is at the start of a bullet list',
        '- ',
        { line: 1, ch: 6 },
        { line: 0, ch: 7 },
      ],
      [
        'when cursor is at the start of a numbered list',
        '1. ',
        { line: 1, ch: 7 },
        { line: 0, ch: 8 },
      ],
      [
        'when cursor is at the start of a checklist',
        '- [ ] ',
        { line: 1, ch: 10 },
        { line: 0, ch: 11 },
      ],
    ])(
      'should jump to start of previous sentence %s',
      (_scenario, prefix, cursorPos, expectedCursorPos) => {
        const document = `${prefix}AAA. BBB.\n${prefix}CCC.`;
        editor.setValue(document);
        editor.setCursor(cursorPos);

        moveToStartOfCurrentSentence(editor as any);
        moveToStartOfCurrentSentence(editor as any);

        const { doc, cursor } = getDocumentAndSelection(editor);
        expect(doc).toEqual(document);
        expect(cursor).toEqual(expect.objectContaining(expectedCursorPos));
      },
    );
  });

  describe('moveToStartOfNextSentence', () => {
    it.each([
      [
        'when cursor is in the middle of a sentence',
        // preview: ...is a sentence. Here's |another one
        { line: 0, ch: 27 },
        { line: 0, ch: 41 },
      ],
      [
        'when cursor is between two sentences',
        // preview: ...another one! | This is a different...
        { line: 0, ch: 40 },
        { line: 2, ch: 0 },
      ],
      [
        'when cursor is in the last sentence of a paragraph',
        // preview: ...longer sentence with |several other...
        { line: 0, ch: 86 },
        { line: 2, ch: 0 },
      ],
      [
        'when cursor is on a blank line between paragraphs',
        { line: 1, ch: 0 },
        { line: 2, ch: 0 },
      ],
    ])(
      'should jump to start of next sentence %s',
      (_scenario, cursorPos, expectedSelection) => {
        editor.setCursor(cursorPos);

        moveToStartOfNextSentence(editor as any);

        const { doc, cursor } = getDocumentAndSelection(editor);
        expect(doc).toEqual(originalDoc);
        expect(cursor).toEqual(expect.objectContaining(expectedSelection));
      },
    );
  });

  describe('selectSentence', () => {
    it.each([
      [
        'when cursor is in the middle of a sentence',
        // preview: ...sentence. Here's an|other one...
        { line: 0, ch: 29 },
        "Here's another one!",
      ],
      [
        'when cursor is between two sentences',
        // preview: ...another one! | This is a different...
        { line: 0, ch: 40 },
        'This is a different and longer sentence with several other words in it?',
      ],
      [
        'when cursor is on a blank line between paragraphs',
        { line: 1, ch: 0 },
        '',
      ],
      [
        'when the sentence does not have punctuation',
        // preview: ...on a **SEPARATE** |paragraph now
        { line: 2, ch: 29 },
        'Continuing on a **SEPARATE** paragraph now',
      ],
    ])(
      'should select current sentence %s',
      (_scenario, cursorPos, expectedSelection) => {
        editor.setCursor(cursorPos);

        selectSentence(editor as any);

        const { doc, selectedText } = getDocumentAndSelection(editor);
        expect(doc).toEqual(originalDoc);
        expect(selectedText).toEqual(expectedSelection);
      },
    );

    it('should not select markdown bullet list characters', () => {
      editor.setValue('- lorem ipsum');
      editor.setCursor({ line: 0, ch: 0 });

      selectSentence(editor as any);

      const { doc, selectedText } = getDocumentAndSelection(editor);
      expect(doc).toEqual('- lorem ipsum');
      expect(selectedText).toEqual('lorem ipsum');
    });

    it('should not select markdown numbered list characters', () => {
      editor.setValue('1. lorem ipsum');
      editor.setCursor({ line: 0, ch: 0 });

      selectSentence(editor as any);

      const { doc, selectedText } = getDocumentAndSelection(editor);
      expect(doc).toEqual('1. lorem ipsum');
      expect(selectedText).toEqual('lorem ipsum');
    });
  });
});
