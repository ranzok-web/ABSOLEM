# הוראות טעינה

[✏️ הוסף הוראה חדשה](../../הוסף-מידע/?cat=הוראות-טעינה){ .md-button .md-button--primary }

<div id="doc-list" style="margin-top:2rem"></div>
<script>
(async function(){
  const el = document.getElementById('doc-list');
  if (!el) return;
  el.innerHTML = '<p style="color:#94a3b8">טוען…</p>';
  try {
    const r = await fetch('/list?cat=%D7%94%D7%95%D7%A8%D7%90%D7%95%D7%AA-%D7%98%D7%A2%D7%99%D7%A0%D7%94');
    const { files } = await r.json();
    if (!files || !files.length) { el.innerHTML = '<p style="color:#64748b">אין מסמכים עדיין</p>'; return; }
    el.innerHTML = '<ul style="list-style:none;padding:0;margin:0">' +
      files.map(f => `<li style="margin:0.5rem 0"><a href="./${f.path}/" style="color:#c4b5fd;text-decoration:none;font-size:1rem">📄 ${f.name}</a></li>`).join('') +
      '</ul>';
  } catch(e) { el.innerHTML = ''; }
})();
</script>
