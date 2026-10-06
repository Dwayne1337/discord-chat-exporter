# Privacy Policy — Discord Chat Exporter

Effective date: October 6, 2026

Discord Chat Exporter is published by Dwayne ([Dwayne1337 on GitHub](https://github.com/Dwayne1337)). It exports a Discord conversation to a file on your device. The developer does not receive, collect on a server, sell, or retain your Discord messages, session credentials, or exported files. The extension has no analytics, advertising, or exporter backend.

## Data handled locally

When you click the extension icon on discord.com and start an export, the extension reads the selected channel or direct-message conversation. It processes message text, author names and identifiers, timestamps, replies, reactions, embeds, and attachment metadata and links. JSON exports preserve the original message objects returned by Discord, which may include additional message and author fields.

The extension temporarily accesses your existing Discord session token in Discord's page context to authenticate message requests directly to Discord. It does not send that token to the developer or an exporter service, write it to extension storage, or include it in exported files.

This data is used only to create the archive you requested. Dates and export settings are handled locally. The extension does not track browsing history or activity on other websites.

## Network requests and sharing

Message requests go directly from your browser to Discord using your existing session. Discord's handling of those requests remains subject to Discord's own privacy policy. The extension does not send conversation data to the developer or other third-party services.

HTML archives do not automatically load remote assets. Attachments are links to the original files and are not downloaded or bundled by the extension. If you open an attachment link, your browser contacts the linked service. If you share an exported file yourself, its contents become available to the recipients you choose.

## Storage and retention

Messages are held in browser memory while the export is prepared. The completed HTML, Markdown, or JSON file is saved to your device through your browser's download mechanism. The extension does not keep a separate persistent copy or store session credentials. You control the exported files and can delete them using your operating system. Your browser or operating system may independently sync downloads according to your settings.

## Permissions

- **activeTab:** temporary access to the active tab after you click the extension icon, to identify a Discord conversation and show the export controls.
- **scripting:** runs packaged export code in that Discord tab, including a function in Discord's page context that requests the selected conversation's messages.

The extension does not request access to all websites and does not execute remotely hosted extension code.

## Limited use

Data is used only for the extension's single purpose: exporting the conversation you selected. It is not sold, used for advertising, used for creditworthiness or lending decisions, or transferred for unrelated purposes. The extension's use of user data complies with the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Changes and contact

This policy will be updated when the extension's data handling changes. For questions, open an issue at [the project repository](https://github.com/Dwayne1337/discord-chat-exporter/issues). Do not post private chats or session credentials in public issues.
