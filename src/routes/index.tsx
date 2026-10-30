import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Copy, Check, ListChecks, Gavel, CalendarClock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minutes AI — 商談・会議AI要約" },
      { name: "description", content: "会議メモや書き起こしを貼り付けるだけで、要約・決定事項・次回アクションをAIが整理。" },
      { property: "og:title", content: "Minutes AI — 商談・会議AI要約" },
      { property: "og:description", content: "要約・決定事項・次回アクションを数秒で。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Result = {
  summary: string[];
  decisions: string[];
  actions: { task: string; owner: string; due: string }[];
};

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="btn-ghost"
      disabled={!text}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
    >
      {ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {ok ? "コピー済み" : "コピー"}
    </button>
  );
}

function ResultCard({
  icon, title, index, copyText, children, loading,
}: {
  icon: React.ReactNode; title: string; index: string; copyText: string;
  children: React.ReactNode; loading: boolean;
}) {
  return (
    <section className="glass p-6">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="icon-chip">{icon}</span>
          <div>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{index}</p>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          </div>
        </div>
        <CopyBtn text={copyText} />
      </header>
      {loading ? (
        <div className="space-y-2">
          {[80, 65, 72].map((w) => (
            <div key={w} className="shimmer h-3 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

const Empty = () => <p className="text-sm text-muted-foreground">要約するとここに表示されます。</p>;

function Index() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [r, setR] = useState<Result | null>(null);

  const run = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました。");
      setR(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sumT = r?.summary.map((s) => `・${s}`).join("\n") ?? "";
  const decT = r?.decisions.map((s) => `・${s}`).join("\n") ?? "";
  const actT = r?.actions.map((a) => `・${a.task}（担当: ${a.owner} / 期限: ${a.due}）`).join("\n") ?? "";

  return (
    <div className="aurora min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="logo-mark" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Minutes AI</span>
          </div>
          <span className="pill">Beta</span>
        </nav>

        <div className="mb-10 max-w-2xl">
          <h1 className="text-gradient text-4xl font-semibold tracking-tight md:text-5xl">
            会議を、数秒で意思決定に。
          </h1>
          <p className="mt-3 text-muted-foreground">
            書き起こしやメモを貼り付けるだけ。要点・決定事項・次のアクションをAIが整理します。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="glass flex flex-col p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-h-[720px]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">TRANSCRIPT</p>
              <p className="font-mono text-xs text-muted-foreground">{text.length.toLocaleString()} 文字</p>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ここに会議のメモや書き起こしテキストを貼り付けてください…"
              className="input-area min-h-[360px] flex-1"
            />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <button className="btn-primary mt-4" onClick={run} disabled={loading || text.trim().length < 10}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "要約中…" : "AIで要約する"}
            </button>
          </div>

          <div className="space-y-5">
            <ResultCard icon={<ListChecks className="size-4" />} index="01" title="概要・要約" copyText={sumT} loading={loading}>
              {r ? (
                <ul className="space-y-2.5">
                  {r.summary.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                      <span className="dot" />{s}
                    </li>
                  ))}
                </ul>
              ) : <Empty />}
            </ResultCard>

            <ResultCard icon={<Gavel className="size-4" />} index="02" title="決定事項" copyText={decT} loading={loading}>
              {r ? (
                r.decisions.length ? (
                  <ul className="space-y-2.5">
                    {r.decisions.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />{s}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">決定事項はありません。</p>
              ) : <Empty />}
            </ResultCard>

            <ResultCard icon={<CalendarClock className="size-4" />} index="03" title="次回アクション" copyText={actT} loading={loading}>
              {r ? (
                r.actions.length ? (
                  <div className="divide-y divide-border">
                    {r.actions.map((a, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
                        <span className="text-foreground/90">{a.task}</span>
                        <span className="pill">{a.owner}</span>
                        <span className="font-mono text-xs text-muted-foreground">{a.due}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">アクションはありません。</p>
              ) : <Empty />}
            </ResultCard>
          </div>
        </div>
      </div>
    </div>
  );
}
