(function(){
'use strict';
var d=document;d.documentElement.classList.remove('no-js');
// ---------- Konfiguration Anfrageformular ----------
// Leer = Demo-Modus (keine E-Mail, Vorschau). Für den Livebetrieb z.B.:
// 'https://formsubmit.co/ajax/info@priori.ch'
var FORM_ENDPOINT='';
var TO='info@priori.ch';
// header
var hd=d.querySelector('.site-header');
function sc(){hd&&hd.classList.toggle('scrolled',window.scrollY>10)}window.addEventListener('scroll',sc,{passive:true});sc();
var bg=d.querySelector('.burger'),mn=d.getElementById('mnav');
if(bg&&mn)bg.addEventListener('click',function(){var o=bg.getAttribute('aria-expanded')==='true';bg.setAttribute('aria-expanded',String(!o));mn.hidden=o;});
// reveal
var els=d.querySelectorAll('.reveal');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});els.forEach(function(e){io.observe(e)})}else els.forEach(function(e){e.classList.add('in')});
// collapsible intro
d.querySelectorAll('.collapsible').forEach(function(c){if(c.scrollHeight>760){c.classList.add('is-collapsed');var b=d.createElement('button');b.className='btn btn-ghost expand';b.type='button';b.textContent=c.getAttribute('data-more')||'Weiterlesen';b.addEventListener('click',function(){c.classList.remove('is-collapsed');b.remove()});c.after(b)}});
// review filter
var chips=d.querySelectorAll('.chip[data-year]');
chips.forEach(function(ch){ch.addEventListener('click',function(){chips.forEach(function(x){x.classList.toggle('is-on',x===ch)});var y=ch.getAttribute('data-year');d.querySelectorAll('#rgrid .rcard').forEach(function(r){r.classList.toggle('is-hidden',y!=='all'&&r.getAttribute('data-year')!==y)})})});
// ---------- Herkunft (Referrer / UTM) erfassen: first touch, pro Sitzung ----------
var KEY='mh_attr';
function classify(ref,utm){
  if(utm)return utm;
  if(!ref)return 'direkt';
  var h;try{h=new URL(ref).hostname}catch(e){return 'direkt'}
  if(h===location.hostname)return null;
  if(/(^|\.)google\./.test(h))return 'google';
  if(/instagram\.com$/.test(h))return 'instagram';
  if(/facebook\.com$|fb\.me$/.test(h))return 'facebook';
  if(/bing\.com$/.test(h))return 'bing';
  if(/duckduckgo\.com$/.test(h))return 'duckduckgo';
  return h;
}
try{
  var q=new URLSearchParams(location.search),utm=q.get('utm_source');
  var stored=JSON.parse(sessionStorage.getItem(KEY)||'null');
  var src=classify(d.referrer,utm);
  if(!stored||utm){
    stored={quelle:src||'direkt',utm_source:utm||'',utm_medium:q.get('utm_medium')||'',utm_campaign:q.get('utm_campaign')||'',referrer:(src&&d.referrer&&src!=='direkt')?d.referrer:'',landing:location.pathname};
    sessionStorage.setItem(KEY,JSON.stringify(stored));
  }
}catch(e){stored={quelle:'direkt',utm_source:'',utm_medium:'',utm_campaign:'',referrer:'',landing:location.pathname}}
// Anfrage-Links: Reise + Quellseite mitgeben
d.querySelectorAll('a[data-enquiry]').forEach(function(a){a.addEventListener('click',function(){
  try{var u=new URL(a.href);if(a.getAttribute('data-trip'))u.searchParams.set('reise',a.getAttribute('data-trip'));u.searchParams.set('von',location.pathname);a.href=u.toString()}catch(e){}
})});
// ---------- Formular ----------
var f=d.getElementById('enquiry');if(!f)return;
var lang=f.getAttribute('data-lang')||'de';
var LBLS={de:['Reise','Name','E-Mail','Telefon','Reisende','Zeitraum','Nachricht','Quellseite','Sprache','Herkunft','Referrer','UTM','Einstiegsseite','Gesendet','Individuelle Anfrage'],
 fr:['Voyage','Nom','E-mail','Téléphone','Voyageurs','Période','Message','Page source','Langue','Provenance','Referrer','UTM','Page d\'entrée','Envoyé','Demande sur mesure'],
 en:['Trip','Name','E-mail','Phone','Travellers','Period','Message','Source page','Language','Source','Referrer','UTM','Landing page','Sent','Tailor-made enquiry']};
