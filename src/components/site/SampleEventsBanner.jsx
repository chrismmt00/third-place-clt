import Link from "next/link";

export function SampleEventsBanner() {
  return (
    <aside aria-label="Sample events preview" className="border-b border-border bg-warning-soft px-4 py-4 text-ink md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-content flex-col gap-2 text-sm">
        <p className="m-0"><strong>Sample events preview.</strong> These events, dates, venues and availability are fictional. RSVPs are disabled.</p>
        <nav aria-label="Preview navigation" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/?demo=1" className="inline-flex min-h-11 items-center font-bold underline focus-ring">Preview home</Link>
          <Link href="/events?demo=1" className="inline-flex min-h-11 items-center font-bold underline focus-ring">Preview events</Link>
          <Link href="/" className="inline-flex min-h-11 items-center underline focus-ring">Exit preview</Link>
        </nav>
      </div>
    </aside>
  );
}
