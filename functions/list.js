export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const cat = url.searchParams.get('cat');
  if (!cat) return json({ error: 'missing cat' }, 400);

  const token = env.GITHUB_TOKEN;
  const repo  = 'ranzok-web/ABSOLEM';
  const path  = `docs/${cat}`;

  const ghRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`,
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'absolem-pages-app' } }
  );

  if (!ghRes.ok) return json({ files: [] });

  const items = await ghRes.json();
  const files = items
    .filter(f => f.name.endsWith('.md') && f.name !== 'index.md')
    .map(f => ({
      name: f.name.replace(/\.md$/, '').replace(/-\d{13}$/, '').replace(/-/g, ' '),
      path: f.name.replace(/\.md$/, ''),
    }));

  return json({ files });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
