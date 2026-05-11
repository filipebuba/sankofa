(function(){
'use strict';

// === CONFIG ===
var G=28,RUN=7,MAX=9,ACC=35,DEC=25,AIR=.55,JF=13,JC=.45,COY=.1,JB=.12;
var CW=.22;

// === PHASE LOADER ===
function loadPhaseId(){
  var m = location.search.match(/[?&]phase=([\d.]+)/);
  if(m) return m[1];
  try{
    var prog = JSON.parse(localStorage.getItem('sankofa_kids_progress') || '{}');
    var phases = prog.phases || {};
    // Last unlocked = furthest done +1; default '1.1'
    var order = ['1.1','1.2','1.3'];
    for(var i = order.length - 1; i >= 0; i--){
      if(phases[order[i]] && phases[order[i]].done) return order[Math.min(i+1, order.length-1)];
    }
  }catch(e){}
  return '1.1';
}
var PHASE_ID = loadPhaseId();
var PHASE_KEY = 'PHASE_' + PHASE_ID.replace('.', '_');
var PHASE = window[PHASE_KEY] || window.PHASE_1_1;
if(!PHASE){throw new Error('Phase data not loaded: ' + PHASE_KEY);}

// === PALETTE (from phase) ===
var P = PHASE.palette;

// === STATE ===
var S={on:false,x:0,y:.5,vx:0,vy:0,gnd:false,face:1,lgt:0,jb:0,at:0,py:.5,
  sx:1,sy:1,svx:0,svy:0,cc:0,mc:0,ls:0,won:false,cx:0,cy:0,scan:0,beaconOn:false,hp:3,hpCap:3,paused:false,perfect:true};

// === ENIGMAS (from phase, fallback to 1.1 if missing) ===
var ENIGMAS = (PHASE.enigmas && PHASE.enigmas.length)
  ? PHASE.enigmas
  : ((window.PHASE_1_1 && window.PHASE_1_1.enigmas) || []);
var I={l:false,r:false,jp:false,jh:false,sc:false,ec:false};

function escapeHTML(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g,function(ch){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
  });
}

function shuffledOptions(options, correctIndex){
  var mapped = (options || []).map(function(text,i){
    return { text:text, correct:i === correctIndex };
  });
  for(var i=mapped.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var tmp=mapped[i];mapped[i]=mapped[j];mapped[j]=tmp;
  }
  return mapped;
}

// === NPCs (from phase) — rfn rebinds to closure S ===
var NPCS = PHASE.npcs.map(function(n){
  var origRfn = n.rfn;
  var clone = {};
  for(var k in n) if(Object.prototype.hasOwnProperty.call(n,k)) clone[k] = n[k];
  clone.rfn = function(){ if(origRfn) origRfn(S); };
  return clone;
});

function npcDonesCount(){var n=0;for(var i=0;i<NPCS.length;i++)if(NPCS[i].done)n++;return n;}
function refreshNPCVisibility(){
  var done=npcDonesCount();
  NPCS.forEach(function(n){
    var visible=done>=n.unlock;
    if(n.spr)n.spr.visible=visible;
    if(n.ring)n.ring.visible=visible;
  });
}

// === LEVEL ===
var plats=[],cauris=[],mems=[];

function defPlat(cx,cy,w,h,tp){plats.push({cx:cx,cy:cy,w:w,h:h,tp:tp||'ground',l:cx-w/2,r:cx+w/2,t:cy+h/2});}

// === THREE ===
var scene,cam,ren,luci,lp={};

function initScene(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(P.lt);
  scene.fog=new THREE.Fog(P.lt,25,55);

  var isMobile=matchMedia('(pointer:coarse)').matches;
  var fov=isMobile?(innerWidth<innerHeight?72:62):50;
  cam=new THREE.PerspectiveCamera(fov,innerWidth/innerHeight,.1,100);
  cam.position.set(0,4,12);cam.lookAt(0,1.5,0);

  ren=new THREE.WebGLRenderer({antialias:!isMobile,powerPreference:'high-performance'});
  ren.setSize(innerWidth,innerHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.5:2));
  ren.shadowMap.enabled=true;
  ren.shadowMap.type=THREE.PCFSoftShadowMap;
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=1.3;
  document.body.insertBefore(ren.domElement,document.body.firstChild);

  var sun=new THREE.DirectionalLight(0xffe4c4,1.6);
  sun.position.set(10,15,8);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.near=.5;sun.shadow.camera.far=60;
  sun.shadow.camera.left=-30;sun.shadow.camera.right=30;
  sun.shadow.camera.top=15;sun.shadow.camera.bottom=-5;
  scene.add(sun);

  scene.add(new THREE.HemisphereLight(P.lt,P.ea,.5));
  scene.add(new THREE.AmbientLight(P.sa,.25));

  function onResize(){
    var mob=matchMedia('(pointer:coarse)').matches;
    cam.aspect=innerWidth/innerHeight;
    cam.fov=mob?(innerWidth<innerHeight?72:62):50;
    cam.updateProjectionMatrix();
    ren.setSize(innerWidth,innerHeight);
  }
  window.addEventListener('resize',onResize);
  window.addEventListener('orientationchange',function(){setTimeout(onResize,200);});
}

// === EMOJI SPRITE HELPER ===
function emojiTexture(emoji,size){
  size=size||256;
  var canvas=document.createElement('canvas');
  canvas.width=size;canvas.height=size;
  var ctx=canvas.getContext('2d');
  ctx.font=Math.floor(size*0.78)+'px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(emoji,size/2,size/2+size*0.04);
  var tex=new THREE.CanvasTexture(canvas);
  tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;
  return tex;
}

// === NPC PORTRAIT (procedural fallback when PNG missing) ===
// Renders a vertical 2:3 canvas with:
// - radial gradient backdrop tinted by paletteHex
// - body silhouette (rounded shape)
// - emoji head centered
// - name banner at the bottom
// Output is a CanvasTexture sized 512x768.
function npcPortraitTexture(emoji, name, paletteHex){
  var W = 512, H = 768;
  var canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');

  // Convert palette int -> css hex (e.g. 0xc9a84c -> #c9a84c)
  function toCss(n){ return '#' + n.toString(16).padStart(6, '0'); }
  var col = toCss((paletteHex !== undefined ? paletteHex : 0xc9a84c) & 0xffffff);

  // 1) Radial gradient backdrop (transparent edges)
  var grd = ctx.createRadialGradient(W/2, H*0.45, 60, W/2, H*0.45, W*0.55);
  grd.addColorStop(0.00, col);
  grd.addColorStop(0.55, col + 'cc');
  grd.addColorStop(1.00, '#00000000');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // 2) Body silhouette — rounded torso below head
  ctx.fillStyle = '#1a120a';
  ctx.strokeStyle = '#0c0a06';
  ctx.lineWidth = 6;
  var bodyTop = H * 0.42;
  var bodyBot = H * 0.92;
  var bodyW   = W * 0.62;
  var bodyX   = (W - bodyW) / 2;
  ctx.beginPath();
  // Shoulders curve
  ctx.moveTo(bodyX, bodyTop + 80);
  ctx.quadraticCurveTo(W/2, bodyTop - 20, bodyX + bodyW, bodyTop + 80);
  // Right side down
  ctx.lineTo(bodyX + bodyW, bodyBot);
  // Bottom curve
  ctx.quadraticCurveTo(W/2, bodyBot + 30, bodyX, bodyBot);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3) Inner robe accent (lighter tone strip)
  ctx.fillStyle = col + '55';
  ctx.beginPath();
  ctx.moveTo(W/2 - 8, bodyTop + 80);
  ctx.lineTo(W/2 - 8, bodyBot);
  ctx.lineTo(W/2 + 8, bodyBot);
  ctx.lineTo(W/2 + 8, bodyTop + 80);
  ctx.closePath();
  ctx.fill();

  // 4) Head circle (dark) + emoji glyph
  var headR = W * 0.20;
  var headY = H * 0.30;
  ctx.fillStyle = '#2a1f14';
  ctx.beginPath();
  ctx.arc(W/2, headY, headR + 6, 0, Math.PI * 2);
  ctx.fill();
  // Emoji
  ctx.font = Math.floor(headR * 1.55) + 'px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji || '👤', W/2, headY + headR * 0.08);

  // 5) Name banner near the bottom
  if(name){
    var bannerH = 56;
    var bannerY = H - bannerH - 24;
    ctx.fillStyle = 'rgba(12,10,6,0.85)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    var bx = W * 0.10, bw = W * 0.80;
    // Rounded rect
    var r = 14;
    ctx.beginPath();
    ctx.moveTo(bx + r, bannerY);
    ctx.lineTo(bx + bw - r, bannerY);
    ctx.quadraticCurveTo(bx + bw, bannerY, bx + bw, bannerY + r);
    ctx.lineTo(bx + bw, bannerY + bannerH - r);
    ctx.quadraticCurveTo(bx + bw, bannerY + bannerH, bx + bw - r, bannerY + bannerH);
    ctx.lineTo(bx + r, bannerY + bannerH);
    ctx.quadraticCurveTo(bx, bannerY + bannerH, bx, bannerY + bannerH - r);
    ctx.lineTo(bx, bannerY + r);
    ctx.quadraticCurveTo(bx, bannerY, bx + r, bannerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.font = '700 28px Georgia, serif';
    ctx.fillText(name, W/2, bannerY + bannerH/2 + 2);
  }

  var tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  return tex;
}

