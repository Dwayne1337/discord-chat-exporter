chrome.action.onClicked.addListener(async tab => {
  if (!/^https:\/\/discord\.com\//.test(tab.url || '')) {
    await chrome.action.setBadgeText({tabId: tab.id, text: 'OPEN'});
    await chrome.action.setTitle({tabId: tab.id, title: 'Open a conversation on discord.com first'});
    return;
  }
  await chrome.action.setBadgeText({tabId: tab.id, text: ''});
  await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['js/export-format.js', 'js/content-script.js']});
});

// Runs in Discord's page context. Credentials never leave Discord or persist in the extension.
async function discordPage(channelId, before) {
  try {
    if (!/^\d+$/.test(channelId) || (before && !/^\d+$/.test(before))) throw new Error('Invalid channel.');
    let token;
    const frame = document.createElement('iframe');
    frame.hidden = true;
    document.documentElement.append(frame);
    try { token = JSON.parse(frame.contentWindow.localStorage.getItem('token') || 'null'); }
    finally { frame.remove(); }
    if (!token && window.webpackChunkdiscord_app) {
      let require;
      const chunks = window.webpackChunkdiscord_app;
      chunks.push([[`export-${crypto.randomUUID()}`], {}, r => { require = r; }]);
      chunks.pop();
      for (const module of Object.values(require?.c || {})) {
        const values = [module.exports, ...Object.values(module.exports || {})];
        const auth = values.find(value => value && typeof value.getToken === 'function');
        if (auth) { token = auth.getToken(); if (token) break; }
      }
    }
    if (!token) throw new Error('Discord session unavailable. Reload Discord and try again.');
    const response = await fetch(`/api/v9/channels/${channelId}/messages?limit=100${before ? `&before=${before}` : ''}`, {
      headers: {Authorization: token}, signal: AbortSignal.timeout(30000)
    });
    if (response.status === 429) {
      const data = await response.json();
      return {retry: Math.min(Math.max(Number(data.retry_after) || 1, 1), 60) * 1000};
    }
    if (!response.ok) throw new Error(response.status === 403 ? 'You cannot read this conversation.' : `Discord returned ${response.status}. Try again shortly.`);
    const messages = await response.json();
    if (!Array.isArray(messages)) throw new Error('Unexpected response from Discord.');
    return {messages};
  } catch (error) { return {error: error.message}; }
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message.type !== 'export-page' || !sender.tab || !/^https:\/\/discord\.com\/channels\//.test(sender.url || '')) return;
  chrome.scripting.executeScript({target: {tabId: sender.tab.id}, world: 'MAIN', func: discordPage, args: [message.channelId, message.before || '']})
    .then(results => reply(results[0]?.result || {error: 'Reload Discord and try again.'}))
    .catch(error => reply({error: error.message}));
  return true;
});
