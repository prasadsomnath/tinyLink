export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded-xl border px-3 py-2" {...props} />;
}
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="rounded-xl border px-3 py-2 disabled:opacity-60" {...props} />;
}
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border p-4 shadow-sm">{children}</div>;
}
