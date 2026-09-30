import { privacy } from "@/content/site";
import { loadSettings } from "../site-data";

export const metadata = {
  title: "Privacy",
  description: "What Third Place CLT collects, why, who can see it and how long it's kept.",
};

export default async function PrivacyPage() {
  const { contactEmail } = await loadSettings();

  return (
    <div className="mx-auto flex max-w-[776px] flex-col gap-6 px-4 pb-12 pt-8 md:px-8 lg:gap-8 lg:px-12 lg:pb-24 lg:pt-[72px]">
      <div className="flex flex-col gap-2.5 lg:gap-3">
        <h1 className="m-0 font-display text-[38px] leading-[42px] font-extrabold lg:text-4xl lg:tracking-[-0.03em]">Privacy</h1>
        <p className="m-0 text-[15px] text-muted lg:text-base">{privacy.updated}</p>
        {/* [CLIENT COPY] Remove once the policy has been reviewed. */}
        <p className="m-0 rounded-md bg-warning-soft px-4 py-3.5 text-[15px] leading-[22px] text-warning">
          <strong>[CLIENT COPY]</strong> Plain-language draft based on how the site works. Have it reviewed before launch.
        </p>
        <p className="m-0 text-lg lg:text-xl lg:leading-8">{privacy.lede}</p>
      </div>
      {privacy.sections.map(([heading, body]) => (
        <section key={heading} className="flex flex-col gap-2 lg:gap-3">
          <h2 className="m-0 font-display text-xl leading-7 font-bold lg:text-[26px] lg:leading-8">{heading}</h2>
          <p className="m-0 text-[17px] leading-7 lg:text-lg lg:leading-[30px]">
            {body}
            {heading === "Questions" && contactEmail && (
              <>
                {" "}
                Write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
              </>
            )}
          </p>
        </section>
      ))}
    </div>
  );
}
