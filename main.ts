import { Plugin, Editor } from 'obsidian';

export default class SentenceNavigator extends Plugin {
  onload() {
    this.addCommand({
      id: 'Delete-backwards-sentence',
      name: 'Delete to beginning of sentence',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'Backspace' }],
      editorCallback: (editor: Editor) => {
        const wholeSentenceRegex =
          /(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm;
        const cursorPosition = editor.getCursor();
        let paragraphText = editor.getLine(cursorPosition.line);
        const sentences = paragraphText.matchAll(wholeSentenceRegex);
        for (const sentence of sentences) {
          if (
            cursorPosition.ch >= sentence.index &&
            cursorPosition.ch < sentence.index + sentence[0].length
          ) {
            let cursorPositionInSentence = cursorPosition.ch - sentence.index;
            let cutPortion = sentence[0].substring(0, cursorPositionInSentence);
            let newPar = paragraphText.replace(cutPortion, ' ');
            editor.setLine(cursorPosition.line, newPar);
            editor.setCursor({
              line: cursorPosition.line,
              ch: cursorPosition.ch - cutPortion.length,
            });
          }
        }
      },
    });

    this.addCommand({
      id: 'Delete-forward-sentence',
      name: 'Delete to end of sentence',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'Delete' }],
      editorCallback: (editor: Editor) => {
        const wholeSentenceRegex =
          /(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm;
        const cursorPosition = editor.getCursor();
        let paragraphText = editor.getLine(cursorPosition.line);
        let sentences = paragraphText.matchAll(wholeSentenceRegex);
        for (const sentence of sentences) {
          if (
            cursorPosition.ch >= sentence.index &&
            cursorPosition.ch < sentence.index + sentence[0].length
          ) {
            let cursorPositionInSentence = cursorPosition.ch - sentence.index;
            let cutPortion = sentence[0].substring(cursorPositionInSentence);
            let newPar = paragraphText.replace(cutPortion, '');
            editor.setLine(cursorPosition.line, newPar);
            editor.setCursor({
              line: cursorPosition.line,
              ch: cursorPosition.ch,
            });
          }
        }
      },
    });

    this.addCommand({
      id: 'Move-backwards-sentence',
      name: 'Move to beginning of sentence',
      hotkeys: [{ modifiers: ['Alt'], key: 'Left' }],
      editorCallback: (editor: Editor) => {
        const wholeSentenceRegex =
          /(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm;
        let cursorPosition = editor.getCursor();
        let paragraphText = editor.getLine(cursorPosition.line);
        if (cursorPosition.ch == 0) {
          let previousParText = editor.getLine(cursorPosition.line - 1);
          editor.setCursor({
            line: cursorPosition.line - 1,
            ch: previousParText.length - 1,
          });
        } else {
          const sentences = paragraphText.matchAll(wholeSentenceRegex);
          for (const sentence of sentences) {
            if (
              cursorPosition.ch >= sentence.index &&
              sentence.index + sentence[0].length >= cursorPosition.ch
            ) {
              editor.setCursor({
                line: cursorPosition.line,
                ch: sentence.index - 2,
              });
            }
          }
        }
      },
    });

    this.addCommand({
      id: 'Move-forwards-sentence',
      name: 'Move to start of next sentence',
      hotkeys: [{ modifiers: ['Mod'], key: 'Right' }],
      editorCallback: (editor: Editor) => {
        const wholeSentenceRegex =
          /(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm;
        let cursorPosition = editor.getCursor();
        let paragraphText = editor.getLine(cursorPosition.line);
        if (cursorPosition.ch == paragraphText.length) {
          editor.setCursor({ line: cursorPosition.line + 1, ch: 0 });
        } else {
          const sentences = paragraphText.matchAll(wholeSentenceRegex);
          for (const sentence of sentences) {
            if (
              cursorPosition.ch >= sentence.index &&
              cursorPosition.ch < sentence.index + sentence[0].length
            ) {
              editor.setCursor({
                line: cursorPosition.line,
                ch: sentence.index + sentence[0].length + 1,
              });
            }
          }
        }
      },
    });

    this.addCommand({
      id: 'Select Sentence',
      name: 'select-sentence',
      editorCallback: (editor: Editor) => {
        const wholeSentenceRegex =
          /(==(.*?)==)|[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm;
        const cursorPosition = editor.getCursor();
        let paragraphText = editor.getLine(cursorPosition.line);
        let sentences = paragraphText.matchAll(wholeSentenceRegex);
        for (const sentence of sentences) {
          if (
            sentence.index - 2 < cursorPosition.ch &&
            cursorPosition.ch < sentence.index + sentence[0].length
          ) {
            editor.setSelection(
              { line: cursorPosition.line, ch: sentence.index - 1 },
              {
                line: cursorPosition.line,
                ch: sentence.index + sentence[0].length,
              },
            );
          }
        }
      },
    });
  }
}
