import { createParser } from "eventsource-parser";

export function encodeWav(chunks: readonly Float32Array[], sampleRate: number): Blob {
  const length = chunks.reduce((s, c) => s + c.length, 0);
  const bytes = new ArrayBuffer(44 + length * 2);
  const view = new DataView(bytes);
  const tag = (o: number, v: string) => { for (let i = 0; i < v.length; i++) view.setUint8(o + i, v.charCodeAt(i)); };
  tag(0, "RIFF"); view.setUint32(4, 36 + length * 2, true); tag(8, "WAVE"); tag(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); tag(36, "data");
  view.setUint32(40, length * 2, true);
  let o = 44;
  for (const c of chunks) for (const v of c) {
    const s = Math.max(-1, Math.min(1, v));
    view.setInt16(o, s * (s < 0 ? 32768 : 32767), true); o += 2;
  }
  return new Blob([bytes], { type: "audio/wav" });
}

/** Records mic audio as WAV (16kHz mono to stay small). onLevel reports 0..1 volume. */
export async function recordWav(onLevel?: (v: number) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext({ sampleRate: 16000 });
  await ctx.resume();
  const source = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  node.onaudioprocess = (e) => {
    const d = e.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(d));
    if (onLevel) { let m = 0; for (const x of d) m = Math.max(m, Math.abs(x)); onLevel(m); }
  };
  source.connect(node); node.connect(ctx.destination);
  return {
    async stop(): Promise<File> {
      stream.getTracks().forEach((t) => t.stop());
      node.disconnect(); source.disconnect(); node.onaudioprocess = null;
      const blob = encodeWav(chunks, ctx.sampleRate);
      await ctx.close();
      if (blob.size < 8000) throw new Error("録音が短すぎます。もう一度録音してください。");
      return new File([blob], "recording.wav", { type: "audio/wav" });
    },
  };
}

export async function transcribeFile(file: File, onDelta?: (t: string) => void): Promise<string> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  const res = await fetch("/api/transcribe", { method: "POST", body: fd });
  if (!res.ok || !res.body) {
    let msg = "文字起こしに失敗しました。";
    try { const j = await res.json(); msg = j.error?.message ?? j.error ?? j.message ?? msg; } catch {}
    throw new Error(String(msg));
  }
  let text = "", final = "", err = "";
  const parser = createParser({
    onEvent(ev) {
      try {
        const d = JSON.parse(ev.data);
        if (d.type === "transcript.text.delta") { text += d.delta ?? ""; onDelta?.(text); }
        else if (d.type === "transcript.text.done") final = d.text ?? text;
        else if (d.type === "error" || d.error) err = d.error?.message ?? d.message ?? "文字起こしエラー";
      } catch {}
    },
  });
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) { const { done, value } = await reader.read(); if (done) break; parser.feed(value); }
  if (err) throw new Error(err);
  const out = (final || text).trim();
  if (!out) throw new Error("音声から文字を認識できませんでした。");
  return out;
}
