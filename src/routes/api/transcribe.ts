import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 24 * 1024 * 1024;
const OK_EXT = /\.(mp3|m4a|wav|webm|mp4|mpeg|mpga|ogg)$/i;

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const len = Number(request.headers.get("content-length") || 0);
        if (len > MAX_BYTES + 1024 * 1024)
          return Response.json({ error: "ファイルが大きすぎます（最大24MB）。" }, { status: 413 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AIの設定が見つかりません。" }, { status: 500 });

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || !file.size)
          return Response.json({ error: "音声ファイルが空です。" }, { status: 400 });
        if (file.size > MAX_BYTES)
          return Response.json({ error: "ファイルが大きすぎます（最大24MB）。" }, { status: 413 });
        if (!file.type.startsWith("audio/") && !OK_EXT.test(file.name))
          return Response.json({ error: "mp3 / m4a / wav ファイルを選んでください。" }, { status: 400 });

        const type = file.type.startsWith("audio/") ? file.type : "audio/mp4";
        const upstream = new FormData();
        upstream.append("model", "openai/gpt-transcribe");
        upstream.append("file", new File([file], file.name, { type }), file.name);
        upstream.append("response_format", "json");
        upstream.append("stream", "true");
        upstream.append("languages", "ja");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: upstream,
          signal: request.signal,
        });
        return new Response(res.body, {
          status: res.status,
          headers: { "Content-Type": res.headers.get("content-type") ?? "text/event-stream" },
        });
      },
    },
  },
});
