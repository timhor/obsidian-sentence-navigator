import { Plugin, Editor } from 'obsidian';
import {
  deleteToBoundary,
  moveToStartOfCurrentSentence,
  moveToStartOfNextSentence,
  selectSentence,
} from 'actions';

export default class SentenceNavigator extends Plugin {
  onload() {
    this.addCommand({
      id: 'Delete-backwards-sentence',
      name: 'Delete to beginning of sentence',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'Backspace' }],
      editorCallback: (editor: Editor) => deleteToBoundary(editor, 'start'),
    });

    this.addCommand({
      id: 'Delete-forward-sentence',
      name: 'Delete to end of sentence',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'Delete' }],
      editorCallback: (editor: Editor) => deleteToBoundary(editor, 'end'),
    });

    this.addCommand({
      id: 'Move-backwards-sentence',
      name: 'Move to beginning of sentence',
      hotkeys: [{ modifiers: ['Alt'], key: 'Left' }],
      editorCallback: (editor: Editor) => moveToStartOfCurrentSentence(editor),
    });

    this.addCommand({
      id: 'Move-forwards-sentence',
      name: 'Move to start of next sentence',
      hotkeys: [{ modifiers: ['Mod'], key: 'Right' }],
      editorCallback: (editor: Editor) => moveToStartOfNextSentence(editor),
    });

    this.addCommand({
      id: 'Select Sentence',
      name: 'select-sentence',
      editorCallback: (editor: Editor) => selectSentence(editor),
    });
  }
}
