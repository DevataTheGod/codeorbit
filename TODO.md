# TODO - Fix AI chat buffering

- [ ] Update `supabase/functions/bodhit-chat/index.ts` to emit real SSE (`data: ...\n\n`) instead of returning upstream stream body unchanged.
- [ ] Update `frontend/src/components/ide/AIChatPanel.tsx` parsing to match the new SSE format (and add a timeout + better debug logging if stream stalls).
- [ ] Run local frontend and verify that chat streams tokens to the UI (no loader-only buffering).
- [ ] If still failing, capture sample upstream stream format and adjust the parser/rewrapper accordingly.
