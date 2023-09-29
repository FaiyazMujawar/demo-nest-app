export function chunk(array: any[], size: number) {
  const chunks = [];
  let i = 0;
  while (i < array.length) {
    chunks.push(array.slice(i, i + size));
    i += size;
  }
  return chunks;
}
