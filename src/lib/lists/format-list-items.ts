type FormattableListItem = {
  front: string;
  back: string;
};

export function formatListItemsForTextarea(items: FormattableListItem[]) {
  return items.map((item) => `${item.front} % ${item.back}`).join("\n");
}
