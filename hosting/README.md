# Public privacy policy hosting

Public URL: https://extensions.colimity.com/

Coolify project: `chrome extensions`, environment: `production`.
Service: `Discord Chat Exporter privacy` (`c9ss8sdavnprgtgiopwx2ppg`).

`privacy/index.html` is the deployed HTML rendition of the root `PRIVACY.md`.
The server copy lives at `/data/chrome-extensions/privacy/index.html` in Coolify LXC 2002.
The Compose service serves that directory read-only through Nginx on loopback port 43130.

The existing Cloudflare Tunnel routes `extensions.colimity.com` to
`http://localhost:43130`. The public page requires no login.

After changing the policy, update both `PRIVACY.md` and `privacy/index.html`, copy
the HTML to the server path, and verify the public URL. Updating the HTML does
not require a container restart. Keep this public URL in the Chrome Web Store
privacy-policy field.
