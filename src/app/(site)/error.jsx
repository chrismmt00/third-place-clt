"use client";

import { useEffect } from "react";
import { PlugZap, RotateCw } from "lucide-react";
import { copy } from "@/content/copy";
import { Button } from "@/components/ui/Button";

export default function SiteError({ error, retry }) {
  useEffect(() => {
    console.error("A public page could not be rendered.");
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-4 px-4 pb-[72px] pt-16 md:px-8 lg:pb-[140px] lg:pt-[120px]">
      <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-soft text-warning">
        <PlugZap size={30} />
      </span>
      <h1 className="m-0 font-display text-[34px] leading-[38px] font-extrabold lg:text-3xl">{copy.error.title}</h1>
      <p className="m-0 text-[17px] leading-[26px] text-muted">It&apos;s not you. Give it a moment and try again.</p>
      <div className="mt-2 flex flex-col gap-2.5 md:flex-row md:gap-3">
        <Button size="xl" icon={RotateCw} onClick={() => retry()}>
          Try again
        </Button>
        <Button href="/" variant="secondary" size="xl">
          Back to home
        </Button>
      </div>
    </div>
  );
}
