(() => {
  const existing = document.getElementById('discord-export-panel');
  if (existing) { existing.dispatchEvent(new Event('export-close')); return; }
  const host = document.createElement('div');
  host.id = 'discord-export-panel';
  const root = host.attachShadow({mode: 'open'});
  root.innerHTML = `<style>
:host{all:initial;position:fixed;right:24px;top:80px;z-index:2147483647;font-family:system-ui,sans-serif;color:#f1eef8}*{box-sizing:border-box}.panel{font-family:system-ui,-apple-system,sans-serif;width:350px;max-width:calc(100vw - 32px);background:#201f29;border:1px solid #3c394b;border-radius:20px;box-shadow:0 20px 70px #0008;overflow:hidden}.top{display:flex;justify-content:space-between;align-items:center;padding:22px 24px 0}.label{font-size:10px;letter-spacing:2px;color:#a99ac9;font-weight:700}button,input,select{font:inherit}button{cursor:pointer}.close{border:0;background:transparent;color:#9a93ab;font-size:24px;line-height:1;padding:2px 5px}section{padding:12px 24px 24px}h1{font-size:25px;letter-spacing:-.7px;margin:0 0 8px}p{color:#a7a1b5;font-size:13px;line-height:1.5;margin:0}.channel{margin:20px 0;padding:12px 14px;border:1px solid #3b364b;border-radius:10px;background:#292633;font-size:13px;overflow-wrap:anywhere}.dot{color:#bda4ff;margin-right:8px}.field{display:block;font-size:12px;color:#c1b9d1;margin:16px 0 8px}.hint{font-size:11px;color:#8f879e;margin:8px 0}.dates{display:grid;grid-template-columns:1fr 1fr;gap:10px}input,select{width:100%;border:1px solid #494254;border-radius:9px;background:#282431;color:#ebe4f7;padding:11px 10px;font-size:12px;color-scheme:dark}input:focus,select:focus,button:focus-visible{outline:2px solid #bda4ff;outline-offset:3px}.dates label{font-size:11px;color:#a7a1b5}.dates input{margin-top:6px;min-width:0;padding:10px 6px}.export{border:0;border-radius:10px;background:#c7b0fa;color:#292032;width:100%;padding:13px;margin-top:22px;font-size:13px;font-weight:650}.export:hover{background:#d5c2ff}.export:disabled{opacity:.5;cursor:default}.status{min-height:38px;margin-top:12px;font-size:12px;line-height:1.5;color:#b9aacf}.footer{border-top:1px solid #35303f;padding:14px 24px;font-size:10px;color:#8e859f;letter-spacing:.3px}.error{color:#ffabae}.cancel{background:none;border:0;color:#c7b0fa;font-size:12px;padding:4px 0}[hidden]{display:none!important}
</style><div class="panel" role="dialog" aria-label="Export Discord chat"><div class="top"><span class="label">YOUR CONVERSATION, SAVED</span><button class="close" aria-label="Close exporter">×</button></div><section><h1>Export chat</h1><p>A clean copy to read, keep, or share.</p><div class="channel"><span class="dot">#</span><span id="channel"></span></div><label class="field" for="format">Save as</label><select id="format"><option value="html">HTML · readable chat archive</option><option value="md">Markdown · plain text</option><option value="json">JSON · original message data</option></select><label class="field">Date range <span style="color:#8f879e">· optional</span></label><div class="dates"><label>From<input id="from" aria-label="From date" type="date"></label><label>Through<input id="to" aria-label="Through date" type="date"></label></div><p class="hint">Leave empty for the full conversation.</p><button class="export" id="export">Export conversation ↓</button><div class="status" role="status" aria-live="polite">Ready when you are.</div><button class="cancel" hidden>Cancel export</button></section><div class="footer">LOCAL EXPORT · NO ACCOUNT OR SUBSCRIPTION</div></div>`;
  document.documentElement.append(host);
  const $ = selector => root.querySelector(selector);
  let cancelled = false, busy = false;
  function context() {
    const id = location.pathname.match(/^\/channels\/[^/]+\/(\d+)/)?.[1];
    const title = document.title.replace(/^\(\d+\)\s*/, '').replace(/\s*[|–—]\s*Discord.*$/, '').replace(/^Discord\s*[|–—]\s*/, '') || 'Discord chat';
    return {id, title};
  }
  function update() { const c = context(); $('#channel').textContent = c.id ? c.title : 'Open a channel or direct message'; if (!busy) $('#export').disabled = !c.id; }
  update();
  const timer = setInterval(() => { if (!host.isConnected) return clearInterval(timer); update(); }, 700);
  const close = () => { cancelled = true; host.remove(); clearInterval(timer); };
  host.addEventListener('export-close', close);
  $('.close').onclick = close;
  $('.cancel').onclick = () => { cancelled = true; $('.status').textContent = 'Cancelling…'; };
  $('#export').onclick = async () => {
    const {id: channelId, title} = context();
    const from = $('#from').value, to = $('#to').value;
    const start = from ? new Date(`${from}T00:00:00`).getTime() : 0;
    const end = to ? new Date(`${to}T00:00:00`).getTime() : Date.now();
    const endExclusive = to ? (() => { const d = new Date(end); d.setDate(d.getDate() + 1); return d.getTime(); })() : end + 1;
    const status = $('.status'); status.classList.remove('error');
    if (start >= endExclusive) { status.textContent = 'The start date must be before the end date.'; status.classList.add('error'); return; }
    busy = true; cancelled = false; $('#export').disabled = true; $('.cancel').hidden = false;
    for (const input of root.querySelectorAll('input,select')) input.disabled = true;
    try {
      const messages = new Map();
      const snowflake = time => ((BigInt(Math.max(time - 1420070400000, 0)) << 22n)).toString();
      let before = snowflake(endExclusive), retries = 0;
      status.textContent = 'Reading conversation…';
      while (!cancelled) {
        const page = await chrome.runtime.sendMessage({type: 'export-page', channelId, before});
        if (cancelled) break;
        if (page.error) throw new Error(page.error);
        if (page.retry) {
          if (++retries > 10) throw new Error('Discord is busy. Please try again later.');
          status.textContent = `Discord asked us to wait. ${messages.size.toLocaleString()} messages collected…`;
          for (let waited = 0; waited < page.retry && !cancelled; waited += 250) await new Promise(r => setTimeout(r, 250));
          continue;
        }
        retries = 0;
        const batch = page.messages;
        if (!batch.length) break;
        for (const message of batch) { const time = Date.parse(message.timestamp); if (time >= start && time < endExclusive) messages.set(message.id, message); }
        const oldest = batch.reduce((a,b) => BigInt(a.id) < BigInt(b.id) ? a : b);
        if (BigInt(oldest.id) >= BigInt(before)) throw new Error('Discord pagination stopped advancing. Please try again.');
        before = oldest.id;
        status.textContent = `${messages.size.toLocaleString()} messages collected…`;
        if (Date.parse(oldest.timestamp) < start || batch.length < 100) break;
        await new Promise(r => setTimeout(r, 350));
      }
      if (cancelled) { status.textContent = 'Export cancelled. No file saved.'; return; }
      const sorted = [...messages.values()].sort((a,b) => BigInt(a.id) < BigInt(b.id) ? -1 : 1);
      if (!sorted.length) { status.textContent = 'No messages in this date range.'; return; }
      const format = $('#format').value;
      const content = DiscordExport.build({title, channelId, messages: sorted, from, to}, format);
      const url = URL.createObjectURL(new Blob([content], {type: {html:'text/html',md:'text/markdown',json:'application/json'}[format] + ';charset=utf-8'}));
      const link = document.createElement('a'); link.href = url; link.download = `${title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0,80)}-${new Date().toISOString().slice(0,10)}.${format}`;
      host.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = `Saved ${sorted.length.toLocaleString()} messages. Enjoy your archive.`;
    } catch (error) { status.textContent = error.message || 'Export failed. Reload Discord and try again.'; status.classList.add('error'); }
    finally { busy = false; $('.cancel').hidden = true; for (const input of root.querySelectorAll('input,select')) input.disabled = false; update(); }
  };
})();