// === NPCs build + glow ===
function buildNPCs(){
  NPCS.forEach(function(n){
    var tex;
    var fallbackEmoji = n.avatar || n.emoji || '👤';
    // Tint backdrop with phase gold by default; phase palette wins if defined.
    var paletteHex = (n.tint !== undefined ? n.tint : (P.gd || 0xc9a84c));
    if(n.img){
      // Try png; on 404/load error, swap to procedural portrait.
      tex = new THREE.TextureLoader().load(
        n.img,
        function(){ /* loaded ok */ },
        undefined,
        function(){
          console.warn('[npc] img load failed, fallback portrait', n.img);
          var fb = npcPortraitTexture(fallbackEmoji, n.name, paletteHex);
          mat.map = fb;
          mat.needsUpdate = true;
        }
      );
      tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter;
    }else{
      // No img path: prefer rich portrait fallback over bare emoji.
      tex = npcPortraitTexture(n.emoji || fallbackEmoji, n.name, paletteHex);
    }
    var mat=new THREE.SpriteMaterial({map:tex,transparent:true,alphaTest:.05});
    var spr=new THREE.Sprite(mat);
    spr.scale.set(n.scale[0],n.scale[1],1);
    spr.center.set(.5,0);
    spr.position.set(n.x,0,0);
    scene.add(spr);
    n.spr=spr;
    // Glow ring (ground) — double ring for visibility
    var ringGrp=new THREE.Group();
    var rIn=new THREE.Mesh(
      new THREE.RingGeometry(.55,.85,24),
      new THREE.MeshBasicMaterial({color:0xc9a84c,transparent:true,opacity:.85,side:THREE.DoubleSide})
    );
    rIn.rotation.x=-Math.PI/2;
    ringGrp.add(rIn);
    var rOut=new THREE.Mesh(
      new THREE.RingGeometry(.95,1.15,24),
      new THREE.MeshBasicMaterial({color:0xffd97a,transparent:true,opacity:.5,side:THREE.DoubleSide})
    );
    rOut.rotation.x=-Math.PI/2;
    ringGrp.add(rOut);
    // Filled disc base for contrast
    var disc=new THREE.Mesh(
      new THREE.CircleGeometry(.55,24),
      new THREE.MeshBasicMaterial({color:0x4a3520,transparent:true,opacity:.45,side:THREE.DoubleSide})
    );
    disc.rotation.x=-Math.PI/2;
    disc.position.y=-.001;
    ringGrp.add(disc);
    ringGrp.position.set(n.x,.06,0);
    scene.add(ringGrp);
    n.ring=ringGrp;n.ringIn=rIn;n.ringOut=rOut;
    n.done=false;
  });
  refreshNPCVisibility();
}

function updateNPCs(dt){
  var t=performance.now()/1000;
  NPCS.forEach(function(n){
    if(!n.spr||!n.spr.visible)return;
    var d=Math.abs(S.x-n.x);
    var near=d<2.5;
    // Bobbing
    n.spr.position.y=Math.sin(t*1.5+n.x)*.08;
    // Ring pulse
    if(n.ring){
      var puls=1+Math.sin(t*2.5+n.x)*.18;
      n.ring.scale.setScalar(puls);
      var baseIn=n.done?.15:(near?1.0:.85);
      var baseOut=n.done?.05:(near?.7:.5);
      if(n.ringIn)n.ringIn.material.opacity=baseIn;
      if(n.ringOut)n.ringOut.material.opacity=baseOut;
    }
    // Auto-prompt when near and not done — mostra papel da personagem
    if(near&&!n.done&&!n.promptedOnce){
      n.promptedOnce=true;
      showStage('<b>'+n.name+'</b> — '+n.role+'.<br>Toca <b>E</b> ou 🎙 para falar',4500);
    }
    if(!near)n.promptedOnce=false;
  });
}

// === LUCINHA (2D sprite — bíblia visual Kirikou) ===
function createLucinha(){
  var tex=new THREE.TextureLoader().load('assets/lucinha.png');
  tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.LinearFilter;
  var mat=new THREE.SpriteMaterial({map:tex,transparent:true,alphaTest:.1});
  var spr=new THREE.Sprite(mat);
  spr.scale.set(1.8,2.6,1);
  spr.center.set(.5,0); // pivot at feet
  lp.sprite=spr;
  return spr;
}

// === LEVEL ===
function buildLevel(){
  // Plats from phase
  (PHASE.plats || []).forEach(function(p){
    defPlat(p[0], p[1], p[2], p[3], p[4]);
  });

  // Ground meshes
  plats.forEach(function(p){
    var h2=p.h;var geo=new THREE.BoxGeometry(p.w,h2,5);
    var col=p.tp==='float'?P.tr:P.ea;
    var mat=new THREE.MeshLambertMaterial({color:col,flatShading:true});
    var m=new THREE.Mesh(geo,mat);
    m.position.set(p.cx,p.cy-h2/2,0);m.receiveShadow=true;m.castShadow=true;
    scene.add(m);

    if(p.tp!=='float'){
      var topGeo=new THREE.BoxGeometry(p.w,.12,5);
      var topMat=new THREE.MeshLambertMaterial({color:P.sk,flatShading:true});
      var top=new THREE.Mesh(topGeo,topMat);
      top.position.set(p.cx,p.cy+.06,0);top.receiveShadow=true;
      scene.add(top);
    }
  });

  // Cauris from phase
  (PHASE.cauris || []).forEach(function(c){
    var geo=new THREE.TorusGeometry(.15,.05,8,12);
    var mat=new THREE.MeshLambertMaterial({color:P.gd,emissive:P.gd,emissiveIntensity:.2,flatShading:true});
    var m=new THREE.Mesh(geo,mat);
    m.position.set(c[0],c[1],0);m.rotation.x=Math.PI/4;
    scene.add(m);cauris.push({m:m,x:c[0],y:c[1],got:false});
  });

  // Memory fragments — types from phase
  (PHASE.mems || []).forEach(function(d){
    var style = memStyle(d.type);
    var geo;
    if(style.geo === 'octa'){
      geo = new THREE.OctahedronGeometry(.22, 0);
    }else if(style.geo === 'dodeca'){
      geo = new THREE.DodecahedronGeometry(.22, 0);
    }else{
      geo = new THREE.BoxGeometry(.4, .32, .06);
    }
    var mat = new THREE.MeshLambertMaterial({color:style.col, emissive:style.emCol, emissiveIntensity:.0, flatShading:true, transparent:true, opacity:.0});
    var m = new THREE.Mesh(geo, mat);
    m.position.set(d.pos[0], d.pos[1], 0);
    scene.add(m);
    mems.push({m:m, x:d.pos[0], y:d.pos[1], got:false, revealed:false, type:d.type, label:d.label, griot:d.griot});
  });
}

// === VINES (Phase 1.3 — cipos blocking trail, cut with axe + B) ===
var vines=[];

function buildVines(){
  var defs = PHASE.vines || [];
  defs.forEach(function(d){
    var x = d[0], y = d[1];
    var grp = new THREE.Group();
    // Hanging vine — green cylinder
    var stem = new THREE.Mesh(
      new THREE.CylinderGeometry(.06, .06, 1.6, 6),
      new THREE.MeshLambertMaterial({ color: P.fo || 0x5a8a3a, flatShading: true })
    );
    stem.position.y = .8;
    grp.add(stem);
    // Leaves (3 cones)
    for(var i = 0; i < 3; i++){
      var leaf = new THREE.Mesh(
        new THREE.ConeGeometry(.18, .35, 5),
        new THREE.MeshLambertMaterial({ color: P.lf || 0x6b9f4a, flatShading: true })
      );
      leaf.position.set(Math.cos(i*2.1)*.15, .4 + i*.45, Math.sin(i*2.1)*.1);
      leaf.rotation.z = (i - 1) * .4;
      grp.add(leaf);
    }
    grp.position.set(x, y - .8, 0);
    scene.add(grp);
    vines.push({ x: x, y: y, mesh: grp, cut: false });
  });
}

function cutNearbyVine(){
  if(!S.axe) return false;
  for(var i = 0; i < vines.length; i++){
    var v = vines[i];
    if(v.cut) continue;
    var dx = Math.abs(S.x - v.x);
    var dy = Math.abs(S.y - v.y);
    if(dx < 2.0 && dy < 2.5){
      v.cut = true;
      // Fade + drop animation
      var t0 = performance.now();
      var startY = v.mesh.position.y;
      var anim = setInterval(function(){
        var k = Math.min(1, (performance.now() - t0) / 600);
        v.mesh.position.y = startY - k * 1.5;
        v.mesh.rotation.z = k * 0.8;
        v.mesh.children.forEach(function(c){
          if(c.material) c.material.transparent = true;
          if(c.material) c.material.opacity = 1 - k;
        });
        if(k >= 1){
          clearInterval(anim);
          v.mesh.visible = false;
        }
      }, 16);
      S.cc += 2;
      spawnDust(v.x, v.y - .5, 0.6);
      snd('s');
      showToast('🪓 Cipó cortado!');
      return true;
    }
  }
  return false;
}

// === BONUS MEMS (Phase 1.3 — bantu-arvore, chop tree with axe) ===
var bonusMems=[];

