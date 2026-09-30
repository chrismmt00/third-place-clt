import { ArrowRight } from "lucide-react";
import { copy } from "@/content/copy";
import { Button } from "@/components/ui/Button";

/** 404 body: big number, headline, two ways back. */
export function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-content flex-col gap-4 px-4 pb-[72px] pt-16 md:px-8 lg:items-start lg:gap-5 lg:px-12 lg:pb-[140px] lg:pt-[120px]">
      <span className="font-display text-[80px] leading-[76px] font-extrabold text-primary lg:text-[120px] lg:leading-[110px] lg:tracking-[-0.04em]">404</span>
      <h1 className="m-0 font-display text-[34px] leading-[38px] font-extrabold lg:text-4xl lg:tracking-[-0.03em]">{copy.notFound.title}</h1>
      <p className="m-0 max-w-[560px] text-[17px] leading-[26px] text-muted lg:text-lg">
        <span className="lg:hidden">{copy.notFound.body}</span>
        <span className="hidden lg:inline">{copy.notFound.bodyLong}</span>
      </p>
      <div className="mt-2 flex flex-col gap-2.5 lg:flex-row lg:gap-3">
        <Button href="/events" size="xl" iconRight={ArrowRight}>
          {copy.home.cta}
        </Button>
        <Button href="/" variant="secondary" size="xl">
          Back to home
        </Button>
      </div>
    </div>
  );
}
