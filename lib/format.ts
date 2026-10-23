const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatMonthYear(date: string, short = false) {
  const [y, m] = date.split("-").map(Number);
  const name = MONTHS[(m || 1) - 1];
  return `${short ? name.slice(0, 3) : name} ${y}`;
}
