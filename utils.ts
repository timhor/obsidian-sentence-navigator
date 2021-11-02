import { WHOLE_SENTENCE } from './constants';

export const forEachSentence = (
  paragraphText: string,
  callback: (sentence: RegExpMatchArray) => void,
) => {
  const sentences = paragraphText.matchAll(WHOLE_SENTENCE);
  for (const sentence of sentences) {
    callback(sentence);
  }
};
