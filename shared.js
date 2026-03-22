/**
 * shared.js — Fonctions communes à toutes les pages Info PED
 */

// ── Auth ─────────────────────────────────────────────
function pedGetUser() {
    const s = sessionStorage.getItem('ped_user');
    if (!s) { window.location.replace('login.html'); return null; }
    return JSON.parse(s);
}
function pedLogout() {
    sessionStorage.removeItem('ped_user');
    window.location.replace('login.html');
}

// ── GitHub config ─────────────────────────────────────
function pedGetGHConfig() {
    if (typeof PED_GITHUB === 'undefined') return null;
    const { token, owner, repo } = PED_GITHUB;
    if (!token || token === 'ghp_VOTRE_TOKEN_ICI' || !owner || !repo) return null;
    return { token, owner, repo };
}

// ── Utilitaires ───────────────────────────────────────
function pedEsc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function pedStyledText(item) {
    const s = [];
    if (item.size)      s.push('font-size:'+item.size);
    if (item.textColor) s.push('color:'+item.textColor);
    if (item.hlColor)   s.push('background:'+item.hlColor+';border-radius:4px;padding:0 3px');
    if (item.bold)      s.push('font-weight:700');
    if (item.italic)    s.push('font-style:italic');
    if (item.under)     s.push('text-decoration:underline');
    const esc = pedEsc(item.texte);
    return s.length ? '<span style="'+s.join(';')+'">'+esc+'</span>' : esc;
}

// ── Rendu d'une section ───────────────────────────────
function pedRenderSection(ulId, items, isAdmin, sectionKey, limit) {
    const ul = document.getElementById(ulId);
    if (!ul) return;
    ul.innerHTML = '';
    const list = limit ? items.slice(0, limit) : items;
    if (!list.length) {
        ul.innerHTML = '<li style="color:#aaa;font-style:italic">Aucun élément</li>';
        return;
    }
    list.forEach((item, idx) => {
        const li = document.createElement('li');
        const txt = pedStyledText(item);
        if (item.type === 'alert') {
            li.classList.add('alert-item');
            li.innerHTML = '<span class="icon">🚨</span><span>'+txt+'</span>';
        } else if (item.lien) {
            li.classList.add('with-button');
            li.innerHTML = '<span>'+txt+'</span><a href="'+pedEsc(item.lien)+'" target="_blank" rel="noopener"><button title="Ouvrir">📎</button></a>';
        } else {
            li.innerHTML = txt;
        }
        if (isAdmin) {
            const acts = document.createElement('span');
            acts.className = 'edit-actions';
            acts.innerHTML = '<button class="eact eact-e" onclick="pedOpenEditItem(\''+sectionKey+'\','+idx+',event)" title="Modifier">✏️</button>'
                           + '<button class="eact eact-d" onclick="pedDeleteItem(\''+sectionKey+'\','+idx+',event)" title="Supprimer">🗑️</button>';
            li.appendChild(acts);
        }
        ul.appendChild(li);
    });
}

// ── Rendu agenda ──────────────────────────────────────
function pedRenderAgenda(containerId, events, isAdmin) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!events || !events.length) {
        container.innerHTML = '<p style="color:#888;font-size:14px">Aucun évènement à venir</p>';
        return;
    }
    events.forEach((ev, idx) => {
        const div = document.createElement('div');
        div.className = 'agenda-item';
        div.innerHTML =
            '<div class="agenda-header" onclick="this.closest(\'.agenda-item\').classList.toggle(\'expanded\')">'
          +   '<div class="agenda-date"><span class="day">'+pedEsc(ev.jour)+'</span><span class="month">'+pedEsc(ev.mois)+'</span></div>'
          +   '<div class="agenda-main">'
          +     '<div class="agenda-content">'+pedEsc(ev.titre)+'</div>'
          +     '<div style="display:flex;align-items:center;gap:8px;">'
          +       (isAdmin ? '<span class="agenda-edit-btns"><button class="eact eact-e" onclick="pedOpenEditAgenda('+idx+',event)">✏️</button><button class="eact eact-d" onclick="pedDeleteAgenda('+idx+',event)">🗑️</button></span>' : '')
          +       '<span class="agenda-arrow">▶</span>'
          +     '</div>'
          +   '</div>'
          + '</div>'
          + '<div class="agenda-details"><div class="agenda-details-content">'
          + (ev.heure        ? '<div class="detail-row"><span class="detail-icon">🕐</span><span class="detail-label">Heure :</span><span class="detail-value">'+pedEsc(ev.heure)+'</span></div>' : '')
          + (ev.lieu         ? '<div class="detail-row"><span class="detail-icon">📍</span><span class="detail-label">Lieu :</span><span class="detail-value">'+pedEsc(ev.lieu)+'</span></div>' : '')
          + (ev.participants  ? '<div class="detail-row"><span class="detail-icon">👥</span><span class="detail-label">Participants :</span><span class="detail-value">'+pedEsc(ev.participants)+'</span></div>' : '')
          + '</div></div>';
        container.appendChild(div);
    });
}

