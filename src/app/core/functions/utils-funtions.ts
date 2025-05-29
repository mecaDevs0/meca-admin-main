export const handlePercentage = (value: number, total: number) => {
  if (value || total) {
    return Number(((value / total) * 100).toFixed()) || 0;
  } else {
    return 0;
  }
}
