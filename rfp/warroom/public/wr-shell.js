/* Warroom shell: shared header (identity + notifications), @mentions.
   Loaded before each page's own script; exposes window.WR. */
(function(){
  var KEY='XPFmcH2RSsza';
  var LS_WHO='u4r-who-v1';
  var PEOPLE=[
    {id:'martin', name:'Martin', cls:'pa'},
    {id:'leonel', name:'Leonel', cls:'pb'},
    {id:'mike',   name:'Mike',   cls:'pc'}
  ];
  var NAME={}, CLS={};
  PEOPLE.forEach(function(p){NAME[p.id]=p.name; CLS[p.id]=p.cls;});
  var PAGES=[
    {id:'board',    label:'Runbook',  path:'/board.html'},
    {id:'audit',    label:'Audit',    path:'/audit.html'},
    {id:'proposal', label:'Proposal', path:'/proposal.html'},
    {id:'capacity', label:'Capacity', path:'/capacity.html'},
    {id:'questions',label:'Questions',path:'/questions.html'},
    {id:'vendorq',  label:'Vendor Qs',path:'/vendor-questions.html'},
    {id:'process',  label:'Process',  path:'/process.html'},
    {id:'scenarios',label:'Scenarios',path:'/scenarios.html'},
    {id:'wtf',      label:'WTF',      path:'/wtf.html'},
    {id:'preferred',label:'Preferred',path:'/preferred.html'},
    {id:'rant',     label:'Rant',     path:'/rant.html'},
    {id:'planb',    label:'Plan B',   path:'/planb.html'},
    {id:'directory',label:'Directory',path:'/directory.html'},
    {id:'v666',     label:'v.666',    path:'/v666.html'}
  ];
  var LIB=window.WR_LIBRARY||{groups:[],items:[]};
  var here=document.body.getAttribute('data-wr-page')||'';
  var me=''; try{me=localStorage.getItem(LS_WHO)||'';}catch(e){}
  var idCbs=[], locator=null;
  var states={}, paneOpen=false;

  function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fmtDate(iso){try{return new Date(iso).toLocaleDateString(undefined,{day:'numeric',month:'short'});}catch(e){return '';}}
  var MENTION_RE=/@(martin|leonel|mike)\b/gi;
  function linkify(escaped){
    return escaped.replace(/\bhttps?:\/\/[^\s<]+/g,function(u){
      var trail='';
      while(/[).,;:!?\]'"”’]$/.test(u)){trail=u.slice(-1)+trail;u=u.slice(0,-1);}
      return '<a href="'+u+'" target="_blank" rel="noopener">'+u+'</a>'+trail;
    });
  }
  /* Runbook task references (A-03, S-13, I-xmu0hw5a2 …) anywhere in text become links to
     that task on the board. Only text outside existing <a> tags is touched. */
  var TASK_REF_RE=/\b([A-Z])-(\d{2,3}|[a-z][a-z0-9]{8})\b/g;
  function taskrefs(html){
    return String(html).replace(/(<a\b[^>]*>[\s\S]*?<\/a>)|(<[^>]+>)|([^<]+)/g,function(m,a,tag,text){
      if(a||tag)return m;
      return text.replace(TASK_REF_RE,function(ref){
        return '<a class="wr-tref" href="/board.html?wrgo='+ref+'" data-go="'+ref+'">'+ref+'</a>';
      });
    });
  }
  function mentionify(t){
    return taskrefs(linkify(esc(t)).replace(MENTION_RE,function(_,p){
      p=p.toLowerCase();
      return '<b class="wrm '+CLS[p]+'">@'+NAME[p]+'</b>';
    }));
  }
  function fmtKey(k){
    if(/^req-/.test(k))return k.slice(4);
    if(/^sec-/.test(k))return '§'+k.slice(4);
    if(/^gap-/.test(k))return 'Gap '+k.slice(4);
    if(/^h3-/.test(k))return '§'+k.slice(3);
    if(/^chg-/.test(k))return 'Change '+k.slice(4).replace(/^0/,'');
    if(/^svc-/.test(k))return k.slice(4).replace(/-/g,' ');
    if(/^res-/.test(k))return 'Result '+k.slice(4).replace(/-/g,' ');
    if(/^unv-/.test(k))return 'Unverified '+k.slice(4).replace(/-/g,' ');
    if(/^q-/.test(k))return 'Q'+k.slice(2);
    if(/^vq-/.test(k))return 'VQ-'+k.slice(3);
    if(/^pr-/.test(k))return 'Process · '+k.slice(3).replace(/-/g,' ');
    if(/^sc-/.test(k))return 'Scenario · '+k.slice(3).replace(/-/g,' ');
    if(/^wtf-/.test(k))return 'WTF · '+k.slice(4).replace(/-/g,' ');
    if(/^rant-/.test(k))return 'Rant · '+k.slice(5).replace(/-/g,' ');
    if(/^pb-/.test(k))return 'Plan B · '+k.slice(3).replace(/-/g,' ');
    return k;
  }

  /* ---------- identity (header) ---------- */
  var idHost=document.querySelector('.wrs-id');
  function setMe(id){
    me=id;
    try{localStorage.setItem(LS_WHO,me);}catch(e){}
    renderId(); renderBell(); if(paneOpen)renderPane();
    idCbs.forEach(function(cb){try{cb(me);}catch(e){}});
  }
  function renderId(){
    if(!idHost)return;
    var sel=idHost.querySelector('.wrs-idsel'); if(!sel)return;
    var cls={martin:'pa',leonel:'pb',mike:'pc'}[me]||'';
    sel.className='wrs-idsel'+(cls?' on '+cls:'');
    sel.textContent=me?(NAME[me]||me):'pick…';
    idHost.querySelectorAll('.wrs-idmenu button').forEach(function(o){o.classList.toggle('cur',o.dataset.pid===me);});
  }
  if(idHost){
    idHost.innerHTML='<span class="wrs-idl">I am</span>';
    var idSel=document.createElement('button');
    idSel.type='button'; idSel.className='wrs-idsel';
    idSel.setAttribute('aria-haspopup','true'); idSel.setAttribute('aria-label','Who are you?');
    var idMenu=document.createElement('div');
    idMenu.className='wrs-idmenu'; idMenu.hidden=true;
    PEOPLE.forEach(function(p){
      var o=document.createElement('button');
      o.type='button'; o.className=p.cls; o.dataset.pid=p.id; o.textContent=p.name;
      o.addEventListener('click',function(ev){ev.stopPropagation();setMe(p.id);idMenu.hidden=true;});
      idMenu.appendChild(o);
    });
    idSel.addEventListener('click',function(ev){ev.stopPropagation();idMenu.hidden=!idMenu.hidden;});
    document.addEventListener('click',function(){idMenu.hidden=true;});
    idHost.appendChild(idSel); idHost.appendChild(idMenu);
    renderId();
  }
  function nudge(){
    if(!idHost)return;
    idHost.classList.remove('pulse'); void idHost.offsetWidth; idHost.classList.add('pulse');
    idHost.scrollIntoView({block:'nearest'});
  }

  /* expose the sticky header's real height so page elements can stick below it */
  var wrTopbar=document.querySelector('.topbar');
  function setTopbarH(){
    if(wrTopbar)document.documentElement.style.setProperty('--wr-topbar-h',wrTopbar.offsetHeight+'px');
  }
  setTopbarH();
  window.addEventListener('resize',setTopbarH);
  if(wrTopbar&&window.ResizeObserver)new ResizeObserver(setTopbarH).observe(wrTopbar);
  window.addEventListener('load',setTopbarH);

  /* ---------- MEGA NAV: one full-width panel, common to every page ----------
     Replaces the old Sections ▾ and Library ▾ dropdowns. Columns: war-room
     pages, this page's sections, documents & links (wr-library + team-added). */
  var WARROOM_PAGES=[
    {url:'/',              title:'Dashboard',          desc:'Big numbers, time vs tasks'},
    {url:'/board.html',    title:'Runbook (tasks)',    desc:'80 fixed + team tasks'},
    {url:'/audit.html',    title:'RFP audit',          desc:'84 requirement verdicts'},
    {url:'/v666.html',     title:'v.666 (proposal)',    desc:'After the Truth — the price is the strategy'},
    {url:'/preferred.html',title:'PREFERRED (old)',    desc:'Superseded 23 Sep'},
    {url:'/proposal.html', title:'Proposal V2 (old)',  desc:'Superseded 18 Sep'},
    {url:'/questions.html',title:'Mike’s questions',   desc:'Technical Q&A, filtered'},
    {url:'/vendor-questions.html',title:'Vendor questions',desc:'6 to STIHL — vote send/drop'},
    {url:'/process.html',  title:'The Process',        desc:'Dealer lifecycle — editable, logged'},
    {url:'/scenarios.html',title:'Scenarios & pricing idea',desc:'Mandate vs recommendation — the tree'},
    {url:'/wtf.html',      title:'WTF?',                desc:'STIHL’s answers vs their own RFP'},
    {url:'/rant.html',     title:'The rant, answered',  desc:'What the badge is worth; what to ask; what to say in the room'},
    {url:'/planb.html',    title:'Plan B',              desc:'55 previews, $100/mo, straight to dealers'},
    {url:'/directory.html',title:'Dealer directory',    desc:'All 93 STIHL SHOPs — screenshots, audits, Google, filters'},
    {url:'/capacity.html', title:'Capacity report',    desc:'100 dealers, load-tested'},
    {url:'/report-2026-09-16.html',title:'Status report · 16 Sep',desc:'Questions sent, five PRs ready'},
    {url:'/report-2026-09-14.html',title:'Status report · 14 Sep',desc:'Previous report'},
    {url:'/wk1-report.html',title:'Week 1 report',     desc:'How we’re tracking'},
    {url:'/library.html',  title:'Library',            desc:'Index of everything'}
  ];
  var ARCHIVE_PAGES=[
    {url:'/board-v1.html',    title:'Runbook V1 (archive)'},
    {url:'/proposal-v1.html', title:'Proposal V1 (archive)'}
  ];
  var mega=null, megaBtn=null, libLinks={};
  (function(){
    var bar=document.querySelector('.topbar .wrap');
    if(!bar)return;
    // harvest this page's section anchors from the old dropdown, then retire it
    var sectionLinks=[];
    document.querySelectorAll('.wrs-menu .wrs-drop a[href^="#"]').forEach(function(a){
      sectionLinks.push({url:a.getAttribute('href'),title:a.textContent});
    });
    document.querySelectorAll('.wrs-menu').forEach(function(m){m.remove();});
    megaBtn=document.createElement('button');
    megaBtn.type='button'; megaBtn.className='wrs-menubtn wrs-meganbtn';
    megaBtn.setAttribute('aria-haspopup','true'); megaBtn.setAttribute('aria-expanded','false');
    megaBtn.innerHTML='☰ Menu';
    var brand=bar.querySelector('.brand');
    if(brand)brand.insertAdjacentElement('afterend',megaBtn);
    else bar.insertBefore(megaBtn,bar.firstChild);
    mega=document.createElement('div');
    mega.className='wrs-mega';
    document.body.appendChild(mega);
    function renderMega(){
      var path=location.pathname==='/index.html'?'/':location.pathname;
      var html='<div class="wrs-megain">';
      // col 1: war room pages
      html+='<div class="wrs-mcol"><h6>War room</h6>';
      WARROOM_PAGES.forEach(function(p){
        html+='<a href="'+p.url+'"'+(p.url===path?' class="cur" aria-current="page"':'')+'>'+esc(p.title)+'<small>'+esc(p.desc)+'</small></a>';
      });
      html+='<div class="wrs-march">'+ARCHIVE_PAGES.map(function(p){return '<a href="'+p.url+'">'+esc(p.title)+'</a>';}).join('')+'</div></div>';
      // col 2: this page's sections
      if(sectionLinks.length){
        html+='<div class="wrs-mcol"><h6>On this page</h6>';
        sectionLinks.forEach(function(sl){html+='<a href="'+esc(sl.url)+'">'+esc(sl.title)+'</a>';});
        html+='</div>';
      }
      // cols 3+: documents & links from the library (live items only)
      var items=LIB.items?LIB.items.filter(function(i){return i.status==='live'&&i.url;}):[];
      Object.keys(libLinks).forEach(function(id){var l=libLinks[id];if(l&&l.url)items.push({g:l.group||'team',title:l.title,url:l.url,status:'live'});});
      var showGroups=['artifacts','hubs','live','team'];
      showGroups.forEach(function(gid){
        var g=(LIB.groups||[]).filter(function(x){return x.id===gid;})[0];
        var its=items.filter(function(i){return (i.g||'team')===gid;});
        if(!g||!its.length)return;
        html+='<div class="wrs-mcol"><h6>'+esc(g.label)+'</h6>';
        its.forEach(function(i){
          var ext=/^https?:/.test(i.url)&&i.url.indexOf(location.origin)!==0;
          html+='<a href="'+esc(i.url)+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+esc(i.title)+(ext?' ↗':'')+'</a>';
        });
        html+='</div>';
      });
      html+='</div><div class="wrs-megafoot"><a href="/library.html">Open the full library →</a></div>';
      mega.innerHTML=html;
    }
    renderMega();
    var megaOpenedAt=0;
    function openMega(){mega.classList.add('open');megaBtn.classList.add('open');megaBtn.setAttribute('aria-expanded','true');megaOpenedAt=Date.now();}
    function closeMega(){mega.classList.remove('open');megaBtn.classList.remove('open');megaBtn.setAttribute('aria-expanded','false');}
    megaBtn.addEventListener('click',function(ev){
      ev.stopPropagation();
      // hover may have just opened it — a click right after should not snap it shut
      if(mega.classList.contains('open')&&Date.now()-megaOpenedAt>400)closeMega();else openMega();
    });
    megaBtn.addEventListener('mouseenter',openMega);
    mega.addEventListener('mouseleave',function(ev){if(ev.relatedTarget&&ev.relatedTarget!==megaBtn&&!megaBtn.contains(ev.relatedTarget))closeMega();});
    document.addEventListener('click',function(ev){
      if(!mega.contains(ev.target)&&ev.target!==megaBtn)closeMega();
    });
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeMega();});
    mega.addEventListener('click',function(ev){if(ev.target.closest('a'))closeMega();});
    fetch('/api/state?page=library',{headers:{'x-warroom-key':KEY}})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(d){libLinks=d.links||{};renderMega();}).catch(function(){});
  })();

  /* ---------- notifications ---------- */
  var bellHost=document.querySelector('.wrs-bell');
  var bellBtn=null, pane=null;
  if(bellHost){
    bellHost.innerHTML='<button type="button" class="wrs-bellbtn" aria-label="Notifications" title="Mentions & your tasks">&#128276;<span class="wrs-badge" hidden>0</span></button>';
    bellBtn=bellHost.querySelector('.wrs-bellbtn');
    pane=document.createElement('div');
    pane.className='wrs-pane'; pane.hidden=true;
    document.body.appendChild(pane);
    bellBtn.addEventListener('click',function(ev){
      ev.stopPropagation();
      paneOpen?closePane():openPane();
    });
    document.addEventListener('click',function(ev){
      if(paneOpen&&!pane.contains(ev.target))closePane();
    });
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closePane();});
    pane.addEventListener('click',function(ev){
      if(ev.target.closest('a'))return;
      var tb=ev.target.closest('.wrs-tab');
      if(tb){ev.stopPropagation();paneTab=tb.dataset.tab;renderPane();return;}
      if(ev.target.closest('.wrs-dismissall')){
        ev.stopPropagation();
        var list=paneTab==='activity'?activityEvents():events();
        dismiss(list.map(function(e){return {page:e.page.id,id:e.eid};}));
        return;
      }
      var x=ev.target.closest('.wrs-x');
      if(x){
        ev.stopPropagation();
        var row=x.closest('.wrs-item');
        dismiss([{page:row.getAttribute('data-page'),id:row.getAttribute('data-eid')}]);
        return;
      }
      var it=ev.target.closest('[data-go]');
      if(!it)return;
      var pid=it.getAttribute('data-page'), key=it.getAttribute('data-go');
      closePane();
      if(pid===here&&locator&&locator(key))return;
      var pg=PAGES.filter(function(p){return p.id===pid;})[0];
      if(pg)location.href=pg.path+'?wrgo='+encodeURIComponent(key);
    });
  }

  /* per-user dismissed notifications — stored server-side, synced across devices */
  function apiPost(pageId,op){
    return fetch('/api/state?page='+pageId,{method:'POST',headers:{'x-warroom-key':KEY,'content-type':'application/json'},body:JSON.stringify(op)});
  }
  var localDismissed={};
  function dismissedSet(){
    var s={};
    PAGES.forEach(function(p){
      var d=states[p.id];
      var ids=d&&d.seen&&d.seen[me];
      if(ids&&ids.forEach)ids.forEach(function(i){s[i]=1;});
    });
    Object.keys(localDismissed).forEach(function(i){s[i]=1;});
    return s;
  }
  function dismiss(items){ // [{page:<pageId>, id:<eventId>}]
    if(!me||!items.length)return;
    var byPage={};
    items.forEach(function(it){
      localDismissed[it.id]=1;
      (byPage[it.page]=byPage[it.page]||[]).push(it.id);
    });
    Object.keys(byPage).forEach(function(pg){
      apiPost(pg,{t:'seen',person:me,add:byPage[pg]}).catch(function(){});
    });
    renderBell(); if(paneOpen)renderPane();
  }
  function cid(c){return 'c|'+(c.id||(c.key+'|'+c.at));}
  function assignedTasks(){
    var b=states.board, out={};
    if(b)Object.keys(b.tasks||{}).forEach(function(t){
      var v=b.tasks[t];
      if(v&&v.assignee===me)out[t]=v;
    });
    return out;
  }
  function blockedEvent(p,t,v){
    var eid='b|'+t+'|'+v.blockedAt;
    var on=Array.isArray(v.blockedOn)?v.blockedOn:[];
    var text=(on.length?'Blocked on '+on.join(', ')+(v.blockedWhy?' — ':''):'')+(v.blockedWhy||'');
    return {page:p,key:t,author:v.blockedBy,at:v.blockedAt,kind:'blocked',text:text,eid:eid,on:on};
  }
  function events(){
    if(!me)return [];
    var out=[], mine=assignedTasks(), dis=dismissedSet();
    var meRe=new RegExp('@'+me+'\\b','i');
    PAGES.forEach(function(p){
      var d=states[p.id]; if(!d)return;
      (d.comments||[]).forEach(function(c){
        if(!c||c.author===me||dis[cid(c)])return;
        var mention=meRe.test(c.text||'');
        var onMine=p.id==='board'&&mine[c.key];
        if(mention||onMine)out.push({page:p,key:c.key,author:c.author,at:c.at,kind:mention?'mention':'reply',text:c.text||'',eid:cid(c)});
      });
      // Someone is blocked on a task assigned to me (or blocked my own task): that's for me.
      if(p.id==='board')Object.keys(d.tasks||{}).forEach(function(t){
        var v=d.tasks[t];
        if(!v||!v.blocked||v.done||!v.blockedBy||v.blockedBy===me||!v.blockedAt)return;
        var e=blockedEvent(p,t,v);
        if(dis[e.eid])return;
        var holdsMine=e.on.some(function(x){return mine[x];});
        if(holdsMine||mine[t])out.push(e);
      });
    });
    out.sort(function(a,b){return a.at<b.at?1:-1;});
    return out.slice(0,40);
  }
  /* everything the other two did, across all pages: comments, completions, flags */
  function activityEvents(){
    if(!me)return [];
    var out=[], dis=dismissedSet();
    PAGES.forEach(function(p){
      var d=states[p.id]; if(!d)return;
      (d.comments||[]).forEach(function(c){
        if(!c||c.author===me||dis[cid(c)])return;
        out.push({page:p,key:c.key,author:c.author,at:c.at,kind:'comment',text:c.text||'',eid:cid(c)});
      });
      Object.keys(d.tasks||{}).forEach(function(t){
        var v=d.tasks[t], eid='d|'+t+'|'+(v&&v.doneAt);
        if(v&&v.done&&v.doneBy&&v.doneBy!==me&&v.doneAt&&!dis[eid])out.push({page:p,key:t,author:v.doneBy,at:v.doneAt,kind:'done',text:v.title||'',eid:eid});
        if(v&&v.blocked&&!v.done&&v.blockedBy&&v.blockedBy!==me&&v.blockedAt){
          var be=blockedEvent(p,t,v);
          if(!dis[be.eid])out.push(be);
        }
      });
      Object.keys(d.marks||{}).forEach(function(k){
        var m=d.marks[k], eid='f|'+k+'|'+(m&&m.at);
        if(m&&m.flagged&&m.by&&m.by!==me&&m.at&&!dis[eid])out.push({page:p,key:k,author:m.by,at:m.at,kind:'flag',text:'',eid:eid});
      });
      (d.revs||[]).forEach(function(r){
        var eid='e|'+r.id;
        if(r&&r.by&&r.by!==me&&r.at&&!dis[eid])out.push({page:p,key:r.key,author:r.by,at:r.at,kind:r.deleted?'delete':'edit',text:r.title||'',eid:eid});
      });
    });
    out.sort(function(a,b){return a.at<b.at?1:-1;});
    return out.slice(0,60);
  }
  function renderBell(){
    if(!bellBtn)return;
    var badge=bellBtn.querySelector('.wrs-badge');
    var n=activityEvents().length;
    badge.hidden=!me||n===0;
    badge.textContent=n>9?'9+':n;
  }

  /* task index (title + description) for the assigned list and search */
  var titlesCache=null, titlesP=null;
  function titlesFromDoc(doc){
    var map={};
    doc.querySelectorAll('.task input[data-tid]').forEach(function(b){
      var tid=b.dataset.tid;
      var lab=b.parentNode.querySelector('.tt'), td=b.parentNode.querySelector('.td');
      map[tid]={title:lab?lab.textContent.replace(tid,'').trim():'',desc:td?td.textContent.trim():''};
    });
    return map;
  }
  function taskIndex(){
    var withCustom=function(map){
      var b=states.board;
      if(b)Object.keys(b.tasks||{}).forEach(function(t){
        var v=b.tasks[t];
        if(v&&v.custom&&v.title&&!map[t])map[t]={title:v.title,desc:v.desc||''};
      });
      return map;
    };
    if(here==='board')return Promise.resolve(withCustom(titlesFromDoc(document)));
    if(titlesCache)return Promise.resolve(withCustom(titlesCache));
    titlesP=titlesP||fetch('/board.html').then(function(r){return r.text();}).then(function(t){
      titlesCache=titlesFromDoc(new DOMParser().parseFromString(t,'text/html'));
      return titlesCache;
    }).catch(function(){return {};});
    return titlesP.then(function(m){return withCustom(m);});
  }

  var paneTab='foryou';
  function itemHTML(e){
    var verb={mention:'mentioned you',reply:'commented on your task',comment:'commented',done:'completed',blocked:'is ⛔ blocked on',flag:'flagged',edit:'edited',delete:'removed'}[e.kind]||e.kind;
    var txt=e.text?('<span class="wt">'+mentionify(e.text.length>200?e.text.slice(0,200)+'…':e.text)+'</span>'):'';
    return '<div class="wrs-item" role="button" tabindex="0" data-page="'+e.page.id+'" data-go="'+esc(e.key)+'" data-eid="'+esc(e.eid||'')+'">'
      +'<button type="button" class="wrs-x" title="Dismiss — mark as seen" aria-label="Dismiss">✕</button>'
      +'<span class="wm"><b class="wrm '+(CLS[e.author]||'')+'">'+esc(NAME[e.author]||e.author)+'</b> '+verb
      +' · '+esc(fmtKey(e.key))+' · '+esc(e.page.label)+' · '+esc(fmtDate(e.at))+'</span>'+txt+'</div>';
  }
  function renderPane(){
    if(!pane)return;
    if(!me){
      pane.innerHTML='<p class="wrs-empty">Pick who you are (the “I am” dropdown in the header) to see your mentions, tasks and team activity.</p>';
      return;
    }
    var html='<div class="wrs-tabs">'
      +'<button type="button" class="wrs-tab'+(paneTab==='foryou'?' active':'')+'" data-tab="foryou">For you</button>'
      +'<button type="button" class="wrs-tab'+(paneTab==='activity'?' active':'')+'" data-tab="activity">Activity</button>'
      +'<button type="button" class="wrs-dismissall" hidden>Dismiss all</button></div>';
    if(paneTab==='activity'){
      var acts=activityEvents();
      if(!acts.length)html+='<p class="wrs-empty">All caught up — every comment, completed task, blocker and flag from the others lands here until you dismiss it.</p>';
      acts.forEach(function(e){html+=itemHTML(e);});
      pane.innerHTML=html;
      pane.querySelector('.wrs-dismissall').hidden=!acts.length;
      return;
    }
    var evs=events();
    html+='<h5>Mentions &amp; replies</h5>';
    if(!evs.length)html+='<p class="wrs-empty">Nothing waiting — comments that @'+esc(me)+' you, land on your tasks, or blockers raised on your tasks stay here until you dismiss them.</p>';
    evs.forEach(function(e){html+=itemHTML(e);});
    html+='<h5>Assigned to you</h5><div class="wrs-asg"><p class="wrs-empty">Loading…</p></div>';
    pane.innerHTML=html;
    pane.querySelector('.wrs-dismissall').hidden=!evs.length;
    var mine=assignedTasks(), open=Object.keys(mine).filter(function(t){return !mine[t].done;}).sort();
    var host=pane.querySelector('.wrs-asg');
    if(!open.length){host.innerHTML='<p class="wrs-empty">No open tasks assigned to you on the runbook.</p>';return;}
    taskIndex().then(function(titles){
      if(!pane.querySelector('.wrs-asg'))return;
      pane.querySelector('.wrs-asg').innerHTML=open.map(function(t){
        return '<div class="wrs-item" role="button" tabindex="0" data-page="board" data-go="'+esc(t)+'">'
          +'<span class="wt">'+(mine[t].blocked?'⛔ ':'')+'<span class="mono">'+esc(t)+'</span> '+esc((titles[t]||{}).title||'')+'</span></div>';
      }).join('');
    });
  }
  function openPane(){
    if(!pane||!bellBtn)return;
    closeSearch();
    paneTab=events().length?'foryou':'activity';
    renderPane();
    var r=bellBtn.getBoundingClientRect();
    pane.style.top=(r.bottom+8)+'px';
    pane.style.right=Math.max(10,window.innerWidth-r.right)+'px';
    pane.hidden=false; paneOpen=true;
    fetchAll();
  }
  function closePane(){
    if(!pane||!paneOpen)return;
    pane.hidden=true; paneOpen=false;
  }

  function fetchAll(){
    PAGES.forEach(function(p){
      fetch('/api/state?page='+p.id,{headers:{'x-warroom-key':KEY}})
        .then(function(r){if(!r.ok)throw 0;return r.json();})
        .then(function(d){states[p.id]=d;renderBell();if(paneOpen)renderPane();})
        .catch(function(){});
    });
  }
  if(bellHost){
    fetchAll();
    setInterval(fetchAll,45000);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)fetchAll();});
  }

  /* ---------- mention autocomplete ---------- */
  function attachMentions(input){
    if(!input)return;
    var wrap=input.parentNode;
    wrap.classList.add('wrm-host');
    var menu=document.createElement('div');
    menu.className='wrm-menu'; menu.hidden=true;
    wrap.appendChild(menu);
    var matches=[], sel=0;
    function close(){menu.hidden=true;matches=[];}
    function render(){
      menu.innerHTML=matches.map(function(p,i){
        return '<button type="button" data-pid="'+p.id+'"'+(i===sel?' class="sel"':'')+'><b class="wrm '+p.cls+'">@'+p.name+'</b></button>';
      }).join('');
    }
    function update(){
      var pos=input.selectionStart==null?input.value.length:input.selectionStart;
      var m=input.value.slice(0,pos).match(/@([a-z]*)$/i);
      if(!m){close();return;}
      var q=m[1].toLowerCase();
      matches=PEOPLE.filter(function(p){return p.id.indexOf(q)===0;});
      if(!matches.length){close();return;}
      sel=0; render(); menu.hidden=false;
    }
    function pick(pid){
      var pos=input.selectionStart==null?input.value.length:input.selectionStart;
      var before=input.value.slice(0,pos).replace(/@[a-z]*$/i,'@'+pid+' ');
      input.value=before+input.value.slice(pos);
      close(); input.focus();
      input.setSelectionRange(before.length,before.length);
    }
    input.addEventListener('input',update);
    input.addEventListener('keydown',function(ev){
      if(menu.hidden)return;
      if(ev.key==='ArrowDown'){sel=(sel+1)%matches.length;render();ev.preventDefault();}
      else if(ev.key==='ArrowUp'){sel=(sel+matches.length-1)%matches.length;render();ev.preventDefault();}
      else if(ev.key==='Enter'||ev.key==='Tab'){pick(matches[sel].id);ev.preventDefault();}
      else if(ev.key==='Escape')close();
    });
    input.addEventListener('blur',function(){setTimeout(close,150);});
    menu.addEventListener('mousedown',function(ev){
      var b=ev.target.closest('button[data-pid]');
      if(b){ev.preventDefault();pick(b.dataset.pid);}
    });
  }

  /* ---------- search: tasks + comments across all three pages ---------- */
  var srchPane=null, srchInput=null, srchOpen=false, srchBtn=null;
  function openSearch(){
    if(!srchPane)return;
    closePane();
    var r=srchBtn.getBoundingClientRect();
    srchPane.style.top=(r.bottom+8)+'px';
    srchPane.style.right=Math.max(10,window.innerWidth-r.right)+'px';
    srchPane.hidden=false; srchOpen=true;
    taskIndex();
    srchInput.focus(); renderSearch();
  }
  function closeSearch(){if(srchPane&&srchOpen){srchPane.hidden=true;srchOpen=false;}}
  function snippet(text,q){
    var i=text.toLowerCase().indexOf(q);
    if(i<0)return text.slice(0,120);
    var s=Math.max(0,i-50);
    return (s>0?'…':'')+text.slice(s,i+q.length+70)+(i+q.length+70<text.length?'…':'');
  }
  function renderSearch(){
    if(!srchPane)return;
    var res=srchPane.querySelector('.wrs-sres');
    var q=srchInput.value.trim().toLowerCase();
    if(q.length<2){res.innerHTML='<p class="wrs-empty">Type at least 2 characters — searches every task and every comment across all pages.</p>';return;}
    taskIndex().then(function(tasks){
      if(srchInput.value.trim().toLowerCase()!==q)return;
      var out=[];
      Object.keys(tasks).forEach(function(tid){
        var t=tasks[tid];
        if((tid+' '+(t.title||'')+' '+(t.desc||'')).toLowerCase().indexOf(q)<0)return;
        out.push('<div class="wrs-item" role="button" tabindex="0" data-page="board" data-go="'+esc(tid)+'">'
          +'<span class="wm">Task · '+esc(tid)+' · Runbook</span>'
          +'<span class="wt"><b>'+esc(t.title||'')+'</b> '+esc(snippet(t.desc||'',q))+'</span></div>');
      });
      PAGES.forEach(function(p){
        var d=states[p.id]; if(!d)return;
        (d.comments||[]).forEach(function(c){
          if(!c||(c.text||'').toLowerCase().indexOf(q)<0)return;
          out.push('<div class="wrs-item" role="button" tabindex="0" data-page="'+p.id+'" data-go="'+esc(c.key)+'">'
            +'<span class="wm"><b class="wrm '+(CLS[c.author]||'')+'">'+esc(NAME[c.author]||c.author)+'</b> commented · '+esc(fmtKey(c.key))+' · '+esc(p.label)+' · '+esc(fmtDate(c.at))+'</span>'
            +'<span class="wt">'+mentionify(snippet(c.text||'',q))+'</span></div>');
        });
      });
      res.innerHTML=out.length?out.slice(0,25).join(''):'<p class="wrs-empty">No matches for “'+esc(q)+'”.</p>';
    });
  }
  var wrsRight=document.querySelector('.wrs-right');
  if(wrsRight){
    srchBtn=document.createElement('button');
    srchBtn.type='button'; srchBtn.className='wrs-srchbtn'; srchBtn.innerHTML='&#128269;';
    srchBtn.title='Search tasks & comments'; srchBtn.setAttribute('aria-label','Search');
    wrsRight.insertBefore(srchBtn,wrsRight.firstChild);
    srchPane=document.createElement('div');
    srchPane.className='wrs-pane wrs-spane'; srchPane.hidden=true;
    srchPane.innerHTML='<input type="text" class="wrs-sinput" placeholder="Search tasks & comments…" aria-label="Search"><div class="wrs-sres"></div>';
    document.body.appendChild(srchPane);
    srchInput=srchPane.querySelector('input');
    srchBtn.addEventListener('click',function(ev){
      ev.stopPropagation();
      srchOpen?closeSearch():openSearch();
    });
    document.addEventListener('click',function(ev){
      if(srchOpen&&!srchPane.contains(ev.target))closeSearch();
    });
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeSearch();});
    var srchDeb=null;
    srchInput.addEventListener('input',function(){clearTimeout(srchDeb);srchDeb=setTimeout(renderSearch,120);});
    srchInput.addEventListener('keydown',function(ev){
      if(ev.key==='Enter'){
        var first=srchPane.querySelector('.wrs-sres [data-go]');
        if(first)first.click();
      }
    });
    srchPane.addEventListener('click',function(ev){
      if(ev.target.closest('a'))return;
      var it=ev.target.closest('[data-go]');
      if(!it)return;
      var pid=it.getAttribute('data-page'), key=it.getAttribute('data-go');
      closeSearch();
      if(pid===here&&locator&&locator(key))return;
      var pg=PAGES.filter(function(p){return p.id===pid;})[0];
      if(pg)location.href=pg.path+'?wrgo='+encodeURIComponent(key);
    });
  }

  /* long comments: clamp + View more/View less (state survives re-renders) */
  var expandedComments={};
  function commentBody(c){
    var text=c.text||'';
    var body=mentionify(text);
    if(text.length<=300&&text.split('\n').length<=5)return '<p>'+body+'</p>';
    var id=c.id||(c.key+'|'+c.at);
    var open=!!expandedComments[id];
    return '<p class="wrc'+(open?'':' clamp')+'">'+body+'</p>'
      +'<button type="button" class="wrc-more" data-cid="'+esc(id)+'">'+(open?'View less':'View more')+'</button>';
  }
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('.wrc-more'); if(!b)return;
    var id=b.getAttribute('data-cid');
    expandedComments[id]=!expandedComments[id];
    var p=b.previousElementSibling;
    if(p)p.classList.toggle('clamp',!expandedComments[id]);
    b.textContent=expandedComments[id]?'View less':'View more';
  });

  /* emoji reactions on comments: 👍 👎 ✅ ❌, one toggle per person.
     Only emojis with reactions render as chips; new reactions come from the
     "React" button in the comment header (popover with the four options). */
  var REACTS=['👍','👎','✅','❌'];
  function reactionBar(c,key){
    if(!c||!c.id)return '';
    var r=c.reactions||{};
    var chips=REACTS.filter(function(e){return (r[e]||[]).length;}).map(function(e){
      var who=r[e], mine=me&&who.indexOf(me)>=0;
      var names=who.map(function(w){return NAME[w]||w;}).join(', ');
      return '<button type="button" class="crb has'+(mine?' mine':'')+'"'
        +' data-remoji="'+e+'" data-cid="'+esc(c.id)+'" data-key="'+esc(key)+'"'
        +' title="'+esc(names)+'" aria-label="'+esc('React '+e+' — '+names)+'">'
        +e+'<span>'+who.length+'</span></button>';
    }).join('');
    return chips?'<span class="crx">'+chips+'</span>':'';
  }

  /* one comment item (header: name · date · Reply · React; body; reactions; replies) */
  function citemHTML(c,key,isReply,children,rootId){
    var own=(c.author===me&&c.id);
    var btns=own?('<button type="button" class="cdel" data-cid="'+esc(c.id)+'" data-key="'+esc(key)+'" title="Delete comment" aria-label="Delete comment">✕</button>'
      +'<button type="button" class="cedit" data-cid="'+esc(c.id)+'" data-key="'+esc(key)+'" title="Edit comment">edit</button>'):'';
    var acts='';
    if(c.id){
      // a Reply on a reply continues the same single-level thread (targets the root)
      var replyTo=isReply?rootId:c.id;
      acts=(replyTo?' · <button type="button" class="cmact crply" data-cid="'+esc(replyTo)+'" data-key="'+esc(key)+'">Reply</button>':'')
        +' · <button type="button" class="cmact cract" data-cid="'+esc(c.id)+'" data-key="'+esc(key)+'">React</button>';
    }
    var kidsHtml=(children&&children.length)
      ?'<div class="creplies">'+children.map(function(k){return citemHTML(k,key,true,null,c.id);}).join('')+'</div>':'';
    return '<div class="citem'+(isReply?' crepl':'')+'">'+btns
      +'<b>'+esc(NAME[c.author]||c.author||'?')+'</b> <time>'+esc(fmtDate(c.at))+(c.edited?' · edited':'')+'</time>'+acts
      +commentBody(c)+reactionBar(c,key)+kidsHtml+'</div>';
  }
  function commentListHTML(cm,key){
    var roots=[],kids={},ids={};
    cm.forEach(function(c){if(c.id)ids[c.id]=1;});
    cm.forEach(function(c){
      if(c.parent&&ids[c.parent]){(kids[c.parent]=kids[c.parent]||[]).push(c);}
      else roots.push(c);
    });
    return roots.map(function(c){return citemHTML(c,key,false,c.id?kids[c.id]:null);}).join('');
  }

  /* the React button opens a small popover with the four emojis */
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('.cract');
    if(!b){
      if(!ev.target.closest('.crmenu'))document.querySelectorAll('.crmenu').forEach(function(x){x.remove();});
      return;
    }
    if(b.nextElementSibling&&b.nextElementSibling.classList&&b.nextElementSibling.classList.contains('crmenu')){
      b.nextElementSibling.remove();return;
    }
    document.querySelectorAll('.crmenu').forEach(function(x){x.remove();});
    var m=document.createElement('span');
    m.className='crmenu';
    m.innerHTML=REACTS.map(function(e){
      return '<button type="button" class="crb" data-remoji="'+e+'" data-cid="'+esc(b.dataset.cid)+'" data-key="'+esc(b.dataset.key)+'">'+e+'</button>';
    }).join('');
    b.insertAdjacentElement('afterend',m);
  });

  /* comment textarea: Enter submits, Shift+Enter = newline, auto-grow, mentions */
  function wireCommentBox(ta){
    if(!ta)return;
    function grow(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,140)+'px';}
    ta.addEventListener('input',grow);
    // added BEFORE attachMentions so an open mention menu keeps its Enter
    ta.addEventListener('keydown',function(ev){
      if(ev.key!=='Enter'||ev.shiftKey)return;
      var menu=ta.parentNode.querySelector('.wrm-menu');
      if(menu&&!menu.hidden)return;
      ev.preventDefault();
      var f=ta.closest('form');
      if(f){if(f.requestSubmit)f.requestSubmit();else f.dispatchEvent(new Event('submit',{cancelable:true}));}
    });
    var f=ta.closest('form');
    if(f)f.addEventListener('submit',function(){setTimeout(function(){ta.style.height='auto';},0);});
    attachMentions(ta);
  }

  /* ---------- deep links (?wrgo=key) ---------- */
  function maybeGoto(){
    var m=location.search.match(/[?&]wrgo=([^&]+)/);
    if(!m||!locator)return;
    var key=decodeURIComponent(m[1]);
    setTimeout(function(){locator(key);},250);
  }

  window.WR={
    get me(){return me;},
    onIdentity:function(cb){idCbs.push(cb);},
    registerLocator:function(fn){locator=fn;maybeGoto();},
    mentionify:mentionify,
    taskrefs:taskrefs,
    TASK_REF_RE:TASK_REF_RE,
    commentBody:commentBody,
    reactionBar:reactionBar,
    commentListHTML:commentListHTML,
    attachMentions:attachMentions,
    wireCommentBox:wireCommentBox,
    nudge:nudge
  };
})();
