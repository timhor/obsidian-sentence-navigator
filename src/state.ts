type SentenceNavigatorState = {
  sentenceRegex: RegExp | null;
};

/**
 * Simple state object used to hold information from saved settings
 */
export const State: SentenceNavigatorState = {
  sentenceRegex: null,
};
