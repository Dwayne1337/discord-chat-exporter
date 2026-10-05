(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? escape(u.href) : ''; } catch { return ''; } };
  const name = author => author?.global_name || author?.username || 'Unknown author';
  function text(message) {
    let content = message.content || '';
    for (const user of message.mentions || []) content = content.replaceAll(`<@${user.id}>`, `@${name(user)}`).replaceAll(`<@!${user.id}>`, `@${name(user)}`);
    content = content.replace(/<a?:([^:]+):\d+>/g, ':$1:');
    const extras = [];
    for (const embed of message.embeds || []) extras.push([embed.title, embed.description, embed.url, ...(embed.fields || []).map(f => `${f.name}: ${f.value}`)].filter(Boolean).join('\n'));
    for (const sticker of message.sticker_items || []) extras.push(`[Sticker: ${sticker.name}]`);
    if (message.poll) extras.push(`[Poll: ${message.poll.question?.text || ''}]`, ...(message.poll.answers || []).map(a => `• ${a.poll_media?.text || ''}`));
    return [content, ...extras].filter(Boolean).join('\n\n') || (message.attachments?.length ? '' : `[System message, type ${message.type}]`);
  }
  const stamp = value => new Date(value).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  function build({title, channelId, messages, from, to}, format) {
    const range = `${from || 'Beginning'} → ${to || 'Latest'}`;
    if (format === 'json') return JSON.stringify({title, channelId, exportedAt: new Date().toISOString(), range: {from, to}, messages}, null, 2);
    if (format === 'md') return `# ${title.replace(/[\r\n]/g, ' ')}\n\n${messages.length} messages · ${range}\nAll timestamps are UTC.\n\n` + messages.map(m => {
      const reply = m.referenced_message ? `> Reply to ${name(m.referenced_message.author)}: ${text(m.referenced_message).replace(/\n/g, '\n> ')}\n\n` : m.message_reference ? '> Reply to an unavailable message\n\n' : '';
      return `### ${name(m.author)} · ${stamp(m.timestamp)}${m.edited_timestamp ? ' (edited)' : ''}\n\n${reply}${text(m)}\n\n` + (m.attachments || []).map(a => `${a.filename}: ${a.url}\n`).join('') + ((m.reactions || []).length ? '\nReactions: ' + m.reactions.map(r => `${r.emoji.name} × ${r.count}`).join(', ') + '\n' : '') + '\n';
    }).join('');
    const rows = messages.map(m => {
      const reply = m.referenced_message ? `<blockquote>Reply to ${escape(name(m.referenced_message.author))}<br>${escape(text(m.referenced_message))}</blockquote>` : m.message_reference ? '<blockquote>Reply to an unavailable message</blockquote>' : '';
      const files = (m.attachments || []).map(a => { const url = safeURL(a.url); return url ? `<a class="file" href="${url}" rel="noreferrer">↗ ${escape(a.filename)} <small>${Math.ceil((a.size || 0) / 1024)} KB</small></a>` : ''; }).join('');
      const reactions = (m.reactions || []).map(r => `<span class="reaction">${escape(r.emoji.name)} ${r.count}</span>`).join('');
      return `<article><div class="avatar">${escape(Array.from(name(m.author))[0])}</div><div class="message"><header><strong>${escape(name(m.author))}</strong><time datetime="${escape(m.timestamp)}">${escape(stamp(m.timestamp))}</time>${m.edited_timestamp ? '<small>edited</small>' : ''}</header>${reply}<div class="body">${escape(text(m))}</div>${files}${reactions ? `<div class="reactions">${reactions}</div>` : ''}</div></article>`;
    }).join('');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; base-uri 'none'"><title>${escape(title)}</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f4f1;color:#292a32;font:15px/1.6 system-ui,sans-serif}main{max-width:900px;margin:50px auto;padding:0 28px}.intro{border-bottom:1px solid #dedde4;padding-bottom:28px;margin-bottom:28px}.eyebrow{font-size:11px;letter-spacing:2px;color:#7562ad;font-weight:700}h1{font-size:32px;line-height:1.2;margin:12px 0}.meta,small,time{color:#777683;font-size:12px}article{display:flex;gap:16px;margin:0 0 24px;break-inside:avoid}.avatar{flex:0 0 38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#e6e0f2;color:#65518e;font-weight:700}.message{min-width:0;flex:1}header{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}.body,blockquote{white-space:pre-wrap;overflow-wrap:anywhere}.body{margin-top:4px}blockquote{border-left:3px solid #d2c9e5;padding:6px 12px;margin:10px 0;background:#ebe8ef;color:#686273;font-size:13px}.file{display:block;color:#65518e;margin-top:8px;overflow-wrap:anywhere}.reaction{display:inline-block;background:#e9e5ef;border-radius:7px;padding:2px 8px;margin:8px 6px 0 0;font-size:12px}footer{border-top:1px solid #dedde4;padding-top:20px;color:#8a8594;font-size:12px}@media(max-width:600px){main{margin:28px auto;padding:0 18px}time{width:100%}}@media print{body{background:white}main{margin:0;max-width:none}}
</style></head><body><main><div class="intro"><div class="eyebrow">DISCORD / CHAT ARCHIVE</div><h1>${escape(title)}</h1><div class="meta">${messages.length.toLocaleString()} messages · ${escape(range)}<br>All timestamps are UTC · Exported ${escape(stamp(new Date()))}</div></div>${rows}<footer>Saved with Discord Chat Exporter · Attachments are links to the original files and may expire.</footer></main></body></html>`;
  }
  globalThis.DiscordExport = {build, text};
})();
