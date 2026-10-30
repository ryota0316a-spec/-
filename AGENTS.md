<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules

- AI summarization lives in a server route under `src/routes/api/` that calls the Lovable AI Gateway — the gateway key stays server-side and never enters the browser bundle.
- Visual style is defined only by tokens and `@utility` rules in `src/styles.css`; components use those utilities and semantic theme colors, never hardcoded color classes.
