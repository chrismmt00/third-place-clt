"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Copy, Info, KeyRound, RefreshCw, UserMinus, UserPlus, X } from "lucide-react";
import { copy } from "@/content/copy";
import { formatShortDate } from "@/lib/format";
import { isEmail } from "@/lib/validate";
import { cn } from "@/lib/cn";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { initials, roleLabel } from "./AdminShell";
import { useAction } from "./useAction";

const WORDS = ["maple", "lantern", "porch", "cedar", "willow", "harbor", "meadow", "copper", "ember", "river", "juniper", "saffron", "thistle", "birch", "violet", "orchard", "sparrow", "clover", "pepper", "canyon"];

/** Readable temporary password like "maple-lantern-72" (12+ characters). */
function temporaryPassword() {
  const n = new Uint32Array(3);
  crypto.getRandomValues(n);
  const a = WORDS[n[0] % WORDS.length];
  const b = WORDS[(n[1] % (WORDS.length - 1) + 1 + WORDS.indexOf(a)) % WORDS.length];
  return `${a}-${b}-${10 + (n[2] % 90)}`;
}

function PasswordBox({ value }) {
  const toast = useToast();
  return (
    <span className="flex h-[52px] items-center justify-between gap-2 rounded-[10px] bg-surface-2 pl-4 pr-2 font-mono text-lg">
      <span className="truncate">{value}</span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            toast({ tone: "info", title: "Copied.", body: "Paste it into a private message." });
          } catch {
            toast({ tone: "error", title: "Couldn't copy.", body: "Select the password and copy it by hand." });
          }
        }}
        className="inline-flex h-10 flex-none items-center gap-1.5 rounded-[8px] border-[1.5px] border-ink bg-surface px-3 font-body text-sm font-bold text-ink focus-ring-surface"
      >
        <Copy size={16} aria-hidden="true" />
        Copy
      </button>
    </span>
  );
}