function buildBonusMems(){
  var defs = PHASE.bonusMems || [];
  defs.forEach(function(d){
    if(d.requires !== 'axe') return;
    var x = d.pos[0], y = d.pos[1];
    var grp = new THREE.Group();
    // Tree trunk
    var trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(.18, .25, 2.4, 6),
      new THREE.MeshLambertMaterial({ color: P.ea || 0x3d2818, flatShading: true })
    );
    trunk.position.y = 1.2;
    grp.add(trunk);
    // Canopy (large for visibility)
    var canopy = new THREE.Mesh(
      new THREE.SphereGeometry(.9, 8, 6),
      new THREE.MeshLambertMaterial({ color: P.fo || 0x5a8a3a, emissive: P.gd || 0xc9a84c, emissiveIntensity: .08, flatShading: true })
    );
    canopy.position.y = 2.6;
    grp.add(canopy);
    // Gold glow ring (signals "chop here")
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(.7, 1.0, 24),
      new THREE.MeshBasicMaterial({ color: P.gd || 0xc9a84c, transparent: true, opacity: .5, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI/2;
    ring.position.y = .01;
    grp.add(ring);
    grp.position.set(x, y - 1.2, 0);
    scene.add(grp);
    bonusMems.push({ data: d, mesh: grp, ring: ring, x: x, y: y, chopped: false });
  });
}

function updateBonusMems(){
  var t = performance.now() / 1000;
  bonusMems.forEach(function(bm){
    if(bm.chopped) return;
    if(bm.ring) bm.ring.material.opacity = .35 + Math.sin(t * 2.2) * .2;
  });
}

function chopNearbyTree(){
  if(!S.axe) return false;
  for(var i = 0; i < bonusMems.length; i++){
    var bm = bonusMems[i];
    if(bm.chopped) continue;
    if(Math.abs(S.x - bm.x) < 2.0){
      bm.chopped = true;
      // Fall animation
      var t0 = performance.now();
      var anim = setInterval(function(){
        var k = Math.min(1, (performance.now() - t0) / 900);
        bm.mesh.rotation.z = -k * Math.PI / 2 * .9;
        if(k >= 1){
          clearInterval(anim);
          setTimeout(function(){
            bm.mesh.children.forEach(function(c){
              if(c.material){ c.material.transparent = true; c.material.opacity = 0.2; }
            });
          }, 400);
        }
      }, 16);
      S.cc += bm.data.cauriBonus || 5;
      spawnDust(bm.x, bm.y - 1, 1.0);
      snd('m');
      showToast('🌳 Árvore derrubada! +' + (bm.data.cauriBonus || 5) + ' cauris');
      showGriot(bm.data.griot);
      return true;
    }
  }
  return false;
}

// === MOVING PLATS (Phase 1.3 — canoe oscillating x) ===
var movingPlats=[];

function buildMovingPlats(){
  var defs = PHASE.movingPlats || [];
  defs.forEach(function(d){
    // Push as float plat into plats[] so AABB collision works.
    var p = {
      cx: d.cx, cy: d.cy, w: d.w, h: d.h,
      tp: 'float',
      l: d.cx - d.w/2,
      r: d.cx + d.w/2,
      t: d.cy + d.h/2
    };
    plats.push(p);
    // Canoe mesh: shallow boat = thin box + tapered nose
    var grp = new THREE.Group();
    var hull = new THREE.Mesh(
      new THREE.BoxGeometry(d.w, d.h, .9),
      new THREE.MeshLambertMaterial({ color: P.ea || 0x3d2818, flatShading: true })
    );
    hull.position.y = 0;
    grp.add(hull);
    // Top deck (lighter)
    var deck = new THREE.Mesh(
      new THREE.BoxGeometry(d.w * .9, .08, .7),
      new THREE.MeshLambertMaterial({ color: P.sk || 0x5a4030, flatShading: true })
    );
    deck.position.y = d.h/2 + .04;
    grp.add(deck);
    grp.position.set(d.cx, d.cy - d.h/2, 0);
    scene.add(grp);
    movingPlats.push({ data: d, plat: p, mesh: grp, t0: performance.now() });
  });
}

function updateMovingPlats(){
  movingPlats.forEach(function(mp){
    var d = mp.data;
    var range = d.range[1] - d.range[0];
    var center = (d.range[0] + d.range[1]) / 2;
    var halfRange = range / 2;
    var t = (performance.now() - mp.t0) / 1000;
    if(d.axis === 'x'){
      var newX = center + Math.sin(t * d.speed) * halfRange;
      var oldX = mp.plat.cx;
      var delta = newX - oldX;
      mp.mesh.position.x = newX;
      // Sync plat AABB
      mp.plat.cx = newX;
      mp.plat.l = newX - mp.plat.w/2;
      mp.plat.r = newX + mp.plat.w/2;
      // Sticky: player riding the plat moves with it
      var hw = .45;
      if(S.gnd && Math.abs(S.y - mp.plat.t) < .15 &&
         S.x + hw > mp.plat.l - delta && S.x - hw < mp.plat.r - delta){
        S.x += delta;
      }
    }
  });
}

// === HAZARDS (Phase 1.3 — snake + future) ===
var hazardEntities=[];

function buildHazards(){
  var defs = PHASE.hazards || [];
  defs.forEach(function(d){
    if(d.type === 'snake'){
      var tex = emojiTexture('🐍');
      var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: .05 });
      var spr = new THREE.Sprite(mat);
      spr.scale.set(1.0, 1.0, 1);
      spr.center.set(.5, .5);
      var startY = d.cycle ? d.cycle[0] : 1;
      spr.position.set(d.x, startY, 0);
      scene.add(spr);
      hazardEntities.push({ data: d, mesh: spr, t0: performance.now() });
    } else if(d.type === 'hippo'){
      var tex = emojiTexture('🦛');
      var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: .05 });
      var spr = new THREE.Sprite(mat);
      spr.scale.set(1.8, 1.4, 1);
      spr.center.set(.5, 0);
      spr.position.set(d.x, 0, 0);
      scene.add(spr);
      hazardEntities.push({ data: d, mesh: spr, t0: performance.now(), submerged: false });
    } else if(d.type === 'crocodile' || d.type === 'croc'){
      var tex = emojiTexture('🐊');
      var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: .05 });
      var spr = new THREE.Sprite(mat);
      spr.scale.set(1.4, 1.0, 1);
      spr.center.set(.5, 0);
      var startX = (d.range && d.range[0]) || d.x;
      spr.position.set(startX, 0.05, 0);
      scene.add(spr);
      hazardEntities.push({ data: d, mesh: spr, t0: performance.now(), dir: 1 });
    }
  });
}

function updateHazards(){
  var now = performance.now();
  hazardEntities.forEach(function(h){
    var d = h.data;
    if(d.type === 'snake'){
      var cycleArr = d.cycle || [1, 3];
      var yLow = cycleArr[0], yHigh = cycleArr[1];
      var range = yHigh - yLow;
      var center = (yLow + yHigh) / 2;
      var t = (now - h.t0) / 1000;
      var newY = center + Math.sin(t * (d.speed || 1.0)) * range/2;
      h.mesh.position.y = newY;
      var hw = .4, ht = 1.5;
      if(Math.abs(S.x - d.x) < .6 + hw &&
         Math.abs(S.y + .8 - newY) < .5 + ht/2){
        if(!h.hitCooldown || now - h.hitCooldown > 1500){
          h.hitCooldown = now;
          S.deathCause = 'snake';
          loseLife();
        }
      }
    }
    else if(d.type === 'hippo'){
      // Cycle: visible (blocking) for cycleMs ms, then submerged for same duration.
      var cycleMs = d.cycle || 4000;
      var phase = ((now - h.t0) % (cycleMs * 2)) / cycleMs;
      var submerged = phase >= 1;
      if(submerged !== h.submerged){
        h.submerged = submerged;
        h.mesh.material.opacity = submerged ? .25 : 1;
        h.mesh.position.y = submerged ? -0.6 : 0;
      }
      // Blocking AABB push when visible
      if(!submerged && d.blocking){
        var hw = .45;
        var blockHalfW = .9;
        var dx = S.x - d.x;
        if(Math.abs(dx) < blockHalfW + hw && S.y < 1.8){
          // Push player to outside edge they came from
          if(dx >= 0) S.x = d.x + blockHalfW + hw + .01;
          else        S.x = d.x - blockHalfW - hw - .01;
          if(S.vx * Math.sign(dx) < 0) S.vx = 0; // stop into-wall velocity
          // First-time hint
          if(!h.hintShown){
            h.hintShown = true;
            showToast('🦛 Hipopótamo a banhar-se. Espera ele mergulhar.');
          }
        }
      }
    }
    else if(d.type === 'crocodile' || d.type === 'croc'){
      var rangeArr = d.range || [d.x - 2, d.x + 2];
      var speed = d.speed || 1.5;
      // Patrol back-and-forth
      var x = h.mesh.position.x + h.dir * speed * (1/60);
      if(x >= rangeArr[1]){ x = rangeArr[1]; h.dir = -1; }
      else if(x <= rangeArr[0]){ x = rangeArr[0]; h.dir = 1; }
      h.mesh.position.x = x;
      // Flip sprite by negative scale x (mirrors)
      h.mesh.scale.x = (h.dir > 0 ? 1 : -1) * Math.abs(h.mesh.scale.x);
      // Collision (ground level)
      var hw = .45;
      if(Math.abs(S.x - x) < .7 + hw && S.y < 1.2){
        if(!h.hitCooldown || now - h.hitCooldown > 1500){
          h.hitCooldown = now;
          S.deathCause = 'croc';
          loseLife();
        }
      }
    }
  });
}

// === INTERACTABLES (Phase 1.3 — anvil + future) ===
var interactables=[];