// ── Déploiement GitHub ────────────────────────────────
async function pedDeploy(localContent, localAgenda, onStart, onEnd) {
    const cfg = pedGetGHConfig();
    if (!cfg) { pedToast('⚠️ PED_GITHUB non configuré dans data.js'); return; }
    if (onStart) onStart();
    const API = 'https://api.github.com/repos/'+cfg.owner+'/'+cfg.repo+'/contents/data.js';
    const H = { 'Authorization': 'Bearer '+cfg.token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' };
    try {
        const getRes = await fetch(API, { headers: H });
        if (!getRes.ok) throw new Error('Lecture data.js échouée ('+getRes.status+')');
        const fd = await getRes.json();
        const cur = decodeURIComponent(escape(atob(fd.content.replace(/\n/g,''))));
        let upd = cur.replace(/const\s+PED_CONTENT\s*=\s*\{[\s\S]*?\n\};/m, pedBuildContentBlock(localContent));
        if (localAgenda) upd = upd.replace(/const\s+PED_AGENDA\s*=\s*\[[\s\S]*?\];/m, pedBuildAgendaBlock(localAgenda));
        const now = new Date();
        const ds = String(now.getDate()).padStart(2,'0')+'/'+String(now.getMonth()+1).padStart(2,'0')+'/'+now.getFullYear();
        upd = upd.replace(/const\s+PED_LAST_UPDATE\s*=\s*"[^"]*";/, 'const PED_LAST_UPDATE = "'+ds+'";');
        const putRes = await fetch(API, { method:'PUT', headers:H, body: JSON.stringify({ message:'📝 Mise à jour contenu via dashboard', content: btoa(unescape(encodeURIComponent(upd))), sha: fd.sha }) });
        if (!putRes.ok) { const e = await putRes.json(); throw new Error(e.message||'Erreur push'); }
        pedToast('✅ Sauvegardé ! Site mis à jour en ~1 minute');
        const el = document.getElementById('lastModified');
        if (el) el.textContent = ds;
    } catch(e) { pedToast('❌ '+e.message); }
    if (onEnd) onEnd();
}

// ── Sérialiseurs ──────────────────────────────────────
function pedBuildContentBlock(lc) {
    const sections = ['medicaments','hygiene_htc','hygiene_urgence','hygiene_pedopsy','divers','projets','rh','evenements'];
    let out = 'const PED_CONTENT = {\n\n';
    sections.forEach((s,si) => {
        out += '    '+s+': [\n';
        (lc[s]||[]).forEach((item,i) => {
            const c = i<(lc[s].length-1)?',':'';
            out += '        {\n';
            out += '            texte:     '+JSON.stringify(item.texte)+',\n';
            out += '            lien:      '+JSON.stringify(item.lien||'')+',\n';
            out += '            type:      '+JSON.stringify(item.type||'normal')+',\n';
            out += '            size:      '+JSON.stringify(item.size||'')+',\n';
            out += '            textColor: '+JSON.stringify(item.textColor||'')+',\n';
            out += '            hlColor:   '+JSON.stringify(item.hlColor||'')+',\n';
            out += '            bold:      '+(item.bold?'true':'false')+',\n';
            out += '            italic:    '+(item.italic?'true':'false')+',\n';
            out += '            under:     '+(item.under?'true':'false')+'\n';
            out += '        }'+c+'\n';
        });
        out += '    ]'+(si<sections.length-1?',':'')+'\n\n';
    });
    return out+'};';
}

function pedBuildAgendaBlock(la) {
    let out = 'const PED_AGENDA = [\n';
    la.forEach((ev,i) => {
        const c = i<la.length-1?',':'';
        out += '    {\n';
        out += '        jour:         '+JSON.stringify(ev.jour)+',\n';
        out += '        mois:         '+JSON.stringify(ev.mois)+',\n';
        out += '        titre:        '+JSON.stringify(ev.titre)+',\n';
        out += '        heure:        '+JSON.stringify(ev.heure||'')+',\n';
        out += '        lieu:         '+JSON.stringify(ev.lieu||'')+',\n';
        out += '        participants: '+JSON.stringify(ev.participants||'')+'\n';
        out += '    }'+c+'\n';
    });
    return out+'];';
}

// ── Toast ─────────────────────────────────────────────
function pedToast(msg, duration=3000) {
    let t = document.getElementById('pedToast')||document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), duration);
}

