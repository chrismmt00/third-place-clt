"use client";

import { useEffect } from "react";
import { PlugZap, RotateCw } from "lucide-react";
import { copy } from "@/content/copy";
import { Button } from "@/components/ui/Button";

export default function AdminError({ error, retry }) {
  useEffect(() => {
    console.error("An admin page could not be rendered.");
  }, [error]);

  return (
    <main className="flex max-w-[560px] flex-col gap-4 px-4 py-12 md:px-8 lg:px-12">
      <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-soft text-warning">
        <PlugZap size={30} />
      </span>
      <h1 className="m-0 font-display text-[28px] leading-[34px] font-extrabold">{copy.error.title}</h1>
      <p className="m-0 text-base text-muted">This part of the portal couldn&apos;t load. Give it a moment and try again.</p>
      <div className="flex flex-col gap-2.5 md:flex-row">
        <Button icon={RotateCw} onClick={() => retry()}>
          Try again
        </Button>
        <Button href="/admin" variant="secondary">
          Back to overview
        </Button>
      </div>
    </main>
  );
}
