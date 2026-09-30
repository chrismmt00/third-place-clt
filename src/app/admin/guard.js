import "server-only";
import { notFound, redirect } from "next/navigation";

/**
 * Awaits a backend admin query and turns its auth errors into navigation:
 * not signed in -> login, temporary password -> account, not allowed -> overview,
 * malformed id -> 404. Anything else propagates to the error boundary.
 */
export async function guard(promise) {
  try {
    return await promise;
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") redirect("/admin/login");
    if (error?.code === "PASSWORD_CHANGE_REQUIRED") redirect("/admin/account");
    if (error?.code === "FORBIDDEN") redirect("/admin");
    if (error?.name === "ZodError") notFound();
    throw error;
  }
}
