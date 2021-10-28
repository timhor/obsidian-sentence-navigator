import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  Editor,
} from 'obsidian';

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    console.log('loading plugin');

    await this.loadSettings();

		this.addCommand({
			id: 'Delete-backwards-sentence',
			name: 'Delete to beginning of sentence',
			hotkeys: [{ modifiers: ["Mod","Shift"], key:"Backspace"}],
			editorCallback: (editor: Editor) => {
				const wholeSentenceRegex = (/(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm);
				const cursorPosition = editor.getCursor();
				console.log("This is the cursor position", cursorPosition)
				let lineText = editor.getLine(cursorPosition.line);
				//let sentences = lineText.matchAll(/[.?!] /gm);
				let sentences = lineText.matchAll(wholeSentenceRegex);
				for(const sentence of sentences) {
					if ( cursorPosition.ch >=sentence.index && cursorPosition.ch <sentence.index+sentence[0].length){
						let cursorPositionInSentence = cursorPosition.ch-sentence.index;
						let cutportion=sentence[0].substring(0,cursorPositionInSentence);
						let newpar=lineText.replace(cutportion," ");
						editor.setLine(cursorPosition.line,newpar);
						editor.setCursor({line:cursorPosition.line,ch:cursorPosition.ch-cutportion.length});
						// editor.setCursor(sentence.index);
					}
				}
			}
		});

		this.addCommand({
			id: 'Delete-forward-sentence',
			name: 'Delete to end of sentence',
			hotkeys: [{ modifiers: ["Mod","Shift"], key:"Delete"}],
			editorCallback: (editor: Editor) => {
				const wholeSentenceRegex = (/(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm);
				const cursorPosition = editor.getCursor();
				console.log("This is the cursor position", cursorPosition)
				let lineText = editor.getLine(cursorPosition.line);
				//let sentences = lineText.matchAll(/[.?!] /gm);
				let sentences = lineText.matchAll(wholeSentenceRegex);
				for(const sentence of sentences) {
					if ( cursorPosition.ch >=sentence.index && cursorPosition.ch <sentence.index+sentence[0].length){
						let cursorPositionInSentence = cursorPosition.ch-sentence.index;
						let cutportion=sentence[0].substring(cursorPositionInSentence);
						console.log(cutportion);
						let newpar=lineText.replace(cutportion,"");
						editor.setLine(cursorPosition.line,newpar);
						editor.setCursor({line:cursorPosition.line,ch:cursorPosition.ch});
						// editor.setCursor(sentence.index);
					}
				}
			}
		});

		this.addCommand({
			id: 'Move-backwards-sentence',
			name: 'Move to beginning of sentence',
			hotkeys: [{ modifiers: ["Alt"], key:"Left"}],
			editorCallback: (editor: Editor) => {
				const wholeSentenceRegex = (/(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm);
				const cursorPosition = editor.getCursor();
				console.log("This is the cursor position", cursorPosition)
				let lineText = editor.getLine(cursorPosition.line);
				//let sentences = lineText.matchAll(/[.?!] /gm);
				let sentences = lineText.matchAll(wholeSentenceRegex);
				for(const sentence of sentences) {
					if ( cursorPosition.ch >=sentence.index && cursorPosition.ch <sentence.index+sentence[0].length){
						editor.setCursor({line:cursorPosition.line,ch:sentence.index-2});
						// editor.setCursor(sentence.index);
					}
				}
			}
		});

		this.addCommand({
			id: 'Move-forwards-sentence',
			name: 'Move to start of next sentence',
			hotkeys: [{ modifiers: ["Mod"], key:"Right"}],
			editorCallback: (editor: Editor) => {
				const wholeSentenceRegex = (/(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm);
				const cursorPosition = editor.getCursor();
				console.log("This is the cursor position", cursorPosition)
				let lineText = editor.getLine(cursorPosition.line);
				//let sentences = lineText.matchAll(/[.?!] /gm);
				let sentences = lineText.matchAll(wholeSentenceRegex);
				for(const sentence of sentences) {
					if (cursorPosition.ch>= sentence.index && cursorPosition.ch <sentence.index+sentence[0].length){
						console.log(`cursor position before move: char is ${cursorPosition.ch} \non line (paragraph): ${cursorPosition.line} \nsentence index is ${sentence.index}\n sentence is ${sentence[0].length} chars long`);
						editor.setCursor({line:cursorPosition.line,ch:sentence.index+sentence[0].length+1});
						console.log(`cursor position before move: char is ${cursorPosition.ch}\non line (paragraph): ${cursorPosition.line} \nsentence index is ${sentence.index}\n sentence is ${sentence[0].length} chars long`);
						// editor.setCursor(sentence.index);
					}
				}
			}
		});
// comment to make it compile
		this.addCommand({
			id: 'Select Sentence',
			name: 'select-sentence',
			editorCallback: (editor: Editor) => {
				const wholeSentenceRegex = (/(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm);
				const cursorPosition = editor.getCursor();
//				console.log("This is the cursor position", cursorPosition)
				let lineText = editor.getLine(cursorPosition.line);
				//let sentences = lineText.matchAll(/[.?!] /gm);
				let sentences = lineText.matchAll(wholeSentenceRegex);
				for(const sentence of sentences) {
					if (sentence.index-2<cursorPosition.ch && cursorPosition.ch <sentence.index+sentence[0].length){
						editor.setSelection({line:cursorPosition.line,ch:sentence.index-1},{line:cursorPosition.line,ch:sentence.index+sentence[0].length});
						// editor.setCursor(sentence.index);
					}
				}	
			}
		})

    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      console.log('codemirror', cm);
    });

    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
      console.log('click', evt);
    });

    this.registerInterval(
      window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000),
    );
  }

  onunload() {
    console.log('unloading plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder('Enter your secret')
          .setValue('')
          .onChange(async (value) => {
            console.log('Secret: ' + value);
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