function buildInteractables(){
  var defs = PHASE.interactables || [];
  defs.forEach(function(d){
    if(d.type === 'anvil'){
      var grp = new THREE.Group();
      // Base (dark wood block)
      var base = new THREE.Mesh(
        new THREE.BoxGeometry(.6, .35, .5),
        new THREE.MeshLambertMaterial({ color: P.dk || 0x2a1f14, flatShading: true })
      );
      base.position.y = .175;
      grp.add(base);
      // Anvil top (iron)
      var top = new THREE.Mesh(
        new THREE.BoxGeometry(.85, .25, .35),
        new THREE.MeshLambertMaterial({ color: P.fe || 0x8a8a8a, emissive: 0x331100, emissiveIntensity: .25, flatShading: true })
      );
      top.position.y = .47;
      grp.add(top);
      // Horn
      var horn = new THREE.Mesh(
        new THREE.ConeGeometry(.13, .35, 5),
        new THREE.MeshLambertMaterial({ color: P.fe || 0x8a8a8a, flatShading: true })
      );
      horn.position.set(.55, .47, 0);
      horn.rotation.z = -Math.PI/2;
      grp.add(horn);
      // Glow ring around base
      var ring = new THREE.Mesh(
        new THREE.RingGeometry(.55, .85, 24),
        new THREE.MeshBasicMaterial({ color: P.br || 0xff6a2a, transparent: true, opacity: .55, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI/2;
      ring.position.y = .01;
      grp.add(ring);
      grp.position.set(d.x, d.y - .35, 0);
      scene.add(grp);
      interactables.push({ data: d, mesh: grp, ring: ring, used: false });
    }
  });
}

function updateInteractables(){
  var t = performance.now()/1000;
  interactables.forEach(function(it){
    if(it.ring){
      var puls = it.used ? .2 : (.55 + Math.sin(t*3)*.25);
      it.ring.material.opacity = puls;
    }
  });
}

function nearestAnvil(){
  for(var i = 0; i < interactables.length; i++){
    var it = interactables[i];
    if(it.used) continue;
    if(it.data.type !== 'anvil') continue;
    if(Math.abs(S.x - it.data.x) < 2.0) return it;
  }
  return null;
}

// === FORGE QTE (Phase 1.3) ===
var FQE = { active: false, hits: 0, target: 3, anvil: null };

function openForgeQTE(anvil){
  if(FQE.active) return;
  if(S.axe){ showToast('Já forjaste o machado!'); return; }
  // Need to talk to Ferreiro Nok first (unlocks anvil)
  if(!S.anvilUnlocked){
    showToast('Fala com o Ferreiro Nok primeiro — ele ensina a forja.');
    return;
  }
  FQE.active = true;
  FQE.hits = 0;
  FQE.anvil = anvil;
  S.paused = true;
  var el = document.getElementById('forgeQTE');
  if(!el) return;
  // Reset score dots
  Array.prototype.forEach.call(el.querySelectorAll('.fq-hit'), function(d){ d.classList.remove('on'); });
  var marker = el.querySelector('.fq-marker');
  if(marker) marker.classList.remove('hit');
  el.classList.add('show');
}

function closeForgeQTE(success){
  var el = document.getElementById('forgeQTE');
  if(el) el.classList.remove('show');
  FQE.active = false;
  S.paused = false;
  if(success && FQE.anvil){
    FQE.anvil.used = true;
    S.axe = true;
    showStage('🪓 <b>Machado de ferro forjado!</b><br>Usa <b>B</b> para cortar cipós e árvores.', 5500);
    snd('w');
  }
  FQE.anvil = null;
}

function forgeQTETap(){
  if(!FQE.active) return;
  var el = document.getElementById('forgeQTE');
  if(!el) return;
  var marker = el.querySelector('.fq-marker');
  if(!marker) return;
  // Read marker computed position relative to track width.
  var rect = marker.getBoundingClientRect();
  var track = el.querySelector('.fq-track').getBoundingClientRect();
  var center = (rect.left + rect.right) / 2;
  var trackCenter = (track.left + track.right) / 2;
  var trackHalf = (track.right - track.left) / 2;
  // Hit zone = central 20% of track
  var inZone = Math.abs(center - trackCenter) < trackHalf * 0.20;
  if(inZone){
    FQE.hits++;
    var dots = el.querySelectorAll('.fq-hit');
    if(dots[FQE.hits - 1]) dots[FQE.hits - 1].classList.add('on');
    marker.classList.add('hit');
    setTimeout(function(){ marker.classList.remove('hit'); }, 200);
    snd('c');
    if(FQE.hits >= FQE.target){
      setTimeout(function(){ closeForgeQTE(true); }, 600);
    }
  }else{
    snd('l');
    var dots = el.querySelectorAll('.fq-hit');
    if(dots[0]) dots[0].style.animation = 'hShake .3s';
    setTimeout(function(){ if(dots[0]) dots[0].style.animation = ''; }, 320);
  }
}

function setupForgeQTE(){
  var el = document.getElementById('forgeQTE');
  if(!el) return;
  var tap = el.querySelector('.fq-tap');
  var cancel = el.querySelector('.fq-cancel');
  if(tap) tap.addEventListener('click', function(e){ e.stopPropagation(); forgeQTETap(); });
  if(cancel) cancel.addEventListener('click', function(e){ e.stopPropagation(); closeForgeQTE(false); });
}

// === SAND WALLS (Phase 1.2 mechanic) ===
// Sand-covered rock walls hiding rupestre paintings.
// Scan within range fades sand AND reveals matching mem.
var sandWalls=[];

function buildSandWalls(){
  var defs = PHASE.sandWalls || [];
  defs.forEach(function(d){
    var x = d[0], y = d[1], type = d[2];
    // Sand plate ~1.4 wide × 1.4 tall, slightly behind mem on z-axis
    var geo = new THREE.PlaneGeometry(1.6, 1.6);
    var sandColor = P.sa || 0xd4b896;
    var mat = new THREE.MeshLambertMaterial({
      color: sandColor,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      flatShading: true
    });
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, 0.3);
    scene.add(m);
    sandWalls.push({ m: m, x: x, y: y, type: type, cleared: false });
  });
}

function clearSandWall(type){
  var sw = null;
  for(var i = 0; i < sandWalls.length; i++){
    if(sandWalls[i].type === type && !sandWalls[i].cleared){ sw = sandWalls[i]; break; }
  }
  if(!sw) return;
  sw.cleared = true;
  var t0 = performance.now();
  var anim = setInterval(function(){
    var k = Math.min(1, (performance.now() - t0) / 800);
    sw.m.material.opacity = 0.92 * (1 - k);
    if(k >= 1){
      clearInterval(anim);
      sw.m.visible = false;
    }
  }, 16);
  // Bonus cauris reward + dust particles
  S.cc += 3;
  spawnDust(sw.x, sw.y, 0.8);
  snd('s');
}

// Map mem type -> {col, emCol, geo} — falls back to generic box.
function memStyle(type){
  var map = {
    fossil:   { col: P.wh, emCol: P.lt, geo: 'octa' },
    chopper:  { col: P.dk, emCol: P.ea, geo: 'dodeca' },
    rupestre: { col: P.tr, emCol: P.gd, geo: 'box' }
  };
  return map[type] || { col: P.gd || 0xc9a84c, emCol: P.lt || 0xe8d5b7, geo: 'box' };
}

// === BACKGROUND ===
function buildBackground(){
  // Mountains
  var mColors=[P.dp,P.dk,P.ea,P.dp,P.dk,P.ea,P.dp];
  var mPositions=[[-15,-25,18],[-8,-22,25],[5,-28,15],[18,-24,22],[30,-26,20],[42,-23,16],[55,-27,12]];
  mPositions.forEach(function(mp,i){
    var geo=new THREE.ConeGeometry(mp[2]*.45,mp[2],6);
    var mat=new THREE.MeshLambertMaterial({color:mColors[i%mColors.length],flatShading:true});
    var m=new THREE.Mesh(geo,mat);
    m.position.set(mp[0],mp[2]/2-1,mp[1]);
    m.userData.parallax=.15;m.userData.origX=mp[0];
    scene.add(m);
  });

  // Acacia trees
  var treePositions=[[-3,-6],[8,-8],[16,-7],[26,-9],[35,-6],[44,-8]];
  treePositions.forEach(function(tp){
    var grp=new THREE.Group();
    var trunk=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,2.2,6),
      new THREE.MeshLambertMaterial({color:P.ea,flatShading:true}));
    trunk.position.y=1.1;grp.add(trunk);
    var canopy=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.25,8),
      new THREE.MeshLambertMaterial({color:P.gn,flatShading:true}));
    canopy.position.y=2.5;grp.add(canopy);
    grp.position.set(tp[0],0,tp[1]);
    grp.userData.parallax=.3;grp.userData.origX=tp[0];
    scene.add(grp);
  });

  // Grass tufts
  for(var i=-5;i<40;i+=1.5+Math.random()*2){
    var gGrp=new THREE.Group();
    for(var b=0;b<3;b++){
      var blade=new THREE.Mesh(new THREE.ConeGeometry(.04,.25+Math.random()*.15,4),
        new THREE.MeshLambertMaterial({color:P.gn,flatShading:true}));
      blade.position.set(b*.07-.07,.12,0);blade.rotation.z=(b-1)*.2;
      gGrp.add(blade);
    }
    gGrp.position.set(i,0,1.5+Math.random()*.5);
    scene.add(gGrp);
  }

  // Far ground plane
  var farGround=new THREE.Mesh(
    new THREE.PlaneGeometry(120,40),
    new THREE.MeshLambertMaterial({color:P.sa})
  );
  farGround.rotation.x=-Math.PI/2;farGround.position.set(15,-.02,-5);
  farGround.receiveShadow=true;scene.add(farGround);
}

// === PARTICLES ===
var parts=[];
function spawnDust(x,y,intensity){
  for(var i=0;i<Math.floor(6*intensity)+3;i++){
    var geo=new THREE.BoxGeometry(.06+Math.random()*.06,.06+Math.random()*.06,.06);
    var mat=new THREE.MeshLambertMaterial({color:P.sa,transparent:true,opacity:.7});
    var m=new THREE.Mesh(geo,mat);
    m.position.set(x+Math.random()*.4-.2,y+.05,Math.random()*.5-.25);
    scene.add(m);
    parts.push({m:m,vx:Math.random()*3-1.5,vy:Math.random()*4+2,vz:Math.random()*2-1,life:1,decay:2+Math.random()});
  }
}

function spawnCollectEffect(x,y,col){
  for(var i=0;i<10;i++){
    var geo=new THREE.BoxGeometry(.05,.05,.05);
    var mat=new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:.5,transparent:true,opacity:1});
    var m=new THREE.Mesh(geo,mat);
    m.position.set(x,y,0);scene.add(m);
    var a=Math.random()*Math.PI*2;
    parts.push({m:m,vx:Math.cos(a)*4,vy:Math.sin(a)*4+3,vz:Math.random()*2-1,life:1,decay:1.8+Math.random()*.5});
  }
}

function updateParts(dt){
  for(var i=parts.length-1;i>=0;i--){
    var p=parts[i];
    p.vy-=15*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;
    p.m.position.z+=p.vz*dt;p.life-=p.decay*dt;
    p.m.material.opacity=Math.max(0,p.life);p.m.scale.setScalar(Math.max(.1,p.life));
    if(p.life<=0){scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();parts.splice(i,1);}
  }
}

