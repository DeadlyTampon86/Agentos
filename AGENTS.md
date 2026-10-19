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

- Prompt library content lives in src/data/prompts.json (parsed from the user's PDF); UI derives form fields from [BRACKET] placeholders — why: one source of truth, no hand-coded forms.
- AI drafting goes through the single server function in src/lib/generate.functions.ts — why: keeps the API key server-side and Fair Housing rules in one system prompt.
- Agent profile is stored in localStorage until accounts exist — why: no backend enabled yet.
- Accounts use Lovable Cloud auth (email + Google) with a profiles table auto-created by trigger — why: sync and paid access need real user identity.
- Sales-page tool cards reuse a small editorial image collection by subject — why: all ten tools stay visually cohesive without ten mismatched art styles.
- Reminders live in the reminders table; due ones send free from the agent's own phone/email via sms:/mailto: links, and the optional Twilio sender route only runs once a sending number is configured — why: keep the core product free of per-message costs.
