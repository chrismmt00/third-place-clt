export class UserError extends Error {
  constructor(message, code = "INVALID", status = 400) {
    super(message);
    this.name = "UserError";
    this.code = code;
    this.status = status;
  }
}

/** Return only safe user-facing errors; never expose database diagnostics. */
export function actionError(error) {
  if (error instanceof UserError) return { ok: false, error: error.message, code: error.code };
  if (error?.name === "ZodError") return { ok: false, error: "Please check the form fields.", fields: Object.fromEntries(error.issues.map(issue => [issue.path.join("."), issue.message])) };
  return { ok: false, error: "We couldn't save this right now. Please try again.", code: "UNAVAILABLE" };
}
