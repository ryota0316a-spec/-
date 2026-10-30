import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";

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
        const { text } = (await request.json()) as { text?: string };
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
              "あなたは優秀なビジネスアシスタントです。会議・商談の書き起こしやメモを読み、日本語で簡潔に整理してください。summaryは要点の箇条書き(3〜6個)、decisionsは合意・決定した内容、actionsは次回アクション(task/owner/due)。担当者や期限が不明な場合は「未定」としてください。",
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
