export function csvCell(value) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r\n]/.test(text) || /^\s+[=+\-@]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}

export function rsvpsCsv(rows) {
  const headers = ["First name", "Last name", "Email", "Phone", "Guests", "Note", "Status", "Public name consent", "RSVP date"];
  return [headers, ...rows.map(row => [row.firstName, row.lastName, row.email, row.phone, row.guestCount, row.note, row.status, row.publicNameConsent ? "Yes" : "No", new Date(row.createdAt).toISOString()])]
    .map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
