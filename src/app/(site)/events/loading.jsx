const bar = "block bg-surface-2";

export default function EventsLoading() {
  return (
    <div aria-busy="true" className="mx-auto flex max-w-content flex-col gap-5 px-4 pb-12 pt-7 md:px-8 md:pt-10 lg:gap-8 lg:px-12 lg:pt-14">
      <span className="sr-only">Loading events…</span>
      <span className={`${bar} h-9 w-[70%] rounded-sm md:w-[40%]`} />
      <span className={`${bar} h-[52px] rounded-md md:w-[220px]`} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`flex-col overflow-hidden rounded-lg border border-border bg-surface ${n > 2 ? "hidden lg:flex" : "flex"}`}>
            <span className="aspect-[16/10] bg-surface-2" />
            <div className="flex flex-col gap-2.5 p-5">
              <span className={`${bar} h-7 w-24 rounded-full`} />
              <span className={`${bar} h-4 w-[55%] rounded-[6px]`} />
              <span className={`${bar} h-6 w-[85%] rounded-[6px]`} />
              <span className={`${bar} h-4 w-[65%] rounded-[6px]`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