var LBL=LBLS.de; // E-Mail-Inhalt immer deutsch (Postfach PRIORI), Sprache wird separat ausgewiesen
var OTHER=LBLS[lang][14];
var qs=new URLSearchParams(location.search),pre=qs.get('reise'),from=qs.get('von');
var sel=f.querySelector('[name=reise]');
if(pre&&sel){var hit=false;[].forEach.call(sel.options,function(o){if(o.text===pre){o.selected=true;hit=true}});if(!hit){var o=d.createElement('option');o.text=pre;o.selected=true;sel.add(o)}}
function val(n){var e=f.elements[n];return e?String(e.value||'').trim():''}
f.addEventListener('submit',function(ev){
  ev.preventDefault();
  var bad=[];['name','email','nachricht'].forEach(function(n){var e=f.elements[n];var ok=e.value.trim()&&(n!=='email'||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.value.trim()));e.classList.toggle('invalid',!ok);if(!ok)bad.push(e)});
  var c=f.elements.einverstanden;c.classList.toggle('invalid',!c.checked);if(!c.checked)bad.push(c);
  f.querySelector('.ferr').hidden=!bad.length;if(bad.length){bad[0].focus();return}
  if(val('_honey'))return;
  var reise=val('reise')||OTHER;
  var source=from||(document.referrer&&new URL(document.referrer).hostname===location.hostname?new URL(document.referrer).pathname:location.pathname);
  var a=stored||{};
  var utmS=[a.utm_source,a.utm_medium,a.utm_campaign].filter(Boolean).join(' / ')||'–';
  var subject='[Website-Anfrage] '+reise;
  var rows=[[LBL[0],reise],[LBL[1],val('name')],[LBL[2],val('email')],[LBL[3],val('telefon')||'–'],[LBL[4],val('personen')||'–'],[LBL[5],val('zeitraum')||'–'],[LBL[6],val('nachricht')],
    ['—',''],[LBL[7],location.origin+source],[LBL[8],lang.toUpperCase()],[LBL[9],a.quelle||'direkt'],[LBL[10],a.referrer||'–'],[LBL[11],utmS],[LBL[12],a.landing||'–'],[LBL[13],new Date().toLocaleString('de-CH',{timeZone:'Europe/Zurich'})]];
  var body='Neue Anfrage über die Website\n\n'+rows.map(function(r){return r[0]==='—'?'---- Herkunft der Anfrage ----':r[0]+': '+r[1]}).join('\n');
  var done=function(){
    d.getElementById('pv-subj').textContent=subject;d.getElementById('pv-body').textContent=body;
    d.getElementById('pv-mailto').href='mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    if(FORM_ENDPOINT){var n=d.querySelector('.demo-note');if(n)n.hidden=true}
    f.hidden=true;var ok=d.getElementById('fok');ok.hidden=false;ok.focus();ok.scrollIntoView({behavior:'smooth',block:'center'});
    window.__lastEnquiry={subject:subject,body:body};
  };
  if(!FORM_ENDPOINT){done();return}
  var payload={_subject:subject,_template:'table',_captcha:'false',reise:reise,name:val('name'),email:val('email'),telefon:val('telefon'),personen:val('personen'),zeitraum:val('zeitraum'),nachricht:val('nachricht'),quellseite:location.origin+source,sprache:lang,herkunft:a.quelle,referrer:a.referrer,utm:utmS,einstiegsseite:a.landing};
  fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)}).then(function(r){if(!r.ok)throw 0;done()}).catch(function(){location.href='mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)});
});
})();
