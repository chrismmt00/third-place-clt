const bar = "block bg-surface-2";

export default function EventLoading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading event…</span>
      <span className="block aspect-[16/10] bg-surface-2 lg:hidden" />
      <div className="mx-auto max-w-content lg:px-12 lg:pt-8">
        <span className={`${bar} hidden aspect-[21/8] rounded-[20px] lg:mb-7 lg:block`} />
        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-x-16">
          <div className="flex flex-col gap-3.5 px-4 pb-10 pt-6 md:px-8 lg:px-0 lg:pt-0">
            <span className={`${bar} h-7 w-24 rounded-full`} />
            <span className={`${bar} h-[34px] w-[90%] rounded-sm`} />
            <span className={`${bar} h-[34px] w-[60%] rounded-sm`} />
            <span className={`${bar} mt-2 h-[18px] w-[55%] rounded-[6px]`} />
            <span className={`${bar} h-[18px] w-[75%] rounded-[6px]`} />
          </div>
          <div className="px-4 pb-10 md:px-8 lg:px-0">
            <span className="block h-80 rounded-lg border border-border bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}