// === AUDIO ===
var actx=null,bgAudio=null,griotAudios={};
var MUTED=false;
try{MUTED=localStorage.getItem('sankofa_muted')==='1'}catch(e){}
function applyMute(){
  if(bgAudio)bgAudio.muted=MUTED;
  Object.values(griotAudios).forEach(function(a){a.muted=MUTED;});
  var btn=document.getElementById('mute');
  if(btn){btn.textContent=MUTED?'🔇':'🔊';btn.classList.toggle('muted',MUTED);btn.title=MUTED?'Desmutar música':'Mutar música';}
}
function toggleMute(){
  MUTED=!MUTED;
  try{localStorage.setItem('sankofa_muted',MUTED?'1':'0')}catch(e){}
  applyMute();
}
function initAudio(){
  if(actx)return;
  try{actx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
  var bgSrc = (PHASE.audio && PHASE.audio.bg) || 'assets/bg-music.mp3';
  bgAudio = new Audio(bgSrc);
  bgAudio.loop=true;bgAudio.volume=.35;
  bgAudio.addEventListener('error', function(){
    console.warn('[audio] bg load error', bgSrc, bgAudio.error);
    showToast('⚠ Falha música: ' + bgSrc);
  });
  bgAudio.addEventListener('canplay', function(){
    console.log('[audio] bg ready', bgSrc);
  });
  bgAudio.play().catch(function(err){
    console.warn('[audio] bg play rejected', err && err.name, err && err.message);
  });
  var griotMap = (PHASE.audio && PHASE.audio.griot) || {};
  Object.keys(griotMap).forEach(function(t){
    var src = griotMap[t];
    var au = new Audio(src);
    au.volume = .95;
    au.addEventListener('error', function(){
      console.warn('[griot] load error', t, src, au.error);
    });
    au.addEventListener('canplaythrough', function(){
      console.log('[griot] ready', t);
    });
    au.load();
    griotAudios[t] = au;
  });
  applyMute();
}
function playGriot(type){
  var a=griotAudios[type];
  if(!a){
    console.warn('[griot] no audio registered for type', type);
    return;
  }
  Object.values(griotAudios).forEach(function(o){o.pause();o.currentTime=0;});
  // Duck BG hard so griot voice is clearly audible.
  if(bgAudio){bgAudio.volume=.05;}
  a.currentTime=0;
  a.volume = .98;
  a.play().then(function(){
    console.log('[griot] playing', type, 'dur', a.duration);
  }).catch(function(err){
    console.warn('[griot] play rejected', type, err && err.name, err && err.message);
    showToast('⚠ Griot mudo: ' + type);
    if(bgAudio) bgAudio.volume = .35;
  });
  a.onended=function(){if(bgAudio)bgAudio.volume=.35;};
}
function snd(type){
  if(!actx||MUTED)return;var t=actx.currentTime;
  function mk(f,w,v,d,fe){
    var o=actx.createOscillator(),g=actx.createGain();
    o.connect(g);g.connect(actx.destination);o.type=w;
    o.frequency.setValueAtTime(f,t);if(fe)o.frequency.exponentialRampToValueAtTime(fe,t+d);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.start(t);o.stop(t+d);
  }
  switch(type){
    case'j':mk(280,'sine',.1,.16,520);break;
    case'l':mk(120,'triangle',.06,.1,60);break;
    case'c':mk(880,'sine',.09,.22,1200);break;
    case'm':mk(523,'sine',.1,.4,null);setTimeout(function(){mk(659,'sine',.08,.3,null)},100);break;
    case's':mk(440,'sine',.08,.5,1320);break;
    case'g':mk(220,'triangle',.08,.6,330);setTimeout(function(){mk(165,'sine',.05,.8,247)},200);break;
    case'w':mk(523,'sine',.1,.3,null);setTimeout(function(){mk(659,'sine',.08,.3,null)},150);setTimeout(function(){mk(784,'sine',.1,.45,null)},300);break;
  }
}

// === MUTE BUTTON ===
function setupMute(){
  var btn=document.getElementById('mute');
  if(!btn)return;
  applyMute();
  btn.addEventListener('click',function(e){e.stopPropagation();toggleMute();});
}

// === MOBILE ===
function setupMobile(){
  var skip=document.querySelector('#rotate .r-skip');
  if(skip){
    skip.addEventListener('click',function(){document.body.classList.add('allow-portrait');});
    skip.addEventListener('pointerdown',function(e){e.preventDefault();document.body.classList.add('allow-portrait');});
  }
  // Try lock orientation (best effort — fails silently on iOS)
  if(screen.orientation&&screen.orientation.lock){
    var tryLock=function(){screen.orientation.lock('landscape').catch(function(){});};
    document.getElementById('intro').addEventListener('click',tryLock,{once:true});
  }
}

// === INPUT ===
function setupInput(){
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'||e.key==='a'){I.l=true;e.preventDefault()}
    if(e.key==='ArrowRight'||e.key==='d'){I.r=true;e.preventDefault()}
    if(e.key===' '||e.key==='ArrowUp'){if(!I.jh)I.jp=true;I.jh=true;e.preventDefault()}
    if(e.key==='b'||e.key==='B'){if(!I.sc)triggerScan();I.sc=true;e.preventDefault()}
    if(e.key==='e'||e.key==='E'){if(!I.ec)triggerInteract();I.ec=true;e.preventDefault()}
  });
  document.addEventListener('keyup',function(e){
    if(e.key==='ArrowLeft'||e.key==='a')I.l=false;
    if(e.key==='ArrowRight'||e.key==='d')I.r=false;
    if(e.key===' '||e.key==='ArrowUp')I.jh=false;
    if(e.key==='b'||e.key==='B')I.sc=false;
    if(e.key==='e'||e.key==='E')I.ec=false;
  });
  function tBtn(id,key,onPress){
    var el=document.getElementById(id);if(!el)return;
    function down(e){
      e.preventDefault();
      el.classList.add('down');
      if(key==='jh'){
        if(!I.jh)I.jp=true;
        I.jh=true;
      }else{
        I[key]=true;
      }
      if(onPress)onPress();
    }
    function up(e){
      if(e)e.preventDefault();
      el.classList.remove('down');
      I[key]=false;
    }
    el.addEventListener('touchstart',down,{passive:false});
    el.addEventListener('touchend',up,{passive:false});
    el.addEventListener('touchcancel',up,{passive:false});
    el.addEventListener('mousedown',down);
    el.addEventListener('mouseup',up);
    el.addEventListener('mouseleave',function(e){if(I[key]||I.jh)up(e);});
    el.addEventListener('contextmenu',function(e){e.preventDefault();});
  }
  tBtn('bl','l');
  tBtn('br','r');
  tBtn('bj','jh');
  tBtn('bs','sc',triggerScan);
  tBtn('be','ec',triggerInteract);
}

// === NPC DIALOG ===
function openNPC(n){
  S.paused=true;
  var el=document.getElementById('npcDialog');
  document.getElementById('nd-avatar').textContent=n.avatar;
  document.getElementById('nd-name').textContent=n.name;
  var df=document.getElementById('nd-diff');
  df.textContent=n.diff.toUpperCase();
  df.className='nd-diff '+(n.diff==='médio'?'med':n.diff==='difícil'?'hard':'');
  document.getElementById('nd-q').innerHTML=(n.scene?'<span class="nd-scene">'+escapeHTML(n.scene)+'</span>':'')+escapeHTML(n.q);
  var opts=document.getElementById('nd-opts');opts.innerHTML='';
  var fb=document.getElementById('nd-fb');fb.textContent='';
  shuffledOptions(n.o,n.c).forEach(function(opt){
    var b=document.createElement('button');
    b.textContent=opt.text;
    b.onclick=function(){
      Array.prototype.forEach.call(opts.children,function(x){x.disabled=true;});
      if(opt.correct){
        b.classList.add('correct');
        fb.textContent='✦ '+n.ok+' Recompensa: '+n.r;
        snd('c');
        n.done=true;
        S.winBlocked=false;
        n.rfn();
        refreshNPCVisibility();
        // Anuncia próximo NPC desbloqueado
        var done=npcDonesCount();
        var nxt=null;
        for(var j=0;j<NPCS.length;j++)if(!NPCS[j].done&&NPCS[j].unlock===done){nxt=NPCS[j];break;}
        if(nxt){
          setTimeout(function(){showStage('🌟 Novo amigo desbloqueado: <b>'+nxt.name+'</b>!<br>Continua a explorar...',5000);},2900);
        }
        setTimeout(closeNPC,2800);
      }else{
        b.classList.add('wrong');
        fb.textContent='Não é isso... tenta outra resposta.';
        snd('l');
        setTimeout(function(){
          Array.prototype.forEach.call(opts.children,function(x){x.disabled=false;x.classList.remove('wrong');});
          fb.textContent='';
        },1400);
      }
    };
    opts.appendChild(b);
  });
  el.classList.add('show');
}
function closeNPC(){
  document.getElementById('npcDialog').classList.remove('show');
  S.paused=false;
}

// === INTERACT VERB (E key / 🎙 btn) — anvil → NPC → griot ===
function triggerInteract(){
  if(!S.on)return;
  // QTE active → tap = forge hit
  if(FQE.active){ forgeQTETap(); return; }
  if(S.paused) return;
  // Anvil nearby? (Phase 1.3)
  var anvil = nearestAnvil();
  if(anvil){ openForgeQTE(anvil); return; }
  // NPC nearby?
  var n=null,nd=99;
  for(var i=0;i<NPCS.length;i++){
    var npc=NPCS[i];if(npc.done)continue;
    var d=Math.abs(S.x-npc.x);
    if(d<nd&&d<2.0){nd=d;n=npc;}
  }
  if(n){openNPC(n);return;}
  triggerGriot();
}

// === GRIOT (OUVIR) VERB ===
function triggerGriot(){
  if(!S.on)return;
  // Find closest fragment within 4 units (proximity required)
  var near=null,nd=99;
  mems.forEach(function(m){
    var d=Math.sqrt((S.x-m.x)*(S.x-m.x)+(S.y-m.y)*(S.y-m.y));
    if(d<nd&&d<4.5){nd=d;near=m;}
  });
  if(!near){
    showToast('O griot está em silêncio... aproxima-te de uma memória.');
    return;
  }
  if(!near.revealed&&!near.got){
    showToast('Memória oculta — usa o cajado (B) primeiro.');
    return;
  }
  snd('g');
  playGriot(near.type);
  showGriot(near.griot);
  // Pulsing glow on fragment
  if(!near.got){
    var orig=near.m.material.emissiveIntensity;
    var pulses=0;
    var iv=setInterval(function(){
      near.m.material.emissiveIntensity=pulses%2===0?1.3:orig;
      pulses++;
      if(pulses>=6){clearInterval(iv);near.m.material.emissiveIntensity=orig;}
    },200);
  }
}

