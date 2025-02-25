export function slugify(input: string, maxLength = 100): string {
  let output = input
    .trim()
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^a-z- ]/g, '')
    .substring(0, maxLength)
    .replace(/-+$/, '');

  while (output.indexOf('--') > -1) {
    output = output.replace('--', '-');
  }

  return output;
}
