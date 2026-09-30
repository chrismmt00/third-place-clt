import { Fragment } from "react";

// Renders the small Markdown subset the event form allows: paragraphs, ### headings,
// "- " lists, **bold** and [links](https://…). Builds React elements, never raw HTML.

function inline(text, keyPrefix) {
  const out = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${keyPrefix}-b${i++}`}>{m[1]}</strong>);
    else out.push(<a key={`${keyPrefix}-a${i++}`} href={m[3]}>{m[2]}</a>);
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function blocks(source) {
  const lines = (source || "").replace(/\r\n/g, "\n").split("\n");
  const result = [];
  let para = [];
  let list = [];
  const flushPara = () => {
    if (para.length) result.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  const flushList = () => {
    if (list.length) result.push({ type: "ul", items: list });
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
    } else if (/^#{1,3}\s+/.test(line)) {
      flushPara();
      flushList();
      result.push({ type: "h3", text: line.replace(/^#{1,3}\s+/, "") });
    } else if (/^[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return result;
}

/** classNames: { p, h3, ul } per-element classes. */
export function Markdown({ source, classNames = {} }) {
  return (
    <>
      {blocks(source).map((b, i) => (
        <Fragment key={i}>
          {b.type === "p" && <p className={classNames.p}>{inline(b.text, i)}</p>}
          {b.type === "h3" && <h3 className={classNames.h3}>{inline(b.text, i)}</h3>}
          {b.type === "ul" && (
            <ul className={classNames.ul}>
              {b.items.map((item, j) => (
                <li key={j}>{inline(item, `${i}-${j}`)}</li>
              ))}
            </ul>
          )}
        </Fragment>
      ))}
    </>
  );
}
