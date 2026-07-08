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

  const IMAGE_EXT = ['.jpg','.jpeg','.png','.gif','.webp','.svg'];
  const commits = [];

  if (fileContent && fileName) {
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
    const filePath = `docs/${category}/${safe}-${stamp}${ext}`;
    commits.push({ path: filePath, b64: fileContent });

    // create a .md page that embeds/links the file
    const fileBasename = `${safe}-${stamp}${ext}`;
    const isImage = IMAGE_EXT.includes(ext);
    const mdContent = isImage
      ? `# ${title}\n\n![${title}](./${fileBasename})\n`
      : `# ${title}\n\n[📥 הורד קובץ: ${fileName}](./${fileBasename})\n`;
    const mdPath = `docs/${category}/${safe}-${stamp}.md`;
    const mdB64  = btoa(String.fromCharCode(...new TextEncoder().encode(mdContent)));
    commits.push({ path: mdPath, b64: mdB64 });
  } else {
    const mdPath = `docs/${category}/${safe}-${stamp}.md`;
    const md     = `# ${title}\n\n${content}\n`;
    const mdB64  = btoa(String.fromCharCode(...new TextEncoder().encode(md)));
    commits.push({ path: mdPath, b64: mdB64 });
  }

  for (const { path, b64 } of commits) {
    const ghRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`,
      {
        method : 'PUT',
        headers: {
          Authorization : `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent'  : 'absolem-pages-app',
        },
        body: JSON.stringify({ message: `הוסף: ${title}`, content: b64, branch: 'main' }),
      }
    );
    if (!ghRes.ok) {
      const err = await ghRes.json().catch(() => ({}));
      return json({ error: err.message || 'GitHub error' }, 500);
    }
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
