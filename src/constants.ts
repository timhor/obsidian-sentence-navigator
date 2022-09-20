// regex via https://stackoverflow.com/a/5553924
export const WHOLE_SENTENCE =
  /[^.!?\-*+\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm;