// ── État formatage ────────────────────────────────────
let _pedEditSection=null, _pedEditIdx=null, _pedLocalContent=null, _pedLocalAgenda=null, _pedOnSaved=null;
let _pedFmt={bold:false,italic:false,under:false,textColor:'',hlColor:'',size:''};
let _pedEditAgendaIdx=null;

function pedInitEdit(lc, la, onSaved) {
    _pedLocalContent=lc; _pedLocalAgenda=la; _pedOnSaved=onSaved;
}

// ── Modal item ────────────────────────────────────────
function pedOpenAddItem(section) {
    _pedEditSection=section; _pedEditIdx=null;
    document.getElementById('pedItemModalTitle').textContent='Ajouter un élément';
    document.getElementById('pedItemText').value='';
    document.getElementById('pedItemLink').value='';
    document.getElementById('pedItemType').value='normal';
    document.getElementById('pedItemSize').value='';
    _pedFmt={bold:false,italic:false,under:false,textColor:'',hlColor:'',size:''};
    _pedApplyFmtUI(); _pedUpdatePreview();
    document.getElementById('pedItemModal').classList.add('open');
}

function pedOpenEditItem(section,idx,e) {
    if(e) e.stopPropagation();
    _pedEditSection=section; _pedEditIdx=idx;
    const item=_pedLocalContent[section][idx];
    document.getElementById('pedItemModalTitle').textContent='Modifier l\'élément';
    document.getElementById('pedItemText').value=item.texte;
    document.getElementById('pedItemLink').value=item.lien||'';
    document.getElementById('pedItemType').value=item.type||'normal';
    document.getElementById('pedItemSize').value=item.size||'';
    _pedFmt={bold:item.bold||false,italic:item.italic||false,under:item.under||false,textColor:item.textColor||'',hlColor:item.hlColor||'',size:item.size||''};
    _pedApplyFmtUI(); _pedUpdatePreview();
    document.getElementById('pedItemModal').classList.add('open');
}

async function pedSaveItem() {
    const texte=document.getElementById('pedItemText').value.trim();
    if(!texte){pedToast('⚠️ Texte requis');return;}
    const item={texte,lien:document.getElementById('pedItemLink').value.trim(),type:document.getElementById('pedItemType').value,size:document.getElementById('pedItemSize').value,textColor:_pedFmt.textColor,hlColor:_pedFmt.hlColor,bold:_pedFmt.bold,italic:_pedFmt.italic,under:_pedFmt.under};
    if(_pedEditIdx!==null) _pedLocalContent[_pedEditSection][_pedEditIdx]=item;
    else _pedLocalContent[_pedEditSection].unshift(item);
    document.getElementById('pedItemModal').classList.remove('open');
    if(_pedOnSaved) _pedOnSaved();
    const btn=document.getElementById('pedItemSaveBtn');
    btn.disabled=true;
    await pedDeploy(_pedLocalContent,_pedLocalAgenda,null,()=>{btn.disabled=false;});
}

function pedDeleteItem(section,idx,e) {
    if(e) e.stopPropagation();
    if(!confirm('Supprimer cet élément ?')) return;
    _pedLocalContent[section].splice(idx,1);
    if(_pedOnSaved) _pedOnSaved();
    pedDeploy(_pedLocalContent,_pedLocalAgenda,null,null);
}