// === SCAN VERB — revela fragmentos escondidos ===
function triggerScan(){
  if(!S.on||S.scan>0)return;
  S.scan=1.0;
  snd('s');
  // Phase 1.3: axe scan also cuts vine or chops tree (priority order).
  if(S.axe){
    if(cutNearbyVine()) return;
    if(chopNearbyTree()) return;
  }
  var revealed=0,closeFar=null,fd=99;
  mems.forEach(function(m){
    if(m.got)return;
    // Use x-distance primarily (side-scroller); add y-penalty if fragment unreachable from current y
    var dx=Math.abs(S.x-m.x);
    var dy=Math.abs(S.y-m.y);
    // Reveal range: 8 units in x, regardless of y (forgive verticality)
    if(dx<8&&dy<8&&!m.revealed){
      m.revealed=true;
      var t0=performance.now();
      var anim=setInterval(function(){
        var k=Math.min(1,(performance.now()-t0)/600);
        m.m.material.opacity=k;
        m.m.material.emissiveIntensity=k*.5;
        if(k>=1)clearInterval(anim);
      },16);
      revealed++;
      // Phase 1.2: clear matching sand wall + bonus cauris
      clearSandWall(m.type);
      var vh=m.y-S.y>1.5?' (lá em cima ↑)':'';
      showToast('✦ '+m.label+' revelado!'+vh);
    }else if(!m.revealed){
      // Closeness measured by x for direction, but consider both for ranking
      var dTotal=dx+dy*.6;
      if(dTotal<fd){fd=dTotal;closeFar=m;}
    }
  });
  if(revealed===0){
    if(closeFar){
      var dxF=closeFar.x-S.x;
      var dyF=closeFar.y-S.y;
      var arrow=Math.abs(dxF)<2?(dyF>0?'↑':'↓'):(dxF>0?'→':'←');
      var steps=Math.round(Math.abs(dxF));
      var vert=dyF>1.5?' e mais alto ↑':(dyF<-1.5?' e mais baixo ↓':'');
      showToast('Sinto algo '+arrow+' a '+steps+' passos'+vert);
    }else{
      showToast('Nada por perto... explora mais.');
    }
  }
  // Scan ring particles
  for(var i=0;i<14;i++){
    var a=(i/14)*Math.PI*2;
    var geo=new THREE.BoxGeometry(.06,.06,.06);
    var mat=new THREE.MeshLambertMaterial({color:P.gd,emissive:P.gd,emissiveIntensity:.8,transparent:true,opacity:1});
    var m=new THREE.Mesh(geo,mat);
    m.position.set(S.x,S.y+.5,0);scene.add(m);
    parts.push({m:m,vx:Math.cos(a)*6,vy:Math.sin(a)*6,vz:0,life:1,decay:1.5});
  }
  S.beaconOn=true;
}

function updateBeacon(){
  var el=document.getElementById('beacon');
  if(!el||!S.beaconOn)return;
  // Find nearest non-collected memory
  var nearest=null,nd=99;
  mems.forEach(function(m){
    if(m.got)return;
    var dx=Math.abs(S.x-m.x);
    if(dx<nd){nd=dx;nearest=m;}
  });
  if(!nearest){el.classList.remove('show');return;}
  var dxF=nearest.x-S.x;
  var dyF=nearest.y-S.y;
  var steps=Math.round(Math.abs(dxF));
  var label=Math.abs(dxF)<1.5?(dyF>1?'↑ Olha pra cima':'Aqui!'):steps+' passos';
  if(dyF>1.5&&Math.abs(dxF)>=1.5)label+=' ↑';
  el.querySelector('.b-label').textContent=label;
  if(dxF<0)el.classList.add('left');else el.classList.remove('left');
  el.classList.add('show');
}

// === PHYSICS ===
function getGround(px,py){
  var best=-999;
  for(var i=0;i<plats.length;i++){
    var p=plats[i];
    if(px>=p.l&&px<=p.r&&p.t<=py+.6){if(p.t>best)best=p.t;}
  }
  return best;
}

function getPlatBelow(px,py){
  var best=-999;
  for(var i=0;i<plats.length;i++){
    var p=plats[i];
    if(px>=p.l&&px<=p.r){if(p.t<=py+.6&&p.t>best)best=p.t;}
  }
  return best;
}

function update(dt){
  if(!S.on||S.won||S.paused)return;
  dt=Math.min(dt,.04);

  // Move moving platforms BEFORE physics so AABB collision sees current pos.
  updateMovingPlats();

  var dir=(I.l?-1:0)+(I.r?1:0);
  var acc=S.gnd?ACC:ACC*AIR;
  var dec=S.gnd?DEC:DEC*AIR;

  if(dir!==0){
    S.vx+=dir*acc*dt;
    if(S.vx>MAX)S.vx=MAX;if(S.vx<-MAX)S.vx=-MAX;
    S.face=dir;
  }else{
    if(Math.abs(S.vx)>.5)S.vx-=Math.sign(S.vx)*dec*dt;
    else S.vx=0;
  }

  var now=performance.now()/1000;
  if(S.gnd)S.lgt=now;
  var cg=now-S.lgt<COY;

  if(I.jp){S.jb=JB;I.jp=false;}
  S.jb-=dt;

  if(S.jb>0&&(S.gnd||cg)){
    S.vy=JF;S.gnd=false;S.jb=0;
    applySq(.82,1.18);snd('j');
  }

  if(!I.jh&&S.vy>2)S.vy*=JC;

  var gravMul=S.vy>0?1:1.35;
  S.vy-=G*gravMul*dt;

  S.py=S.y;
  S.x+=S.vx*dt;
  S.y+=S.vy*dt;

  var gy=getPlatBelow(S.x,S.y);
  if(S.y<=gy&&S.vy<=0){
    if(!S.gnd&&S.py>gy-.4){
      var imp=Math.min(Math.abs(S.vy)/12,1);
      if(imp>.15){spawnDust(S.x,gy,imp);snd('l');}
      applySq(1+imp*.22,1-imp*.18);
    }
    S.y=gy;S.vy=0;S.gnd=true;
  }else if(S.y>gy+.05){S.gnd=false;}

  // Solid AABB collision for floating platforms (sides + head bump)
  var hw=.45,ht=2.0;
  for(var pi=0;pi<plats.length;pi++){
    var fp=plats[pi];
    if(fp.tp!=='float')continue;
    var pl=fp.l,pr=fp.r,ptop=fp.t,pbot=fp.cy-fp.h/2;
    if(S.x+hw<=pl||S.x-hw>=pr)continue;
    if(S.y>=ptop||S.y+ht<=pbot)continue;
    var fromR=(S.x+hw)-pl;
    var fromL=pr-(S.x-hw);
    var fromT=(S.y+ht)-pbot;
    var fromB=ptop-S.y;
    var minH=Math.min(fromR,fromL);
    var minV=Math.min(fromT,fromB);
    if(minV<minH){
      if(fromB<fromT){
        S.y=ptop;S.vy=0;S.gnd=true;
      }else{
        S.y=pbot-ht;
        if(S.vy>0)S.vy=-1.5;
        snd('l');spawnDust(S.x,S.y+ht,.6);
        applySq(1.18,.82);
      }
    }else{
      if(fromL<fromR){S.x=pr+hw;}else{S.x=pl-hw;}
      S.vx=0;
    }
  }

  if(S.gnd)S.lastSafeX=S.x;
  if(S.y<-6){ S.deathCause='queda'; loseLife(); }

  // Squash spring
  var sk=15,dmp=.8;
  S.svx+=(1-S.sx)*sk*dt;S.svy+=(1-S.sy)*sk*dt;
  S.svx*=dmp;S.svy*=dmp;S.sx+=S.svx;S.sy+=S.svy;

  // Air stretch
  if(!S.gnd){
    var str=1+Math.abs(S.vy)*.003;
    if(str>1.15)str=1.15;
    S.sy+=(str-S.sy)*.1;S.sx+=(1/str-S.sx)*.1;
  }

  S.at+=dt;
  if(S.scan>0)S.scan-=dt;

  // Collectibles
  cauris.forEach(function(c){
    if(!c.got&&Math.abs(S.x-c.x)<.6&&Math.abs(S.y+1-c.y)<.8){
      c.got=true;c.m.visible=false;S.cc++;
      spawnCollectEffect(c.x,c.y,P.gd);snd('c');
    }
  });
  mems.forEach(function(m){
    if(!m.got&&m.revealed&&Math.abs(S.x-m.x)<.7&&Math.abs(S.y+1-m.y)<.9){
      m.got=true;m.m.visible=false;S.mc++;
      spawnCollectEffect(m.x,m.y,P.gd);snd('m');
      playGriot(m.type);
      showGriot(m.griot); // auto griot — momento educativo
      setTimeout(updateProgress,7500);
    }
  });

  // Win
  var memsTotal = phaseMemsTotal();
  if(S.mc >= memsTotal && !S.won){
    if(!phaseCanWin()){
      if(!S.winBlocked){
        S.winBlocked=true;
        showStage(missingWinText(),6000);
      }
      return;
    }
    S.won=true;snd('w');
    var perf = isPerfectRun();
    markPhaseDone(perf);
    if(bgAudio){
      var fadeIv=setInterval(function(){
        if(bgAudio.volume>.05){bgAudio.volume-=.03;}
        else{bgAudio.volume=0;clearInterval(fadeIv);}
      },80);
    }
    var STR = (PHASE.strings) || {};
    var stagePerf = STR.stageWinPerfect || '🌟 <b>PERFEIÇÃO</b> — Tu és arqueóloga do Sankofa';
    var stageNorm = STR.stageWin       || '🌟 <b>Volta. E. Busca.</b> — Memórias recuperadas';
    showStage(perf ? stagePerf : stageNorm, 5000);
    setTimeout(function(){
      document.getElementById('wc').textContent=S.cc;
      document.getElementById('wh').textContent=S.hp;
      var wt=document.getElementById('win-title');
      var wm=document.getElementById('win-msg');
      var wp=document.getElementById('win-perfect');
      // Base title + msg (overridable per phase)
      if(wt && STR.winTitle && !perf) wt.textContent = STR.winTitle;
      if(wm && STR.winMsg && !perf)  wm.textContent = STR.winMsg;
      if(perf){
        wt.textContent = '🌟 PERFEIÇÃO!';
        wt.classList.add('perf');
        wm.textContent = STR.winMsgPerfect || 'Sem perder uma vida. És uma verdadeira arqueóloga do Sankofa.';
        wp.style.display='block';
        var perfCode = (PHASE.win && PHASE.win.perfect && PHASE.win.perfect.code) || 'RIFT2026';
        var codeEl = wp.querySelector('.code-value');
        if(codeEl) codeEl.textContent = perfCode;
        var va=new Audio('assets/vovo-perfect.mp3');
        va.volume=.95;va.muted=MUTED;va.play().catch(function(){});
        setupShare();
      }
      document.getElementById('win').classList.add('show');
    },4500);
  }

  // Animate collectibles
  var t=performance.now()/1000;
  cauris.forEach(function(c){
    if(!c.got){c.m.rotation.y=t*2;c.m.position.y=c.y+Math.sin(t*3+c.x)*.1;}
  });
  mems.forEach(function(m){
    if(!m.got){m.m.rotation.y=t*1.5;m.m.rotation.x=t*.8;m.m.position.y=m.y+Math.sin(t*2+m.x)*.15;}
  });

  updateParts(dt);
  updateInteractables();
  updateBonusMems();
  updateHazards();
  updateLucinha();
  updateNPCs(dt);
  updateCamera(dt);
  updateHUD();
  updateBeacon();
}

