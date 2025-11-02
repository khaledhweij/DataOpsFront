export function convertToEpoch(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Content cannot be empty.");

  let date: Date;
  let epochMillis: number;

  if (!isNaN(Number(trimmed))) {
    epochMillis = trimmed.length <= 10 ? Number(trimmed) * 1000 : Number(trimmed);
    date = new Date(epochMillis);
  } else {
    epochMillis = new Date(trimmed).getTime();
    if (isNaN(epochMillis)) throw new Error("Invalid input: must be epoch number or date string");
    date = new Date(epochMillis);
  }

  const epochSeconds = Math.floor(epochMillis / 1000);

  const utcOptions: Intl.DateTimeFormatOptions = {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC"
  };

  const localOptions: Intl.DateTimeFormatOptions = {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short"
  };

  const utcString = new Intl.DateTimeFormat("en-US", utcOptions).format(date);
  const localString = new Intl.DateTimeFormat("en-US", localOptions).format(date);

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const customFormat = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;

  return [
    `Epoch timestamp: ${epochSeconds}`,
    `Timestamp in milliseconds: ${epochMillis}`,
    `Date and time (UTC): ${utcString}`,
    `Date and time (Your time zone): ${localString}`,
    `Date and time (DD/MM/YYYY HH:mm:ss): ${customFormat}`
  ].join("\n");
}
