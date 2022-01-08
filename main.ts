import { Plugin, Editor } from 'obsidian';
import {
  deleteToBoundary,
  moveToStartOfCurrentSentence,
  moveToStartOfNextSentence,
  selectSentence,
} from './actions';

export default class SentenceNavigator extends Plugin {
  onload() {
    this.addCommand({
      id: 'backward-delete-sentence',
      name: 'Delete to beginning of sentence',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'Backspace' }],
      editorCallback: (editor: Editor) => deleteToBoundary(editor, 'start'),
    });

    this.addCommand({
      id: 'forward-delete-sentence',
      name: 'Delete to end of sentence',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'Delete' }],
      editorCallback: (editor: Editor) => deleteToBoundary(editor, 'end'),
    });

    this.addCommand({
      id: 'move-start-current-sentence',
      name: 'Move to start of current sentence',
      editorCallback: (editor: Editor) => moveToStartOfCurrentSentence(editor),
    });

    this.addCommand({
      id: 'move-start-next-sentence',
      name: 'Move to start of next sentence',
      editorCallback: (editor: Editor) => moveToStartOfNextSentence(editor),
    });

    this.addCommand({
      id: 'select-sentence',
      name: 'Select current sentence',
      editorCallback: (editor: Editor) => selectSentence(editor),
    });
  }
}