function applySq(x,y){S.sx=x;S.sy=y;S.svx=0;S.svy=0;}

// === ANIMATION (sprite 2D) ===
function updateLucinha(){
  if(!luci)return;
  luci.position.set(S.x,S.y,0);

  var st='idle';
  if(!S.gnd)st=S.vy>0?'jump':'fall';
  else if(Math.abs(S.vx)>.5)st='run';

  // Squash/stretch + run bobbing
  var t=S.at;
  var bob=st==='run'?Math.abs(Math.sin(t*10))*.07:0;
  var sx=S.sx*1.8*(S.face>0?1:-1);
  var sy=S.sy*(2.6+bob);
  luci.scale.set(sx,sy,1);
}

// === CAMERA ===
function updateCamera(dt){
  var tx=S.x+S.face*2.5;
  var ty=Math.max(S.y+2.5,3.5);
  S.cx+=(tx-S.cx)*.06;S.cy+=(ty-S.cy)*.06;
  var cz=innerWidth<innerHeight?16:12;
  cam.position.set(S.cx,S.cy,cz);
  cam.lookAt(S.cx,S.cy-1.8,0);
}

// === HUD ===
function phaseMemsTotal(){
  return (PHASE.progress && PHASE.progress.memsTotal) || (PHASE.mems ? PHASE.mems.length : 3) || 3;
}

function completedNPCs(){
  return NPCS.filter(function(n){return n.done;}).length;
}

function phaseCanWin(){
  var base = (PHASE.win && PHASE.win.base) || {};
  return completedNPCs() >= (base.npcs || 0);
}

function missingWinText(){
  var base = (PHASE.win && PHASE.win.base) || {};
  var left = Math.max(0, (base.npcs || 0) - completedNPCs());
  if(left>0) return 'As memórias estão prontas. Fala com mais <b>'+left+' guardião'+(left===1?'':'ões')+'</b> para fechar esta fase.';
  return 'Há uma pista narrativa pendente antes de fechar esta fase.';
}

function isPerfectRun(){
  var perfect = (PHASE.win && PHASE.win.perfect) || {};
  if(!S.perfect) return false;
  if(perfect.npcs && completedNPCs() < perfect.npcs) return false;
  if(perfect.allCauris && S.cc < cauris.length) return false;
  if(perfect.noDamage && !S.perfect) return false;
  if(perfect.axeForged && !S.axe) return false;
  return true;
}

function updateHUD(){
  document.getElementById('cc').textContent=S.cc;
  document.getElementById('mc').textContent=S.mc+'/'+phaseMemsTotal();
  var h=document.getElementById('hearts');
  if(h){
    var cap=S.hpCap||3;
    h.textContent='❤'.repeat(Math.max(0,S.hp))+'♡'.repeat(Math.max(0,3-S.hp));
    h.textContent='❤'.repeat(Math.max(0,S.hp))+'♡'.repeat(Math.max(0,cap-S.hp));
    var p=h.parentElement;
    if(p)p.classList.toggle('low',S.hp<=1);
  }
}

// === LIFE / ENIGMA ===
function resetCollectibles(){
  // Restore all cauris
  cauris.forEach(function(c){
    if(c.got){c.got=false;c.m.visible=true;}
  });
  // Restore non-collected memories to hidden state (already-collected stay collected)
  // But user wants ALL pieces back: reset everything
  mems.forEach(function(m){
    if(m.got){m.got=false;m.m.visible=true;}
    m.revealed=false;
    m.m.material.opacity=0;
    m.m.material.emissiveIntensity=0;
  });
  S.cc=0;S.mc=0;
  S.beaconOn=false;
  document.getElementById('beacon').classList.remove('show');
}

function deathLabel(cause){
  switch(cause){
    case 'snake': return '🐍 <b>A cobra picou-te</b>';
    case 'croc':  return '🐊 <b>O crocodilo apanhou-te</b>';
    case 'hippo': return '🦛 <b>O hipopótamo afastou-te</b>';
    case 'water': return '🌊 <b>Caíste na água</b>';
    case 'queda':
    default:      return '💀 <b>Caíste no vazio</b>';
  }
}

function loseLife(){
  if(S.dying) return; // re-entry guard
  S.dying = true;
  S.hp--;
  S.perfect = false;
  snd('l');
  // HUD flash
  var hud = document.getElementById('hud');
  if(hud){
    hud.style.transition = 'filter .3s';
    hud.style.filter = 'hue-rotate(-30deg) brightness(1.3)';
    setTimeout(function(){ hud.style.filter = ''; }, 400);
  }
  // Pause physics by flagging paused; render keeps running.
  S.vx = 0; S.vy = 0;
  S.paused = true;
  // Tip Lucinha sideways: rotate sprite material in screen plane.
  if(luci && luci.material){
    luci.material.rotation = (S.face > 0 ? -1 : 1) * Math.PI / 2;
  }
  // Death banner with cause
  var cause = S.deathCause || 'queda';
  showStage(deathLabel(cause) + '...', 1700);
  // After short pause, proceed to recovery / enigma.
  setTimeout(function(){
    if(luci && luci.material) luci.material.rotation = 0;
    S.dying = false;
    S.deathCause = null;
    resetCollectibles();
    if(S.hp <= 0){
      // showEnigma sets S.paused internally; keep paused until enigma resolved.
      showEnigma();
    }else{
      S.paused = false;
      showStage('💔 Caíste! Peças voltaram. Restam <b>' + S.hp + ' vida' + (S.hp === 1 ? '' : 's') + '</b>', 3500);
      S.x = 0; S.y = 5; S.vx = 0; S.vy = 0; S.lastSafeX = 0;
    }
  }, 1900);
}

var enigmaUsed=[];

function markPhaseDone(perfect){
  try{
    var prog = JSON.parse(localStorage.getItem('sankofa_kids_progress') || '{}');
    prog.phases = prog.phases || {};
    var cur = prog.phases[PHASE_ID] || {};
    prog.phases[PHASE_ID] = { done: true, perfect: perfect || cur.perfect || false };
    localStorage.setItem('sankofa_kids_progress', JSON.stringify(prog));
  }catch(e){}
}

function setupShare(){
  var btn=document.getElementById('share-btn');
  if(!btn)return;
  btn.onclick=function(){
    var perfCode = (PHASE.win && PHASE.win.perfect && PHASE.win.perfect.code) || 'RIFT2026';
    var text = 'Completei "' + PHASE.name + '" sem perder uma vida! 🌟 Código ' + perfCode + '. Joga Sankofa Kids!';
    var url=window.location.href;
    if(navigator.share){
      navigator.share({title:'Sankofa Kids: Rift Memories',text:text,url:url}).catch(function(){});
    }else{
      navigator.clipboard.writeText(text+' '+url).then(function(){
        btn.textContent='✓ Copiado!';
        setTimeout(function(){btn.textContent='📤 Compartilhar conquista';},2000);
      });
    }
  };
}

// Apply reward of a correctly-answered enigma. Defaults to 'vida'.
// Spec: 'vida' | 'passagem' | 'cauris' | 'ferramenta'
function applyEnigmaReward(reward){
  switch(reward){
    case 'cauris': {
      var bonus = 8;
      S.cc += bonus;
      S.x = S.lastSafeX || 0; S.y = 5; S.vx = 0; S.vy = 0;
      if(S.hp < 1) S.hp = 1;
      showStage('🐚 <b>+' + bonus + ' cauris</b> ganhos! Volta para o teu lugar.', 3500);
      break;
    }
    case 'passagem': {
      S.passageOpen = true;
      S.x = S.lastSafeX || 0; S.y = 5; S.vx = 0; S.vy = 0;
      if(S.hp < 1) S.hp = 1;
      showStage('🚪 <b>Passagem aberta!</b> O caminho seguinte está liberto.', 3500);
      break;
    }
    case 'ferramenta': {
      S.axe = true;
      S.anvilUnlocked = true;
      S.x = S.lastSafeX || 0; S.y = 5; S.vx = 0; S.vy = 0;
      if(S.hp < 1) S.hp = 1;
      showStage('🪓 <b>Ferramenta recebida!</b> Usa <b>B</b> com a nova ferramenta.', 4000);
      break;
    }
    case 'vida':
    default: {
      S.hp = 1;
      S.x = 0; S.y = 5; S.vx = 0; S.vy = 0; S.lastSafeX = 0;
      showStage('❤ <b>+1 vida</b> comprada! Recomeça do início.', 3500);
      break;
    }
  }
}

function showEnigma(){
  S.paused=true;
  // Pick unused enigma
  var avail=ENIGMAS.filter(function(_,i){return enigmaUsed.indexOf(i)<0;});
  if(avail.length===0){enigmaUsed=[];avail=ENIGMAS.slice();}
  var idx=Math.floor(Math.random()*avail.length);
  var origIdx=ENIGMAS.indexOf(avail[idx]);
  enigmaUsed.push(origIdx);
  var en=avail[idx];
  var el=document.getElementById('enigma');
  // Customize prompt by reward type
  var prompt = el.querySelector('.e-prompt');
  if(prompt){
    var rewardMap = {
      cauris:    'ganhar <b>cauris</b> e voltar ao jogo',
      passagem:  'abrir <b>passagem</b> e continuar',
      ferramenta:'receber <b>ferramenta</b> e seguir',
      vida:      'comprar <b>1 vida</b> e voltar ao jogo'
    };
    var rewardKey = en.reward || 'vida';
    prompt.innerHTML = 'Acerta o enigma para ' + (rewardMap[rewardKey] || rewardMap.vida);
  }
  var meta = [];
  if(en.type) meta.push(en.type);
  if(en.diff) meta.push(en.diff);
  el.querySelector('.e-question').innerHTML =
    (meta.length?'<div class="e-meta">'+escapeHTML(meta.join(' · '))+'</div>':'')+
    (en.scene?'<div class="e-scene">'+escapeHTML(en.scene)+'</div>':'')+
    '<div>'+escapeHTML(en.q)+'</div>';
  var opts=el.querySelector('.e-options');
  opts.innerHTML='';
  el.querySelector('.e-feedback').textContent='';
  shuffledOptions(en.o,en.c).forEach(function(opt){
    var btn=document.createElement('button');
    btn.textContent=opt.text;
    btn.onclick=function(){
      // Disable all
      Array.prototype.forEach.call(opts.children,function(b){b.disabled=true;});
      if(opt.correct){
        btn.classList.add('correct');
        el.querySelector('.e-feedback').textContent='✦ Correto! '+en.e;
        snd('c');
        setTimeout(function(){
          el.classList.remove('show');
          applyEnigmaReward(en.reward || 'vida');
          S.paused=false;
        },4500);
      }else{
        btn.classList.add('wrong');
        el.querySelector('.e-feedback').textContent='Tenta de novo... '+en.e;
        snd('l');
        setTimeout(function(){showEnigma();},4500);
      }
    };
    opts.appendChild(btn);
  });
  el.classList.add('show');
}