/** Slide-over panel (full screen on phones) to add a person with a temporary password. */
function AddUserPanel({ onClose, onAdded, addAction }) {
  const [run, pending] = useAction(addAction);
  const [values, setValues] = useState(() => ({ name: "", email: "", role: "EDITOR", password: temporaryPassword() }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const panel = useRef(null);
  const closeRef = useRef(onClose);
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const first = values.name.trim().split(/\s+/)[0] || "them";

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    panel.current?.querySelector("input")?.focus();
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = copy.err.name;
    if (!isEmail(values.email)) found.email = copy.err.email;
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;
    const result = await run(values);
    if (result.ok) onAdded({ name: values.name.trim(), password: values.password });
    else if (result.fields) setErrors(result.fields);
    else setFormError(result.error);
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-scrim" onClick={onClose} />
      <form
        ref={panel}
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-user-title"
        className="absolute inset-y-0 right-0 flex w-full flex-col gap-[18px] overflow-y-auto border-l border-border bg-surface p-5 shadow-lg md:w-[420px] md:p-7"
      >
        <div className="flex items-center justify-between">
          <h2 id="add-user-title" className="m-0 font-display text-2xl font-bold">
            Add a user
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-md focus-ring-surface">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {formError && <Alert tone="error">{formError}</Alert>}
        <Input id="add-name" label="Name" autoComplete="off" value={values.name} onChange={set("name")} error={errors.name} disabled={pending} />
        <Input id="add-email" type="email" label="Email" autoComplete="off" value={values.email} onChange={set("email")} error={errors.email} disabled={pending} />
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 text-[15px] font-bold">Role</legend>
          {[
            ["EDITOR", "Admin", "Events, RSVPs, messages and settings."],
            ["OWNER", "Owner", "Everything, including adding and removing users."],
          ].map(([role, label, description]) => (
            <label key={role} className="flex min-h-11 cursor-pointer items-start gap-3">
              <input type="radio" name="role" value={role} checked={values.role === role} onChange={set("role")} disabled={pending} className="mt-0.5 h-5 w-5 focus-ring-surface" />
              <span>
                <strong className="text-base">{label}</strong>
                <br />
                <span className="text-sm text-muted">{description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between text-[15px] font-bold">
            Temporary password
            <button
              type="button"
              onClick={() => setValues((v) => ({ ...v, password: temporaryPassword() }))}
              className="inline-flex min-h-11 items-center gap-1.5 font-body text-sm font-bold text-primary focus-ring-surface"
            >
              <RefreshCw size={14} aria-hidden="true" />
              New one
            </button>
          </span>
          <PasswordBox value={values.password} />
          {errors.password && <span className="text-sm font-semibold text-danger">{errors.password}</span>}
        </div>
        <p className="m-0 rounded-md bg-accent-soft px-3.5 py-3 text-sm text-accent">
          Share this password with {first} privately. They&apos;ll choose their own the first time they sign in.
        </p>
        <Button type="submit" size="tall" loading={pending} loadingText="Adding…" icon={UserPlus} className="mt-auto">
          Add user
        </Button>
      </form>
    </div>
  );
}

/** Owners-only list of portal users. users come from listAdminUsers(). */
export function UsersView({ users, currentUserId, addAction, manageAction }) {
  const router = useRouter();
  const toast = useToast();
  const [manage, pending] = useAction(manageAction);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [issued, setIssued] = useState(null); // { title, name, password, note }
  const owners = users.filter((u) => u.role === "OWNER").length;

  const reset = async (user) => {
    const password = temporaryPassword();
    const result = await manage({ id: user.id, operation: "reset", password });
    if (result.ok) setIssued({ title: `Temporary password for ${user.name.split(/\s+/)[0]}`, password, note: "Share it with them directly. They'll be asked to choose a new one when they sign in, and they've been signed out everywhere. This won't be shown again." });
    else toast({ tone: "error", title: "Couldn't reset the password.", body: result.error });
  };

  const remove = async () => {
    const result = await manage({ id: removing.id, operation: "remove" });
    const name = removing.name;
    setRemoving(null);
    if (result.ok) {
      toast({ tone: "success", title: `${name} removed.`, body: "" });
      router.refresh();
    } else toast({ tone: "error", title: "Couldn't remove them.", body: result.error });
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-display text-[28px] leading-[34px] font-extrabold md:text-[36px] md:leading-[42px]">Users</h1>
          <span className="text-[15px] text-muted">Owners can manage users. Admins can do everything else.</span>
        </div>
        <Button icon={UserPlus} onClick={() => setAdding(true)}>
          Add user
        </Button>
      </div>

      <div className="flex max-w-[760px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
        {users.map((u) => {
          const lastOwner = u.role === "OWNER" && owners <= 1;
          return (
            <div key={u.id} className="grid gap-3 border-b border-border px-4 py-4 md:grid-cols-[minmax(0,1fr)_90px_150px_auto] md:items-center md:gap-4 md:px-5">
              <span className="flex min-w-0 items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                  {initials(u.name)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <strong className="text-base">
                    {u.name}
                    {u.id === currentUserId && <span className="font-medium text-muted"> (you)</span>}
                  </strong>
                  <span className="truncate text-sm text-muted">{u.email}</span>
                </span>
              </span>
              <span className="text-sm font-bold">{roleLabel(u.role)}</span>
              <span className="text-sm text-muted">{u.mustChangePassword ? "Hasn't set a password yet" : `Added ${formatShortDate(u.createdAt)}`}</span>
              <span className="flex gap-1.5 md:justify-end">
                <button
                  type="button"
                  onClick={() => reset(u)}
                  disabled={pending}
                  className="inline-flex h-11 items-center gap-1.5 rounded-[10px] border-[1.5px] border-border bg-surface px-3 font-body text-sm font-bold text-ink hover:bg-surface-2 focus-ring-surface"
                >
                  <KeyRound size={16} aria-hidden="true" />
                  Reset password
                </button>
                <button
                  type="button"
                  onClick={() => setRemoving(u)}
                  disabled={pending || lastOwner}
                  aria-describedby={lastOwner ? "last-owner-note" : undefined}
                  className={cn(
                    "inline-flex h-11 items-center gap-1.5 rounded-[10px] border-[1.5px] border-border bg-surface px-3 font-body text-sm font-bold focus-ring-surface",
                    lastOwner ? "cursor-not-allowed text-muted" : "text-danger hover:bg-danger-soft"
                  )}
                >
                  <UserMinus size={16} aria-hidden="true" />
                  Remove
                </button>
              </span>
            </div>
          );
        })}
        <p id="last-owner-note" className="m-0 flex items-center gap-2 bg-surface-2 px-5 py-3.5 text-sm text-muted">
          <Info size={16} aria-hidden="true" className="flex-none" />
          {copy.users.lastOwner}
        </p>
      </div>

      {adding && (
        <AddUserPanel
          addAction={addAction}
          onClose={() => setAdding(false)}
          onAdded={({ name, password }) => {
            setAdding(false);
            setIssued({ title: `${name} can sign in now`, password, note: "Share this temporary password with them privately. They'll choose their own the first time they sign in. This won't be shown again." });
            router.refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        destructive
        title={removing ? copy.confirm.removeUser(removing.name) : ""}
        confirmLabel="Remove user"
        cancelLabel={removing ? `Keep ${removing.name.split(/\s+/)[0]}` : "Keep"}
        busy={pending}
        busyLabel="Removing…"
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      >
        <p className="m-0">They&apos;ll be signed out right away and won&apos;t be able to sign in again. Events they created stay put.</p>
      </ConfirmDialog>

      <ConfirmDialog open={!!issued} title={issued?.title} confirmLabel="Done" cancelLabel={null} onCancel={() => setIssued(null)} onConfirm={() => setIssued(null)}>
        {issued && (
          <>
            <PasswordBox value={issued.password} />
            <p className="m-0 text-[15px] leading-[22px] text-muted">{issued.note}</p>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
