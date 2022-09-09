import { Plugin, Editor } from 'obsidian';
import {
  deleteToBoundary,
  moveToStartOfCurrentSentence,
  moveToStartOfNextSentence,
  selectSentence,
} from './actions';
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from './settings';
import { State } from './state';

export default class SentenceNavigator extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();

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

    this.addSettingTab(new SettingTab(this.app, this));
  }

  async loadSettings() {
    const savedSettings = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...savedSettings,
    };
    State.sentenceRegex = new RegExp(this.settings.sentenceRegexSource, 'gm');
  }

  async saveSettings() {
    await this.saveData(this.settings);
    State.sentenceRegex = new RegExp(this.settings.sentenceRegexSource, 'gm');
  }
}
