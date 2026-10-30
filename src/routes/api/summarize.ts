import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { LANGS, isLang } from "@/lib/i18n";

const schema = z.object({
  summary: z.array(z.string()),
  decisions: z.array(z.string()),
  actions: z.array(
    z.object({ task: z.string(), owner: z.string(), due: z.string() }),
  ),
});

export const Route = createFileRoute("/api/summarize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, lang: l } = (await request.json()) as { text?: string; lang?: string };
        const L = LANGS[isLang(l) ? l : "ja"];
        if (!text || text.trim().length < 10)
          return Response.json({ error: "テキストが短すぎます。" }, { status: 400 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AIの設定が見つかりません。" }, { status: 500 });

        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        try {
          const result = streamText({
            model: provider.responses("openai/gpt-6-astra"),
            system:
              `You are an excellent business assistant. Read the meeting/sales-call transcript or notes and organize them concisely. Write ALL output strictly in ${L.ai}, regardless of the transcript's language. summary: 3-6 key bullet points; decisions: what was agreed; actions: next tasks (task/owner/due). If an owner or due date is unknown, use "${L.tbd}".`,
            prompt: text.slice(0, 60000),
            output: Output.object({ schema }),
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "low",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
          });
          const output = await result.output;
          return Response.json(output);
        } catch (e: any) {
          const status = e?.statusCode ?? 500;
          const msg =
            status === 429
              ? "リクエストが集中しています。少し待って再度お試しください。"
              : status === 402
                ? "AIクレジットが不足しています。"
                : "要約に失敗しました。もう一度お試しください。";
          return Response.json({ error: msg }, { status });
        }
      },
    },
  },
});
