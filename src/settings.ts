import { PluginSettingTab, App, Setting, TextAreaComponent } from 'obsidian';
import { WHOLE_SENTENCE } from './constants';
import SentenceNavigator from './main';

export interface PluginSettings {
  sentenceRegexSource: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  sentenceRegexSource: WHOLE_SENTENCE.source,
};

export class SettingTab extends PluginSettingTab {
  plugin: SentenceNavigator;

  constructor(app: App, plugin: SentenceNavigator) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Sentence Navigator' });

    const regexSetting = new Setting(containerEl)
      .setName('Sentence regex')
      .setDesc('The regular expression used to match a sentence')
      .addTextArea((textArea) =>
        textArea
          .setPlaceholder('Enter regex')
          .setValue(this.plugin.settings.sentenceRegexSource)
          .onChange(async (value) => {
            this.plugin.settings.sentenceRegexSource = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl).setName('Reset default regex').addButton((btn) => {
      btn.setButtonText('Reset').onClick(async () => {
        this.plugin.settings = { ...DEFAULT_SETTINGS };
        (regexSetting.components[0] as TextAreaComponent).setValue(
          DEFAULT_SETTINGS.sentenceRegexSource,
        );
        await this.plugin.saveSettings();
      });
    });
  }
}
