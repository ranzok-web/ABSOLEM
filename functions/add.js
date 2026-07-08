export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const { category, title, content, fileName, fileContent } = body;
  if (!category || !title) return json({ error: 'חסרים שדות' }, 400);
  if (!content && !fileContent) return json({ error: 'חסר תוכן' }, 400);

  const token = env.GITHUB_TOKEN;
  if (!token) return json({ error: 'GITHUB_TOKEN not configured' }, 500);

  const repo  = 'ranzok-web/ABSOLEM';
  const stamp = Date.now();
  const safe  = title.replace(/[^֐-׿a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-') || stamp;

  let path, b64;
  if (fileContent && fileName) {
    // keep original file extension
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '';
    path = `docs/${category}/${safe}-${stamp}${ext}`;
    b64  = fileContent; // already base64 from FileReader
  } else {
    path = `docs/${category}/${safe}-${stamp}.md`;
    const md = `# ${title}\n\n${content}\n`;
    b64  = btoa(String.fromCharCode(...new TextEncoder().encode(md)));
  }

  const ghRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method : 'PUT',
      headers: {
        Authorization : `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent'  : 'absolem-pages-app',
      },
      body: JSON.stringify({
        message: `הוסף: ${title}`,
        content: b64,
        branch : 'main',
      }),
    }
  );

  if (!ghRes.ok) {
    const err = await ghRes.json().catch(() => ({}));
    return json({ error: err.message || 'GitHub error' }, 500);
  }

  // trigger Cloudflare Pages redeploy if hook is configured
  if (env.CF_DEPLOY_HOOK) {
    fetch(env.CF_DEPLOY_HOOK, { method: 'POST' }).catch(() => {});
  }

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
