"use server";

import { AuthError } from "next-auth";
import { signIn, signOut, requireAdmin, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { credentialsSchema, emailSchema, passwordSchema } from "@/lib/passwords";
import { UserError, actionError } from "@/lib/errors";
import { serializable } from "@/lib/transaction";
import { revalidatePath } from "next/cache";

// Login is intentionally public; the Credentials provider enforces rate limits and lockout.
export async function login(_previous, formData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Sign-in failed. Check your details or try again later." };
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/admin/account" });
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: "Sign-in failed. Check your details or try again later." };
    throw error; // Preserve Next.js redirect control flow.
  }
}

export async function logout() {
  await requireAdmin({ allowPasswordChange: true });
  await signOut({ redirectTo: "/admin/login" });
}

export async function changePassword(_previous, formData) {
  try {
    const user = await requireAdmin({ allowPasswordChange: true });
    const data = z.object({ currentPassword: z.string().min(1).max(256), password: passwordSchema, confirmPassword: z.string() })
      .refine(value => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords must match." })
      .parse(Object.fromEntries(formData));
    if (!(await compare(data.currentPassword, user.passwordHash))) throw new UserError("The current password is incorrect.");
    if (await compare(data.password, user.passwordHash)) throw new UserError("Choose a different password.");
    const changed = await db.adminUser.updateMany({
      where: { id: user.id, sessionVersion: user.sessionVersion },
      data: { passwordHash: await hash(data.password, 12), mustChangePassword: false, sessionVersion: { increment: 1 }, failedLoginCount: 0, lockedUntil: null },
    });
    if (!changed.count) throw new UserError("Your account changed. Please sign in again.");
    return { ok: true, message: "Password changed. Please sign in again.", signInRequired: true };
  } catch (error) { return actionError(error); }
}

export async function addAdmin(_previous, formData) {
  try {
    await requireOwner();
    const data = z.object({ email: emailSchema, name: z.string().trim().min(1).max(100), role: z.enum(["OWNER", "EDITOR"]), password: passwordSchema }).parse(Object.fromEntries(formData));
    await db.adminUser.create({ data: { email: data.email, name: data.name, role: data.role, passwordHash: await hash(data.password, 12), mustChangePassword: true } });
    revalidatePath("/admin/users");
    return { ok: true, message: "Administrator added. Share the temporary password securely." };
  } catch (error) {
    if (error.code === "P2002") return { ok: false, error: "An administrator with that email already exists." };
    return actionError(error);
  }
}

export async function manageAdmin(_previous, formData) {
  try {
    const actor = await requireOwner();
    const data = z.discriminatedUnion("operation", [
      z.object({ operation: z.literal("remove"), id: z.string().cuid() }),
      z.object({ operation: z.literal("role"), id: z.string().cuid(), role: z.enum(["OWNER", "EDITOR"]) }),
      z.object({ operation: z.literal("reset"), id: z.string().cuid(), password: passwordSchema }),
    ]).parse(Object.fromEntries(formData));
    const passwordHash = data.operation === "reset" ? await hash(data.password, 12) : undefined;
    await serializable(db, async tx => {
      const currentActor = await tx.adminUser.findUnique({ where: { id: actor.id } });
      if (currentActor?.role !== "OWNER" || currentActor.sessionVersion !== actor.sessionVersion) throw new UserError("Please sign in again.", "FORBIDDEN", 403);
      const target = await tx.adminUser.findUnique({ where: { id: data.id } });
      if (!target) throw new UserError("Administrator not found.");
      if (target.role === "OWNER" && (data.operation === "remove" || data.operation === "role" && data.role !== "OWNER")) {
        if (await tx.adminUser.count({ where: { role: "OWNER" } }) <= 1) throw new UserError("The last owner cannot be removed or demoted.");
      }
      if (data.operation === "remove") await tx.adminUser.delete({ where: { id: data.id } });
      else await tx.adminUser.update({ where: { id: data.id }, data: data.operation === "reset"
        ? { passwordHash, mustChangePassword: true, sessionVersion: { increment: 1 }, failedLoginCount: 0, lockedUntil: null }
        : { role: data.role, sessionVersion: { increment: 1 } } });
    });
    revalidatePath("/admin/users");
    return { ok: true, message: "Administrator updated." };
  } catch (error) { return actionError(error); }
}
