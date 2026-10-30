import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Copy, Check, ListChecks, Gavel, CalendarClock, Loader2, Mic, Square, UploadCloud, Globe, ChevronDown, FileText } from "lucide-react";
import { recordWav, transcribeFile } from "@/lib/audio";
import { createContext, useContext } from "react";
import { LANGS, T, isLang, type Lang } from "@/lib/i18n";
import { TermsConsentDialog, TermsViewDialog } from "@/components/terms-dialog";
import { TERMS_STORAGE_KEY, TERMS_VERSION } from "@/lib/terms";
const LangCtx = createContext<Lang>("ja");
const useT = () => T[useContext(LangCtx)];

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
      {ok ? useT().copied : useT().copy}
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

const Empty = () => <p className="text-sm text-muted-foreground">{useT().empty}</p>;

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function Processing({ stage, live }: { stage: "transcribe" | "summarize"; live: string }) {
  return (
    <div className="processing-overlay">
      <div className="orb"><span /><span /><span /></div>
      <p className="text-gradient mt-8 text-lg font-semibold tracking-tight">{useT().loadingTitle}</p>
      <div className="mt-4 flex items-center gap-3 font-mono text-[11px] tracking-widest">
        <span className={stage === "transcribe" ? "text-foreground" : "text-muted-foreground"}>01 TRANSCRIBE</span>
        <span className="h-px w-8 bg-border" />
        <span className={stage === "summarize" ? "text-foreground" : "text-muted-foreground"}>02 SUMMARIZE</span>
      </div>
      {live && <p className="mt-5 line-clamp-3 max-w-sm text-center text-xs text-muted-foreground">{live.slice(-140)}</p>}
    </div>
  );
}

function Index() {
  const [lang, setLangState] = useState<Lang>("ja");
  const t = T[lang];
  useEffect(() => { const v = localStorage.getItem("lang"); if (isLang(v)) setLangState(v); else { const n = navigator.language.slice(0, 2); if (isLang(n)) setLangState(n); } }, []);
  useEffect(() => { localStorage.setItem("lang", lang); document.documentElement.lang = lang; }, [lang]);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  useEffect(() => { setAccepted(localStorage.getItem(TERMS_STORAGE_KEY) === TERMS_VERSION); }, []);
  const acceptTerms = () => { localStorage.setItem(TERMS_STORAGE_KEY, TERMS_VERSION); setAccepted(true); };
  const locked = accepted !== true;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"transcribe" | "summarize" | null>(null);
  const [live, setLive] = useState("");
  const [error, setError] = useState("");
  const [r, setR] = useState<Result | null>(null);
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [level, setLevel] = useState(0);
  const [drag, setDrag] = useState(false);
  const recRef = useRef<{ stop: () => Promise<File> } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const summarize = async (input: string) => {
    if (locked) return;
    setLoading(true); setStage("summarize"); setError("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.error);
      setR(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false); setStage(null);
    }
  };

  const processAudio = async (file: File) => {
    setError(""); setR(null); setLive(""); setLoading(true); setStage("transcribe");
    try {
      const t = await transcribeFile(file, lang, setLive);
      setText(t);
      await summarize(t);
    } catch (e: any) {
      setError(e.message); setLoading(false); setStage(null);
    }
  };

  const onFile = (f?: File | null) => {
    if (!f || locked) return;
    if (!/\.(mp3|m4a|wav)$/i.test(f.name)) return setError(t.badFile);
    if (f.size > 24 * 1024 * 1024) return setError(t.tooBig);
    void processAudio(f);
  };

  const toggleRec = async () => {
    if (locked) return;
    setError("");
    if (recording) {
      setRecording(false);
      try {
        const f = await recRef.current!.stop();
        void processAudio(f);
      } catch (e: any) { setError(e.message); }
      return;
    }
    try {
      recRef.current = await recordWav((v) => setLevel(v));
      setSecs(0); setRecording(true);
    } catch {
      setError(t.noMic);
    }
  };

  const sumT = r?.summary.map((s) => `・${s}`).join("\n") ?? "";
  const decT = r?.decisions.map((s) => `・${s}`).join("\n") ?? "";
  const actT = r?.actions.map((a) => `・${a.task}（${t.owner}: ${a.owner} / ${t.due}: ${a.due}）`).join("\n") ?? "";

  return (
    <LangCtx.Provider value={lang}>
    <div className="aurora min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="logo-mark" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Minutes AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="nav-link" onClick={() => setTermsOpen(true)}>
              <FileText className="size-3.5" />
              利用規約
            </button>
            <label className="lang-select">
              <Globe className="size-3.5" />
              <select aria-label="Language" value={lang} onChange={(e) => setLangState(e.target.value as Lang)}>
                {(Object.keys(LANGS) as Lang[]).map((k) => <option key={k} value={k}>{LANGS[k].label}</option>)}
              </select>
              <ChevronDown className="size-3.5" />
            </label>
          </div>
        </nav>
        <TermsConsentDialog open={accepted === false} onAccept={acceptTerms} />
        <TermsViewDialog open={termsOpen && !locked} onOpenChange={setTermsOpen} />

        <div className="mb-10 max-w-2xl">
          <h1 className="text-gradient text-4xl font-semibold tracking-tight md:text-5xl">
            {t.title}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {t.sub}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="glass relative flex flex-col gap-4 overflow-hidden p-5">
            {stage && <Processing stage={stage} live={live} />}

            <button className={recording ? "btn-record is-recording" : "btn-record"} onClick={toggleRec} disabled={loading}>
              <span className="rec-dot" style={recording ? { transform: `scale(${1 + level * 1.5})` } : undefined} />
              {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
              {recording ? `${t.stop}  ${fmtTime(secs)}` : t.rec}
            </button>

            <div
              className={drag ? "dropzone is-drag" : "dropzone"}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); if (!loading && !recording) onFile(e.dataTransfer.files[0]); }}
              onClick={() => !loading && !recording && fileRef.current?.click()}
              role="button"
              aria-label="音声ファイルをアップロード"
            >
              <UploadCloud className="size-6 text-primary" />
              <p className="text-sm font-medium text-foreground">{t.drop}</p>
              <p className="text-xs text-muted-foreground">{t.dropSub}</p>
              <input ref={fileRef} type="file" accept=".mp3,.m4a,.wav,audio/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{t.transcript}</p>
              <p className="font-mono text-xs text-muted-foreground">{text.length.toLocaleString()}</p>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              className="input-area min-h-[200px] flex-1"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button className="btn-primary" onClick={() => summarize(text)} disabled={loading || recording || text.trim().length < 10}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? t.processing : t.summarize}
            </button>
          </div>

          <div className="space-y-5">
            <ResultCard icon={<ListChecks className="size-4" />} index="01" title={t.card1} copyText={sumT} loading={loading}>
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

            <ResultCard icon={<Gavel className="size-4" />} index="02" title={t.card2} copyText={decT} loading={loading}>
              {r ? (
                r.decisions.length ? (
                  <ul className="space-y-2.5">
                    {r.decisions.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />{s}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">{t.noDecisions}</p>
              ) : <Empty />}
            </ResultCard>

            <ResultCard icon={<CalendarClock className="size-4" />} index="03" title={t.card3} copyText={actT} loading={loading}>
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
                ) : <p className="text-sm text-muted-foreground">{t.noActions}</p>
              ) : <Empty />}
            </ResultCard>
          </div>
        </div>
      </div>
    </div>
    </LangCtx.Provider>
  );
}
