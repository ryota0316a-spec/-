import type { Lang } from "@/lib/i18n";

export type TermsSection = { heading: string; body: string[] };

const JA: { title: string; sections: TermsSection[] } = {
  title: "利用規約（Terms of Service）",
  sections: [
    {
      heading: "第1条（適用）",
      body: [
        "本規約は、本サービス（会議録音・AI要約ツール）の提供条件および本サービスの利用に関する運営者と利用ユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されます。",
      ],
    },
    {
      heading: "第2条（サービス内容）",
      body: [
        "本サービスは、ユーザーが入力または録音した音声・テキストデータをAI（人工知能）技術を用いて文字起こしし、要約・タスク抽出を行うB2B向けSaaSプロダクトです。",
      ],
    },
    {
      heading: "第3条（アカウント登録・初回同意）",
      body: [
        "1. ユーザーは、本規約およびプライバシーポリシーに同意の上、本サービスを利用するものとします。",
        "2. アプリの初回起動時または利用開始時に提示される同意画面において「同意する」を選択した時点で、本規約に有効な同意をしたものとみなします。",
      ],
    },
    {
      heading: "第4条（免責事項・保証の否認）",
      body: [
        "1. 本サービスはAI技術を利用して要約を自動生成するものであり、生成結果の正確性、完全性、最新性、有用性、および特定目的への適合性を保証するものではありません。",
        "2. 本サービスの利用、またはシステム障害・一時中断等によってユーザーに生じた直接的・間接的な損害（データの消失、機会損失、営業損害等を含む）について、運営者は理由のいかんを問わず一切の責任を負いません。",
      ],
    },
    {
      heading: "第5条（データおよび機密情報の取り扱い）",
      body: [
        "1. ユーザーが録音・送信した音声データおよびテキストデータは、本サービスの提供（文字起こし・要約処理）の目的にのみ使用されます。",
        "2. 運営者は、ユーザーの事前の同意なく、送信されたデータをAIの公開学習データとして利用したり、第三者に開示・提供したりすることはありません。",
      ],
    },
    {
      heading: "第6条（禁止事項）",
      body: [
        "ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。",
        "1. 法令または公序良俗に反する行為、または犯罪行為に関連する行為",
        "2. 他者のプライバシー権、著作権、その他の知的財産権を侵害する音声・データの送信",
        "3. 本サービスのサーバーまたはネットワークに過度な負荷をかける行為（不正な自動アクセス、リバースエンジニアリング等）",
        "4. 本サービスのアカウントまたは利用権限を第三者に譲渡、売買、貸与する行為",
      ],
    },
    {
      heading: "第7条（利用料金および決済）",
      body: [
        "1. 本サービスの利用料金は、別途提示する料金プラン（月額5,000円等）に基づき、運営者が指定する決済手段（Stripe等）を通じて支払うものとします。",
        "2. 無料体験期間（7日間等）を除き、すでに支払われた利用料金の返金には応じかねます。",
        "3. ユーザーはいつでも本サービスの利用契約を解約することができます。解約後も現在の契約期間満了までは本サービスを利用可能です。",
      ],
    },
    {
      heading: "第8条（サービスの変更・終了）",
      body: [
        "運営者は、事前に合理的な期間をもってユーザーに通知することにより、本サービスの内容を変更し、または本サービスの提供を終了することができるものとします。",
      ],
    },
    {
      heading: "第9条（準拠法・管轄裁判所）",
      body: [
        "本規約の解釈にあたっては日本法を準拠法とし、本サービスに関して生じた一切の紛争については、運営者の所在地を管轄する裁判所を専属的合意管轄とします。",
      ],
    },
  ],
};

const EN: { title: string; sections: TermsSection[] } = {
  title: "Terms of Service",
  sections: [
    {
      heading: "Section 1 (Applicability)",
      body: [
        'These Terms of Service (the "Terms") govern the conditions of provision of this service (the meeting recording and AI summarization tool, hereinafter referred to as the "Service") and the relationship of rights and obligations between the operator and users.',
      ],
    },
    {
      heading: "Section 2 (Service Description)",
      body: [
        "The Service is a B2B SaaS product that utilizes AI technology to transcribe, summarize, and extract tasks from audio and text data input or recorded by users.",
      ],
    },
    {
      heading: "Section 3 (Registration and Initial Consent)",
      body: [
        "1. Users shall use the Service upon agreeing to these Terms and the Privacy Policy.",
        '2. By selecting "Agree" on the consent screen presented during initial launch or usage, the user is deemed to have validly agreed to these Terms.',
      ],
    },
    {
      heading: "Section 4 (Disclaimer and Limitation of Liability)",
      body: [
        "1. The Service automatically generates summaries using AI technology and does not guarantee the accuracy, completeness, timeliness, usefulness, or fitness for a particular purpose of the generated results.",
        "2. The operator shall not be liable for any direct or indirect damages (including data loss, lost profits, or business interruption) arising from the use of or inability to use the Service.",
      ],
    },
    {
      heading: "Section 5 (Handling of Data and Confidential Information)",
      body: [
        "1. Audio and text data recorded or uploaded by users shall be used solely for the purpose of providing the Service (transcription and summarization).",
        "2. The operator will not use transmitted data for public AI training or disclose/provide it to third parties without prior user consent.",
      ],
    },
    {
      heading: "Section 6 (Prohibited Activities)",
      body: [
        "Users shall not engage in any of the following activities:",
        "1. Actions that violate laws, public order, or morality.",
        "2. Uploading audio or data that infringes on the privacy, copyright, or intellectual property rights of others.",
        "3. Imposing an excessive load on the servers or networks of the Service (e.g., unauthorized automated access, reverse engineering).",
        "4. Transferring, selling, or leasing account access rights to third parties.",
      ],
    },
    {
      heading: "Section 7 (Fees and Payment)",
      body: [
        "1. Usage fees shall be paid through designated payment methods (e.g., Stripe) based on the specified pricing plan.",
        "2. Except during free trial periods, fees paid are non-refundable.",
        "3. Users may cancel their subscription at any time, with access continuing until the end of the current billing cycle.",
      ],
    },
    {
      heading: "Section 8 (Modifications and Termination of Service)",
      body: [
        "The operator may modify or terminate the Service by providing reasonable advance notice to users.",
      ],
    },
    {
      heading: "Section 9 (Governing Law and Jurisdiction)",
      body: [
        "These Terms shall be governed by and construed in accordance with the laws of Japan, and any disputes shall be subject to the exclusive jurisdiction of the court having jurisdiction over the location of the operator.",
      ],
    },
  ],
};

/** Terms content follows the UI language: Japanese for ja, English for all others. */
export const getTerms = (lang: Lang) => (lang === "ja" ? JA : EN);