// ── Modal agenda ──────────────────────────────────────
function pedOpenAddAgenda() {
    _pedEditAgendaIdx=null;
    document.getElementById('pedAgendaModalTitle').textContent='Ajouter un évènement';
    ['pedAgJour','pedAgMois','pedAgTitre','pedAgHeure','pedAgLieu','pedAgPart'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('pedAgendaModal').classList.add('open');
}

function pedOpenEditAgenda(idx,e) {
    if(e) e.stopPropagation();
    _pedEditAgendaIdx=idx;
    const ev=_pedLocalAgenda[idx];
    document.getElementById('pedAgendaModalTitle').textContent='Modifier l\'évènement';
    document.getElementById('pedAgJour').value=ev.jour;
    document.getElementById('pedAgMois').value=ev.mois;
    document.getElementById('pedAgTitre').value=ev.titre;
    document.getElementById('pedAgHeure').value=ev.heure||'';
    document.getElementById('pedAgLieu').value=ev.lieu||'';
    document.getElementById('pedAgPart').value=ev.participants||'';
    document.getElementById('pedAgendaModal').classList.add('open');
}

async function pedSaveAgenda() {
    const jour=document.getElementById('pedAgJour').value.trim();
    const mois=document.getElementById('pedAgMois').value.trim().toUpperCase();
    const titre=document.getElementById('pedAgTitre').value.trim();
    if(!jour||!mois||!titre){pedToast('⚠️ Jour, mois et titre requis');return;}
    const ev={jour,mois,titre,heure:document.getElementById('pedAgHeure').value.trim(),lieu:document.getElementById('pedAgLieu').value.trim(),participants:document.getElementById('pedAgPart').value.trim()};
    if(_pedEditAgendaIdx!==null) _pedLocalAgenda[_pedEditAgendaIdx]=ev;
    else _pedLocalAgenda.unshift(ev);
    document.getElementById('pedAgendaModal').classList.remove('open');
    if(_pedOnSaved) _pedOnSaved();
    await pedDeploy(_pedLocalContent,_pedLocalAgenda,null,null);
}

function pedDeleteAgenda(idx,e) {
    if(e) e.stopPropagation();
    if(!confirm('Supprimer cet évènement ?')) return;
    _pedLocalAgenda.splice(idx,1);
    if(_pedOnSaved) _pedOnSaved();
    pedDeploy(_pedLocalContent,_pedLocalAgenda,null,null);
}

function pedToggleFmt(type){_pedFmt[type]=!_pedFmt[type];_pedApplyFmtUI();_pedUpdatePreview();}
function pedSetColor(t,v){if(t==='text')_pedFmt.textColor=v;else _pedFmt.hlColor=v;_pedApplyFmtUI();_pedUpdatePreview();}
function _pedApplyFmtUI(){
    ['Bold','Italic','Under'].forEach(k=>{const el=document.getElementById('pedFmt'+k);if(el)el.classList.toggle('active',_pedFmt[k.toLowerCase()]);});
}
function _pedUpdatePreview(){
    const texte=document.getElementById('pedItemText')?.value||'Aperçu…';
    const size=document.getElementById('pedItemSize')?.value||'';
    const s=[];
    if(size) s.push('font-size:'+size);
    if(_pedFmt.textColor) s.push('color:'+_pedFmt.textColor);
    if(_pedFmt.hlColor) s.push('background:'+_pedFmt.hlColor+';border-radius:4px;padding:2px 5px');
    if(_pedFmt.bold) s.push('font-weight:700');
    if(_pedFmt.italic) s.push('font-style:italic');
    if(_pedFmt.under) s.push('text-decoration:underline');
    const p=document.getElementById('pedPreview');
    if(p) p.innerHTML='<span style="'+s.join(';')+'">'+pedEsc(texte)+'</span>';
}

document.addEventListener('click',e=>{
    ['pedItemModal','pedAgendaModal'].forEach(id=>{
        const el=document.getElementById(id);
        if(el&&e.target===el) el.classList.remove('open');
    });
});

// ── Auto-injection des modals et styles dans toutes les pages ─────────
function _injectModals(){
    if(document.getElementById('pedItemModal')) return;
    const style = document.createElement('style');
    style.textContent = `
.ped-ov{display:none;position:fixed;inset:0;background:rgba(26,26,46,0.65);backdrop-filter:blur(8px);z-index:2000;align-items:center;justify-content:center;}
.ped-ov.open{display:flex;}
.ped-modal{background:#fff;border-radius:20px;padding:28px;width:90%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,0.25);}
.ped-modal h3{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:18px;}
.ped-mf{margin-bottom:13px;}
.ped-mf label{display:block;font-weight:600;font-size:13px;color:#555;margin-bottom:5px;}
.ped-mf input,.ped-mf textarea,.ped-mf select{width:100%;padding:10px 13px;border:2px solid #e8e8f0;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;color:#1a1a2e;outline:none;transition:border-color 0.2s;}
.ped-mf input:focus,.ped-mf textarea:focus,.ped-mf select:focus{border-color:#FF6B9D;}
.ped-mf textarea{resize:vertical;min-height:70px;}
.ped-mrow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px;}
.ped-mrow .ped-mf{margin-bottom:0;}
.ped-ma{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;}
.ped-cancel{padding:10px 20px;border-radius:50px;border:2px solid #e0e0e8;background:#fff;color:#555;font-weight:600;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.ped-save{padding:10px 24px;border-radius:50px;border:none;background:linear-gradient(135deg,#FF6B9D,#C94A6D);color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.ped-save:disabled{opacity:0.6;cursor:wait;}
.ped-fmt{width:30px;height:30px;border:2px solid #e0e0e8;border-radius:8px;background:#fff;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;justify-content:center;transition:all 0.2s;}
.ped-fmt.active{border-color:#FF6B9D;background:rgba(255,107,157,0.1);}
.ped-sw{width:22px;height:22px;border-radius:6px;border:2px solid rgba(0,0,0,0.1);cursor:pointer;display:inline-block;transition:all 0.2s;vertical-align:middle;}
.ped-sw:hover{transform:scale(1.2);}
.ped-sw.active{border:2.5px solid #1a1a2e;transform:scale(1.15);}
.ped-sw-x{background:#fff;color:#aaa;font-size:10px;font-weight:700;border:2px solid #e0e0e8;line-height:18px;text-align:center;}
.ped-prev{padding:10px 14px;background:#f8f8fc;border-radius:10px;border:1px solid #e8e8f0;min-height:36px;font-size:15px;}
#pedToast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1a2e;color:#fff;padding:10px 20px;border-radius:20px;font-weight:600;font-size:13px;box-shadow:0 8px 32px rgba(0,0,0,0.18);opacity:0;transition:all 0.3s;z-index:3000;pointer-events:none;white-space:nowrap;}
#pedToast.show{opacity:1;transform:translateX(-50%) translateY(0);}`;
    document.head.appendChild(style);

    const itemModal = document.createElement('div');
    itemModal.id = 'pedItemModal';
    itemModal.className = 'ped-ov';
    itemModal.innerHTML = `<div class="ped-modal">
<h3 id="pedItemModalTitle">Modifier l'élément</h3>
<div class="ped-mf"><label>Texte</label><textarea id="pedItemText" rows="3" placeholder="Texte…" oninput="_pedUpdatePreview()"></textarea></div>
<div class="ped-mrow">
  <div class="ped-mf"><label>Taille</label>
    <select id="pedItemSize" onchange="_pedUpdatePreview()">
      <option value="">Par défaut</option><option value="12px">Petit (12px)</option>
      <option value="15px">Normal (15px)</option><option value="18px">Grand (18px)</option>
      <option value="22px">Très grand (22px)</option><option value="28px">Titre (28px)</option>
    </select>
  </div>
  <div class="ped-mf"><label>Couleur texte</label>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">
      <span class="ped-sw" style="background:#1A1A2E" onclick="pedSetColor('text','#1A1A2E')"></span>
      <span class="ped-sw" style="background:#FF6B9D" onclick="pedSetColor('text','#FF6B9D')"></span>
      <span class="ped-sw" style="background:#4ECDC4" onclick="pedSetColor('text','#4ECDC4')"></span>
      <span class="ped-sw" style="background:#667eea" onclick="pedSetColor('text','#667eea')"></span>
      <span class="ped-sw" style="background:#764ba2" onclick="pedSetColor('text','#764ba2')"></span>
      <span class="ped-sw" style="background:#f5a623" onclick="pedSetColor('text','#f5a623')"></span>
      <span class="ped-sw" style="background:#27ae60" onclick="pedSetColor('text','#27ae60')"></span>
      <span class="ped-sw" style="background:#C94A6D" onclick="pedSetColor('text','#C94A6D')"></span>
      <span class="ped-sw ped-sw-x" onclick="pedSetColor('text','')">✕</span>
      <input type="color" onchange="pedSetColor('text',this.value)" style="width:24px;height:24px;border:none;border-radius:6px;cursor:pointer;padding:0;vertical-align:middle">
    </div>
  </div>
</div>
<div class="ped-mf"><label>Mise en forme &amp; surlignage</label>
  <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:5px">
    <button class="ped-fmt" id="pedFmtBold"   onclick="pedToggleFmt('bold')"><b>G</b></button>
    <button class="ped-fmt" id="pedFmtItalic" onclick="pedToggleFmt('italic')"><i>I</i></button>
    <button class="ped-fmt" id="pedFmtUnder"  onclick="pedToggleFmt('under')"><u>S</u></button>
    <span style="width:1px;height:22px;background:#e0e0e0;margin:0 3px"></span>
    <span style="font-size:11px;color:#aaa">Surlignage :</span>
    <span class="ped-sw" style="background:#FFE66D" onclick="pedSetColor('hl','#FFE66D')"></span>
    <span class="ped-sw" style="background:#a8f0c6" onclick="pedSetColor('hl','#a8f0c6')"></span>
    <span class="ped-sw" style="background:#ffc8dd" onclick="pedSetColor('hl','#ffc8dd')"></span>
    <span class="ped-sw" style="background:#b8d4ff" onclick="pedSetColor('hl','#b8d4ff')"></span>
    <span class="ped-sw ped-sw-x" onclick="pedSetColor('hl','')">✕</span>
    <input type="color" onchange="pedSetColor('hl',this.value)" style="width:24px;height:24px;border:none;border-radius:6px;cursor:pointer;padding:0;vertical-align:middle">
  </div>
</div>
<div class="ped-mf"><label>Aperçu</label><div class="ped-prev" id="pedPreview">Aperçu…</div></div>
<div class="ped-mf"><label>Lien (optionnel)</label><input type="url" id="pedItemLink" placeholder="https://…"></div>
<div class="ped-mf"><label>Type</label>
  <select id="pedItemType"><option value="normal">Normal</option><option value="alert">🚨 Alerte</option></select>
</div>
<div class="ped-ma">
  <button class="ped-cancel" onclick="document.getElementById('pedItemModal').classList.remove('open')">Annuler</button>
  <button class="ped-save" id="pedItemSaveBtn" onclick="pedSaveItem()">💾 Enregistrer</button>
</div></div>`;
    document.body.appendChild(itemModal);

    const agendaModal = document.createElement('div');
    agendaModal.id = 'pedAgendaModal';
    agendaModal.className = 'ped-ov';
    agendaModal.innerHTML = `<div class="ped-modal">
<h3 id="pedAgendaModalTitle">Ajouter un évènement</h3>
<div class="ped-mrow">
  <div class="ped-mf"><label>Jour</label><input type="text" id="pedAgJour" maxlength="2" placeholder="15"></div>
  <div class="ped-mf"><label>Mois</label><input type="text" id="pedAgMois" maxlength="5" placeholder="MAI"></div>
</div>
<div class="ped-mf" style="margin-top:10px"><label>Titre</label><input type="text" id="pedAgTitre" placeholder="Titre de l'évènement"></div>
<div class="ped-mf"><label>Heure</label><input type="text" id="pedAgHeure" placeholder="14h00 - 16h00"></div>
<div class="ped-mf"><label>Lieu</label><input type="text" id="pedAgLieu" placeholder="Salle de réunion A"></div>
<div class="ped-mf"><label>Participants</label><input type="text" id="pedAgPart" placeholder="Dr. Martin…"></div>
<div class="ped-ma">
  <button class="ped-cancel" onclick="document.getElementById('pedAgendaModal').classList.remove('open')">Annuler</button>
  <button class="ped-save" onclick="pedSaveAgenda()">💾 Enregistrer</button>
</div></div>`;
    document.body.appendChild(agendaModal);

    if(!document.getElementById('pedToast')) {
        const toast = document.createElement('div');
        toast.id = 'pedToast';
        document.body.appendChild(toast);
    }
}
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _injectModals);
} else {
    _injectModals();
}
