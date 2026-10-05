# Discord Chat Exporter

A personal, dependency-free Chrome/Helium extension.

Open a conversation on discord.com and click the extension icon. Choose HTML, Markdown, or JSON, optionally choose dates, and export. Empty dates export the full conversation. Dates use your local timezone; exported timestamps use UTC. Cancel stops without saving a partial archive.

HTML is a self-contained, printable transcript with authors, timestamps, replies, reactions, embed text, and attachment links. It does not load remote assets or execute message content. Attachment links may expire; the files themselves are not bundled. JSON preserves the original Discord message objects.

The extension requests messages directly from Discord using your existing session. It does not persist credentials, contact an exporter backend, collect analytics, or require a subscription. Only activeTab and scripting permissions are needed. Discord's internal session access may change; if unavailable, reload Discord and try again. Very large conversations are collected in memory before saving.

## Development

Load this folder unpacked via helium://extensions. Reload the extension after changes, then refresh Discord. No install or build step.
