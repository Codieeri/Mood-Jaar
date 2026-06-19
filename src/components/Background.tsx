export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-blob absolute -left-24 top-6 h-72 w-72 rounded-full bg-fuchsia-300/45 blur-3xl dark:bg-fuchsia-700/25" />
      <div
        className="animate-blob absolute right-[-60px] top-1/3 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl dark:bg-indigo-700/25"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="animate-blob absolute bottom-[-40px] left-1/4 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-700/15"
        style={{ animationDelay: "-13s" }}
      />
      <div
        className="animate-blob absolute right-1/4 top-10 h-56 w-56 rounded-full bg-violet-300/35 blur-3xl dark:bg-violet-700/25"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="animate-blob absolute bottom-1/4 right-10 h-64 w-64 rounded-full bg-rose-300/30 blur-3xl dark:bg-rose-800/20"
        style={{ animationDelay: "-16s" }}
      />
    </div>
  );
}
