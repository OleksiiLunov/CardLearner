export type ParsedListItemInput = {
  front: string;
  back: string;
  position: number;
};

export type ParseListItemsResult = {
  items: ParsedListItemInput[];
  ignoredLineCount: number;
};

export function parseListItemsFromMultilineInput(input: string): ParseListItemsResult {
  const lines = input.split(/\r?\n/);
  const items: ParsedListItemInput[] = [];
  let ignoredLineCount = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      ignoredLineCount += 1;
      return;
    }

    const separatorIndex = trimmedLine.indexOf("%");

    if (separatorIndex === -1) {
      ignoredLineCount += 1;
      return;
    }

    const front = trimmedLine.slice(0, separatorIndex).trim();
    const back = trimmedLine.slice(separatorIndex + 1).trim();

    if (!front || !back) {
      ignoredLineCount += 1;
      return;
    }

    items.push({
      front,
      back,
      position: items.length,
    });
  });

  return {
    items,
    ignoredLineCount,
  };
}
