const StatCard = ({ title, value, accent = "bg-sky-500" }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className={`mb-3 h-1.5 w-14 rounded ${accent}`} />
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
  </article>
);

export default StatCard;
