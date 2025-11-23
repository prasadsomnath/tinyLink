// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Button, Card, Input } from "@/components/ui";

type Link = {
  id: string; code: string; targetUrl: string;
  totalClicks: number; lastClicked: string | null;
  createdAt: string; deletedAt: string | null;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [targetUrl, setTargetUrl] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!links) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return links;
    return links.filter(l =>
      l.code.toLowerCase().includes(q) ||
      l.targetUrl.toLowerCase().includes(q)
    );
  }, [links, filter]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/links");
    if (!res.ok) { setErr("Failed to load"); setLoading(false); return; }
    setLinks(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ targetUrl, code: code || undefined }),
      });
      if (res.status === 409) throw new Error("Code already exists");
      if (!res.ok) throw new Error("Create failed");
      setTargetUrl(""); setCode("");
      await load();
    } catch (e:any) {
      setErr(e.message);
    } finally { setSubmitting(false); }
  }

  async function onDelete(code: string) {
    if (!confirm(`Delete code "${code}"?`)) return;
    const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
    if (!res.ok) { alert("Delete failed"); return; }
    await load();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-sm">Target URL</label>
            <Input
              placeholder="https://example.com/docs"
              value={targetUrl}
              onChange={e=>setTargetUrl(e.target.value)}
              required
              type="url"
            />
          </div>
          <div>
            <label className="text-sm">Custom code (6–8 a-z A-Z 0-9)</label>
            <Input placeholder="optional" value={code} onChange={e=>setCode(e.target.value)} />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <Button disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            {err && <span className="text-red-600">{err}</span>}
          </div>
        </form>
      </Card>

      <div className="flex items-center gap-2">
        <Input placeholder="Search by code or URL" value={filter} onChange={e=>setFilter(e.target.value)} />
        <Button onClick={()=>setFilter("")}>Clear</Button>
      </div>

      <Card>
        {loading && <p>Loading...</p>}
        {!loading && filtered.length === 0 && <p>No links yet.</p>}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b">
                  <th className="py-2">Short code</th>
                  <th className="py-2">Target URL</th>
                  <th className="py-2">Total clicks</th>
                  <th className="py-2">Last clicked</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-b">
                    <td className="py-2">
                      <a className="underline" href={`/code/${l.code}`}>{l.code}</a>
                    </td>
                    <td className="py-2 max-w-[280px] truncate" title={l.targetUrl}>{l.targetUrl}</td>
                    <td className="py-2">{l.totalClicks}</td>
                    <td className="py-2">
                      {l.lastClicked ? dayjs(l.lastClicked).format("YYYY-MM-DD HH:mm") : "—"}
                    </td>
                    <td className="py-2 space-x-2">
                      <button className="underline" onClick={()=>copy(`${window.location.origin}/${l.code}`)}>Copy</button>
                      <button className="underline text-red-600" onClick={()=>onDelete(l.code)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
