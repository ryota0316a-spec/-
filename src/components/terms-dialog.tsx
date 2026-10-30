import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import { FileText, ShieldCheck, X } from "lucide-react";
import { TERMS_ARTICLES, TERMS_VERSION } from "@/lib/terms";

function TermsBody({ onReachEnd }: { onReachEnd?: () => void }) {
  return (
    <div
      className="terms-scroll"
      tabIndex={0}
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) onReachEnd?.();
      }}
    >
      <h3 className="mb-5 text-base font-semibold text-foreground">利用規約（Terms of Service）</h3>
      <div className="flex flex-col gap-6">
        {TERMS_ARTICLES.map((a) => (
          <article key={a.title} className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-foreground">{a.title}</h4>
            {a.body && <p className="text-sm leading-relaxed text-muted-foreground">{a.body}</p>}
            {a.items && (
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-primary">
                {a.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            )}
          </article>
        ))}
      </div>
      <p className="mt-8 font-mono text-[10px] tracking-widest text-muted-foreground">
        {`LAST UPDATED ${TERMS_VERSION}`}
      </p>
    </div>
  );
}

function Shell({
  open,
  onOpenChange,
  dismissible,
  children,
}: {
  open: boolean;
  onOpenChange?: (o: boolean) => void;
  dismissible: boolean;
  children: React.ReactNode;
}) {
  const block = (e: Event) => {
    if (!dismissible) e.preventDefault();
  };
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onEscapeKeyDown={block}
          onPointerDownOutside={block}
          onInteractOutside={block}
          className="terms-panel fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col gap-5 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:p-8"
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function TermsConsentDialog({ open, onAccept }: { open: boolean; onAccept: () => void }) {
  const [readToEnd, setReadToEnd] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <Shell open={open} dismissible={false}>
      <header className="flex items-start gap-3">
        <span className="icon-chip shrink-0">
          <ShieldCheck className="size-4" />
        </span>
        <div className="flex flex-col gap-1">
          <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-foreground">
            利用規約およびプライバシーポリシーへの同意
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm leading-relaxed text-muted-foreground">
            Minutes AI をご利用いただく前に、以下の利用規約をご確認ください。同意いただくことで本サービスのすべての機能をご利用いただけます。
          </DialogPrimitive.Description>
        </div>
      </header>

      <TermsBody onReachEnd={() => setReadToEnd(true)} />

      <footer className="flex shrink-0 flex-col gap-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground/90">
          <input
            type="checkbox"
            className="terms-check mt-0.5"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>利用規約およびプライバシーポリシーの内容を確認し、同意します。</span>
        </label>
        <button className="btn-primary w-full" disabled={!checked} onClick={onAccept}>
          <ShieldCheck className="size-4" />
          利用規約とプライバシーポリシーに同意して始める
        </button>
        {!readToEnd && (
          <p className="text-center text-xs text-muted-foreground">
            スクロールして規約全文をご確認ください
          </p>
        )}
      </footer>
    </Shell>
  );
}

export function TermsViewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Shell open={open} onOpenChange={onOpenChange} dismissible>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip shrink-0">
            <FileText className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-foreground">
              利用規約
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-xs text-muted-foreground">
              Terms of Service
            </DialogPrimitive.Description>
          </div>
        </div>
        <DialogPrimitive.Close className="btn-ghost" aria-label="閉じる">
          <X className="size-3.5" />
        </DialogPrimitive.Close>
      </header>
      <TermsBody />
      <DialogPrimitive.Close className="btn-primary w-full shrink-0">閉じる</DialogPrimitive.Close>
    </Shell>
  );
}
