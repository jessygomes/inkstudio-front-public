export default function AuthFeedback({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return <div className="space-y-2">{error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-3 text-xs leading-6 text-red-300">{error}</p>}{success && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-3 text-xs leading-6 text-emerald-300">{success}</p>}</div>;
}
