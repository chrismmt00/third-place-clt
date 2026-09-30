"use client";

import { useEffect, useRef, useState } from "react";
import { FileWarning, FileX, Image as ImageIcon, ImagePlus, Info, RefreshCw, Download, Trash2 } from "lucide-react";
import { copy } from "@/content/copy";
import { cn } from "@/lib/cn";
import { Textarea } from "@/components/ui/Field";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Event photo picker. Gets a one-time upload URL from /api/admin/uploads/direct-url,
 * uploads the file straight to Cloudflare Images with progress, then reports the
 * image id. The whole drop zone is a labelled file input.
 *
 * value: { imageId, previewUrl } · onChange(next) · alt / onAltChange / altError
 */
export function ImageUploader({ id = "event-image", value, onChange, alt, onAltChange, altError, disabled }) {
  const [status, setStatus] = useState("idle"); // idle | dragging | uploading | error
  const [progress, setProgress] = useState(0);
  const [problem, setProblem] = useState(null); // { kind: type|size|service, title, detail }
  const [uploading, setUploading] = useState(null); // { name, size }
  const xhr = useRef(null);
  const input = useRef(null);
  const blobUrl = useRef(null);

  useEffect(
    () => () => {
      xhr.current?.abort();
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    },
    []
  );

  const fail = (kind, title, detail) => {
    setProblem({ kind, title, detail });
    setStatus("error");
  };

  const start = async (file) => {
    if (!file) return;
    if (!TYPES.includes(file.type)) return fail("type", copy.upload.type, `“${file.name}” isn't a supported image. Please use a JPG, PNG or WebP.`);
    if (file.size > MAX_BYTES) return fail("size", copy.upload.size, `It's ${mb(file.size)}. Photos need to be under 10 MB. Try exporting a smaller copy.`);

    setProblem(null);
    setUploading({ name: file.name, size: file.size });
    setProgress(0);
    setStatus("uploading");

    let target;
    try {
      const res = await fetch("/api/admin/uploads/direct-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      target = await res.json();
      if (!res.ok) return fail("service", "Uploads aren't available right now.", target?.error || "You can save the event without a photo and add one later.");
      if (!target.available) return fail("service", "Photo uploads aren't set up here.", target.message || "You can save the event without a photo.");
    } catch {
      return fail("service", "Couldn't start the upload.", "Check your connection and try again.");
    }

    const request = new XMLHttpRequest();
    xhr.current = request;
    request.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
    request.onerror = () => fail("service", "The upload didn't finish.", "Check your connection and try again.");
    request.onload = () => {
      xhr.current = null;
      if (request.status < 200 || request.status >= 300) return fail("service", "The upload didn't finish.", "Please try again.");
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
      blobUrl.current = URL.createObjectURL(file);
      setStatus("idle");
      onChange({ imageId: target.id, previewUrl: blobUrl.current });
    };
    const form = new FormData();
    form.append("file", file);
    request.open("POST", target.uploadURL);
    request.send(form);
  };

  const cancel = () => {
    xhr.current?.abort();
    xhr.current = null;
    setStatus("idle");
  };

  const hasImage = !!value.imageId && status !== "uploading";
  const fileInput = (
    <input
      ref={input}
      id={id}
      type="file"
      accept={TYPES.join(",")}
      disabled={disabled}
      className="sr-only"
      onChange={(e) => {
        start(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  if (status === "uploading") {
    return (
      <div className="flex h-[220px] flex-col justify-center gap-3 rounded-lg border-[1.5px] border-border bg-surface p-6">
        <span className="flex items-center gap-2.5 text-[15px] font-semibold">
          <ImageIcon size={20} aria-hidden="true" className="text-muted" />
          {uploading.name} · {mb(uploading.size)}
        </span>
        <span role="progressbar" aria-label="Uploading" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="block h-2 overflow-hidden rounded-full bg-surface-2">
          <span className="block h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
        </span>
        <span className="flex justify-between text-sm text-muted">
          <span aria-live="polite">Uploading… {progress}%</span>
          <button type="button" onClick={cancel} className="font-body text-sm font-bold text-primary underline focus-ring-surface">
            Cancel
          </button>
        </span>
      </div>
    );
  }

  if (hasImage) {
    return (
      <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)] md:items-start">
        <div className="flex flex-col gap-2.5">
          <div className="aspect-[16/10] overflow-hidden rounded-[10px] bg-surface-2">
            {value.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob or Cloudflare variant preview
              <img src={value.previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="photo-placeholder flex h-full items-end p-2.5">
                <span className="rounded bg-surface px-1.5 py-[3px] font-mono text-[11px] text-muted">current photo</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <label
              htmlFor={id}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-ink text-[15px] font-bold focus-within:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-focus)]",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-surface-2"
              )}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Replace
              {fileInput}
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ imageId: "", previewUrl: null })}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] font-body text-[15px] font-bold text-danger hover:bg-danger-soft focus-ring-surface"
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
        <Textarea
          id={`${id}-alt`}
          label="Describe the photo"
          rows={3}
          value={alt}
          onChange={(e) => onAltChange(e.target.value)}
          error={altError}
          helper="Read aloud by screen readers. Required when there's a photo."
          disabled={disabled}
        />
      </div>
    );
  }

  const error = status === "error" && problem;
  const ErrorIcon = problem?.kind === "size" ? FileWarning : problem?.kind === "type" ? FileX : Info;

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (status !== "dragging") setStatus("dragging");
      }}
      onDragLeave={() => setStatus(problem ? "error" : "idle")}
      onDrop={(e) => {
        e.preventDefault();
        start(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex h-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-5 text-center focus-within:shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-focus)]",
        status === "dragging"
          ? "border-2 border-primary bg-primary-soft text-primary-hover"
          : error
            ? error.kind === "service"
              ? "border-2 border-dashed border-border-strong bg-surface"
              : "border-2 border-danger bg-surface"
            : "border-2 border-dashed border-border-strong bg-surface"
      )}
    >
      {fileInput}
      {status === "dragging" ? (
        <>
          <Download size={32} aria-hidden="true" />
          <span className="text-lg font-bold">Drop to upload</span>
        </>
      ) : error ? (
        <>
          <ErrorIcon size={32} aria-hidden="true" className={error.kind === "service" ? "text-muted" : "text-danger"} />
          <span role="alert" className={cn("text-base font-bold", error.kind === "service" ? "text-ink" : "text-danger")}>
            {error.title}
          </span>
          <span className="text-sm text-muted">{error.detail}</span>
          <span className="text-[15px] font-bold text-primary underline">Choose a different file</span>
        </>
      ) : (
        <>
          <ImagePlus size={32} aria-hidden="true" className="text-accent" />
          <span className="text-base font-bold">
            Drag a photo here or <span className="text-primary underline">choose a file</span>
          </span>
          <span className="text-sm text-muted">JPG, PNG or WebP, up to 10 MB. Landscape works best.</span>
        </>
      )}
    </label>
  );
}
