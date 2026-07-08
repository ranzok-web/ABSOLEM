# כללי

[✏️ הוסף תוכן](../../הוסף-מידע/?cat=כללי){ .md-button .md-button--primary }

<div id="doc-list" style="margin-top:2rem"></div>
<script>
(async function(){
  const el = document.getElementById('doc-list');
  if (!el) return;
  el.innerHTML = '<p style="color:#94a3b8">טוען…</p>';
  try {
    const r = await fetch('/list?cat=%D7%9B%D7%9C%D7%9C%D7%99');
    const { files } = await r.json();
    if (!files || !files.length) { el.innerHTML = '<p style="color:#64748b">אין מסמכים עדיין</p>'; return; }
    el.innerHTML = '<ul style="list-style:none;padding:0;margin:0">' +
      files.map(f => `<li style="margin:0.5rem 0"><a href="./${f.path}/" style="color:#c4b5fd;text-decoration:none;font-size:1rem">📄 ${f.name}</a></li>`).join('') +
      '</ul>';
  } catch(e) { el.innerHTML = ''; }
})();
</script>
