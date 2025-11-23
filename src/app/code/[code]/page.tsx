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
