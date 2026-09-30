import { manageMessage } from "@/app/actions/contact";
import { getAdminMessage, listAdminMessages } from "@/lib/admin-queries";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { MessagesView } from "@/components/admin/MessagesView";
import { guard } from "../../guard";

export const metadata = { title: "Messages" };

const STATUSES = ["NEW", "READ", "ARCHIVED"];
const PAGE_SIZE = 50;

const plain = (m) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  subject: m.subject,
  message: m.message,
  status: m.status,
  createdAt: m.createdAt.toISOString(),
});

export default async function MessagesPage({ searchParams }) {
  const params = await searchParams;
  const status = STATUSES.includes(params.status) ? params.status : "NEW";
  const q = typeof params.q === "string" ? params.q.slice(0, 200) : "";
  const id = typeof params.id === "string" ? params.id : null;

  const [lists, searched, selected] = await Promise.all([
    Promise.all(STATUSES.map((s) => guard(listAdminMessages({ status: s })))),
    q ? guard(listAdminMessages({ status, search: q })) : null,
    id ? guard(getAdminMessage(id)) : null,
  ]);
  const counts = Object.fromEntries(STATUSES.map((s, i) => [s, lists[i].length >= PAGE_SIZE ? `${PAGE_SIZE}+` : lists[i].length]));
  const messages = searched ?? lists[STATUSES.indexOf(status)];

  return (
    <>
      <MobileTopBar title="Messages" />
      <main className="flex min-h-[calc(100dvh-60px)] flex-col gap-5 md:px-8 md:py-6 lg:h-dvh lg:min-h-0 lg:px-12 lg:py-9">
        <h1 className="sr-only m-0 font-display text-[36px] leading-[42px] font-extrabold md:not-sr-only">Messages</h1>
        <MessagesView
          key={`${status}-${q}`}
          messages={messages.map(plain)}
          counts={counts}
          status={status}
          q={q}
          selected={selected ? plain(selected) : null}
          action={manageMessage}
        />
      </main>
    </>
  );
}
