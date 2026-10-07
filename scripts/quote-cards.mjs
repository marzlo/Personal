export function selectQuoteCards(candidates, count = 10, random = Math.random) {
  const unique = [...new Map(candidates.filter(card => card?.text?.trim()).map(card => [card.text.trim(), card])).values()];
  for (let i = unique.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [unique[i], unique[j]] = [unique[j], unique[i]]; }
  return unique.slice(0, count);
}