var toastTimer=null;
function showToast(text){
  var el=document.getElementById('toast');
  if(!el)return;
  el.textContent='✦ '+text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){el.classList.remove('show');},2500);
}

var griotTimer=null;
function showGriot(text){
  var el=document.getElementById('griot');
  if(!el)return;
  el.querySelector('.g-text').textContent='"'+text+'"';
  el.classList.add('show');
  clearTimeout(griotTimer);
  griotTimer=setTimeout(function(){el.classList.remove('show');},7000);
  el.onclick=function(){clearTimeout(griotTimer);el.classList.remove('show');};
}

var stageTimer=null;
function showStage(html,dur){
  var el=document.getElementById('stage');
  if(!el)return;
  el.querySelector('.s-text').innerHTML=html;
  el.classList.add('show');
  clearTimeout(stageTimer);
  stageTimer=setTimeout(function(){el.classList.remove('show');},dur||5000);
}

function updateProgress(){
  var pp = PHASE.progress || {memsTotal:3, msg1:'1ª memória! Faltam <b>{left}</b>', msg2:'Falta <b>1</b>', msg3:'🌟 Todas memórias!'};
  var total = pp.memsTotal;
  var got = mems.filter(function(m){return m.got;}).length;
  var revealed = mems.filter(function(m){return m.revealed && !m.got;}).length;
  if(got === 0 && revealed === 0){
    showStage('Use o cajado <b>(B)</b> para revelar memórias escondidas', 6000);
  }else if(got === 1){
    showStage(pp.msg1.replace('{left}', total - got), 5000);
  }else if(got === total - 1){
    showStage(pp.msg2, 5000);
  }else if(got === total){
    showStage(pp.msg3, 4000);
  }
}

// === LOOP ===
var lastT=0;
function loop(t){
  requestAnimationFrame(loop);
  var dt=Math.min((t-lastT)/1000,.05);
  lastT=t;
  if(S.on)update(dt);
  ren.render(scene,cam);
}

// === PWA INSTALL ===
var deferredInstall=null;
function isStandalone(){
  return matchMedia('(display-mode:standalone)').matches||matchMedia('(display-mode:fullscreen)').matches||navigator.standalone===true;
}
function detectPlatform(){
  var ua=navigator.userAgent;
  var iOS=/iPad|iPhone|iPod/.test(ua)&&!window.MSStream;
  var safari=iOS&&/Safari/.test(ua)&&!/CriOS|FxiOS|EdgiOS/.test(ua);
  var android=/Android/.test(ua);
  var chromeAndroid=android&&/Chrome/.test(ua);
  return {iOS:iOS,safari:safari,android:android,chromeAndroid:chromeAndroid,mobile:iOS||android,desktop:!iOS&&!android};
}
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();
  deferredInstall=e;
});
window.addEventListener('appinstalled',function(){
  deferredInstall=null;
  var btn=document.getElementById('install');
  if(btn)btn.style.display='none';
  try{localStorage.setItem('sankofa_installed','1')}catch(e){}
});
function showInstallInstructions(){
  var p=detectPlatform();
  var title='INSTALAR APP',steps=[];
  if(p.iOS){
    title='INSTALAR NO IPHONE/IPAD';
    steps=[
      'Toca no botão <b>Partilhar</b> (caixa com seta ↑) em baixo no Safari',
      'Desliza e toca em <b>"Adicionar ao Ecrã Principal"</b>',
      'Toca <b>"Adicionar"</b> no canto superior direito',
      'Pronto! Abre o jogo pelo ícone no ecrã'
    ];
  }else if(p.chromeAndroid){
    title='INSTALAR NO ANDROID';
    steps=[
      'Toca no <b>menu ⋮</b> do Chrome (canto superior direito)',
      'Toca em <b>"Instalar app"</b> ou <b>"Adicionar ao ecrã"</b>',
      'Confirma <b>"Instalar"</b>',
      'Pronto! Abre pelo ícone Sankofa no ecrã'
    ];
  }else{
    title='INSTALAR APP';
    steps=[
      'Procura o ícone de <b>instalar ⬇</b> na barra de endereço do browser',
      'OU abre o <b>menu do browser</b> (⋮ ou ≡)',
      'Toca em <b>"Instalar Sankofa Rift"</b>',
      'Pronto! Abre como app sem browser'
    ];
  }
  document.getElementById('im-title').textContent=title;
  var ol=document.getElementById('im-steps');
  ol.innerHTML='';
  steps.forEach(function(s){var li=document.createElement('li');li.innerHTML=s;ol.appendChild(li);});
  document.getElementById('installModal').classList.add('show');
}
function setupInstall(){
  var btn=document.getElementById('install');
  var modal=document.getElementById('installModal');
  var close=document.getElementById('im-close');
  if(!btn)return;
  // Hide ONLY if already running as standalone (installed + opened from icon)
  if(isStandalone()){btn.style.display='none';return;}
  // Force show — covers all platforms (Chrome prompt OR fallback modal)
  btn.style.display='flex';
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    if(deferredInstall){
      deferredInstall.prompt();
      deferredInstall.userChoice.then(function(c){
        if(c&&c.outcome==='accepted'){btn.style.display='none';}
        deferredInstall=null;
      });
    }else{
      showInstallInstructions();
    }
  });
  if(close){close.addEventListener('click',function(){modal.classList.remove('show');});}
  if(modal){modal.addEventListener('click',function(e){if(e.target===modal)modal.classList.remove('show');});}
}
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

// === PHASE SELECTOR ===
var PHASE_ORDER = ['1.1','1.2','1.3'];

function getProgress(){
  try{
    var p = JSON.parse(localStorage.getItem('sankofa_kids_progress') || '{}');
    return p.phases || {};
  }catch(e){ return {}; }
}

function isPhaseUnlocked(id, progress){
  var phaseObj = window['PHASE_' + id.replace('.', '_')];
  if(!phaseObj) return false;
  if(!phaseObj.prevDone) return true;
  return !!(progress[phaseObj.prevDone] && progress[phaseObj.prevDone].done);
}

function setupPhaseLabel(){
  var el = document.getElementById('phase-label');
  if(!el || !PHASE) return;
  el.innerHTML = '<span class="pl-id">' + escapeHTML(PHASE.id) + '</span>' + escapeHTML((PHASE.name || '').toUpperCase());
}

function showPhaseLabel(){
  var el = document.getElementById('phase-label');
  if(el) el.classList.add('show');
}

function setupPhaseSelector(){
  var host = document.getElementById('phase-select');
  if(!host) return;
  host.innerHTML = '';
  var progress = getProgress();
  PHASE_ORDER.forEach(function(id){
    var data = window['PHASE_' + id.replace('.', '_')];
    if(!data) return;
    var prog = progress[id] || {};
    var unlocked = isPhaseUnlocked(id, progress);
    var current = id === PHASE_ID;
    var card = document.createElement('div');
    card.className = 'pc';
    if(current) card.classList.add('current');
    else if(prog.done) card.classList.add('done');
    if(!unlocked) card.classList.add('locked');
    var stateLabel;
    if(!unlocked) stateLabel = '🔒 Bloqueado';
    else if(current) stateLabel = '▶ Selecionado';
    else if(prog.done) stateLabel = prog.perfect ? '🌟 Perfeito' : '✓ Concluído';
    else stateLabel = '▶ Jogar';
    card.innerHTML =
      '<div class="pc-id">' + id + '</div>' +
      '<div class="pc-name">' + data.name + '</div>' +
      '<div class="pc-state">' + stateLabel + '</div>';
    card.addEventListener('click', function(e){
      e.stopPropagation();
      if(!unlocked || current) return;
      location.search = '?phase=' + id;
    });
    host.appendChild(card);
  });
  // Update title to current phase
  var titleEl = document.getElementById('intro-title');
  if(titleEl && PHASE && PHASE.name) titleEl.textContent = PHASE.name.toUpperCase();
  var titleCard = document.getElementById('title-card');
  if(titleCard && PHASE){
    var tcStr = (PHASE.strings && PHASE.strings.titleCard)
      || ((PHASE.name || '') + ' — usa o cajado (B) para revelar pistas');
    titleCard.textContent = (PHASE.id ? PHASE.id + ' · ' : '') + tcStr;
  }
}

// === INIT ===
function init(){
  initScene();
  luci=createLucinha();
  scene.add(luci);
  buildLevel();
  buildSandWalls();
  buildInteractables();
  buildVines();
  buildBonusMems();
  buildMovingPlats();
  buildHazards();
  buildBackground();
  buildNPCs();
  setupForgeQTE();
  setupInput();
  setupMobile();
  setupMute();
  setupInstall();
  setupPhaseSelector();
  setupPhaseLabel();
  var ndClose=document.getElementById('nd-close');
  if(ndClose)ndClose.addEventListener('click',closeNPC);

  S.cx=0;S.cy=3.5;

  // Click intro: rewind + unmute video for ~3s of Vovó voice, then start game
  document.getElementById('intro').addEventListener('click',function(){
    var v=document.getElementById('intro-vid');
    if(v){v.muted=MUTED;v.volume=.9;v.currentTime=0;v.play().catch(function(){});}
    setTimeout(function(){
      if(v){v.pause();}
      initAudio();
      document.getElementById('intro').classList.add('out');
      S.on=true;
      showPhaseLabel();
      // Tutorial from phase
      (PHASE.tutorial || []).forEach(function(t){
        setTimeout(function(){ showStage(t.html, t.ms); }, t.delay);
      });
    },3500);
  });

  requestAnimationFrame(loop);
}

init();
})();
