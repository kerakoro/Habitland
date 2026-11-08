/* Where Habits Take Root — layout, watering, publication and story. */
(async function(){
let preserveGardenScroll=false;
const design=await fetch('design-assets.json').then(r=>r.json());
const siteConfig=await fetch('site-config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Configuration unavailable');return r.json()}).catch(()=>({}));
// Fixed handwritten text is exported as vector paths; no Bradley font is installed or fetched.
const nav=document.querySelector('nav');
const brand=document.createElement('div');brand.id='siteTitle';brand.setAttribute('aria-label','Where Habits Take Root');nav.prepend(brand);
$('plateView').classList.remove('brand');
for(const [id,text] of [['featuredView','Featured Displays'],['storyView','Story'],['filmView','Film']]){let b=document.createElement('button');b.id=id;b.setAttribute('aria-label',text);nav.append(b)}
$('resetLayout').hidden=true;$('grow').hidden=true;
const main=document.querySelector('main');$('back').classList.remove('save-action');$('back').innerHTML='‹ Back';main.append($('back'));
$('allTypes').innerHTML='‹ Back';
const help=document.createElement('button');help.id='howToPlay';help.textContent='How to Play';main.append(help);
const helpPanel=document.createElement('div');helpPanel.id='helpPanel';helpPanel.hidden=true;helpPanel.setAttribute('role','dialog');helpPanel.setAttribute('aria-label','How to Play');helpPanel.innerHTML=`<button id="closeHelp" aria-label="Close instructions">×</button><div><p><b>Step 1: Choose Your Containers</b><br>If you don’t like the containers on the plate, click ‘Recreate’ to get new ones, or choose from the ‘Other Containers’ catalogue.</p><p><b>Step 2: Organise Your Garden</b><br>Drag and rearrange the containers with your mouse until you are happy with the layout.</p><p><b>Step 3: Choose Your Seeds</b><br>Click to select the plants you want to grow from the seed library, or drag the seeds directly into your chosen containers.</p><p><b>Step 4: Water Your Plants</b><br>Drag the watering can to water your containers.</p></div>`;main.append(helpPanel);
help.onclick=()=>{helpPanel.hidden=!helpPanel.hidden;help.setAttribute('aria-expanded',String(!helpPanel.hidden));if(!helpPanel.hidden)$('closeHelp').focus()};$('closeHelp').onclick=()=>{helpPanel.hidden=true;help.setAttribute('aria-expanded','false');help.focus()};document.addEventListener('keydown',e=>{if(e.key==='Escape'){helpPanel.hidden=true;stopWater()}});
const canSVG=design.can;
const waterButton=document.createElement('button');waterButton.id='wateringCan';waterButton.setAttribute('aria-label','Drag watering can to water containers');waterButton.innerHTML=canSVG;$('canvasTools').prepend(waterButton);
const more=document.createElement('div');more.id='moreHint';more.innerHTML='Click to get more <span>↙</span>';$('otherSection').prepend(more);
let screen='garden',pendingSnapshot=null,currentDisplay=null;
const publishPage=document.createElement('div');publishPage.id='publishPage';publishPage.className='screen';publishPage.hidden=true;publishPage.innerHTML=`<img id="publishPreview" alt="Preview of my garden"><button id="publishBack" class="panel-back">‹ Back</button><div id="titleForm"><label for="gardenTitle">Add a title to your garden. After publication<br>your garden will show up in the overview!</label><input id="gardenTitle" placeholder="Title" maxlength="80" autocomplete="off"><p id="publishError" role="alert"></p></div><p id="publishedMessage" hidden>Display published!</p><h1 id="publishedTitle" hidden></h1><button id="downloadDisplay" hidden>Download</button>`;
document.body.append(publishPage);
const publishAction=document.createElement('button');publishAction.id='publishAction';publishAction.className='frame-action';publishAction.setAttribute('aria-label','Publish');publishAction.textContent='Publish';nav.append(publishAction);
const newAction=document.createElement('button');newAction.id='createNew';newAction.className='frame-action';newAction.setAttribute('aria-label','Create a New One');nav.append(newAction);
const featured=document.createElement('div');featured.id='featuredPage';featured.className='screen';featured.hidden=true;featured.innerHTML='<div id="displayGrid"></div><p id="galleryEmpty" hidden>No displays yet. Create and publish my first garden.</p><p id="galleryStatus" role="status"></p>';document.body.append(featured);
const filmPage=document.createElement('article');filmPage.id='filmPage';filmPage.className='screen film-screen';filmPage.hidden=true;filmPage.setAttribute('aria-label','Film');filmPage.innerHTML=`<div class="film-column"><div class="film-copy"><p lang="zh-CN">2021年，因为土地整理项目，外婆和舅舅所在的农村被告知需要拆迁，舅舅一家也因此搬到了城市生活。六年后的夏天，我回到老家农村，记忆中的场景都不复存在，取而代之的是大片的水稻田和工厂。此影片献给陪伴我成长的乡村，以及生活在那里的人们。</p><p lang="en-GB">In 2021, my grandmother and uncle's village was told to be demolished as part of a land consolidation project. My uncle and his family moved to the city after that. Six years later, in the summer, I returned to the home village. The landscape I remembered were gone, replaced by vast rice fields and factories.</p><p lang="en-GB">This film is dedicated to the village that was part of my childhood, and the people who lived there.</p></div><div class="film-video" id="filmVideo"></div></div>`;document.body.append(filmPage);
function openFilmPlayer(){if($('filmPlayer'))return;const player=document.createElement('iframe');player.id='filmPlayer';player.className='film-player';player.title='Film — Where Habits Take Root';player.width=1080;player.height=607.5;player.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';player.allowFullscreen=true;player.setAttribute('referrerpolicy','strict-origin-when-cross-origin');const url=new URL('https://www.youtube-nocookie.com/embed/j_Hi21O5q2I');url.searchParams.set('enablejsapi','1');url.searchParams.set('playsinline','1');url.searchParams.set('rel','0');if(/^https?:$/.test(location.protocol))url.searchParams.set('origin',location.origin);player.src=url.href;$('filmVideo').append(player)}
function pauseFilm(){const player=$('filmPlayer');player?.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}),'https://www.youtube-nocookie.com')}
function navigate(next){if(screen==='film'&&next!=='film')pauseFilm();if(next!=='garden')stopWater();screen=next;const garden=next==='garden';main.hidden=!garden;$('collectedSection').hidden=!garden||viewMode==='single';$('chooserSection').hidden=!garden;featured.hidden=next!=='featured';$('storyPage').hidden=next!=='story';filmPage.hidden=next!=='film';if(next==='film')openFilmPlayer();publishPage.hidden=!['publish','complete'].includes(next);$('new').hidden=!garden||viewMode==='single';nav.classList.toggle('publishing',['publish','complete'].includes(next));publishAction.hidden=next!=='publish';newAction.hidden=next!=='complete';$('export').hidden=!garden||viewMode==='single';$('plateView').classList.toggle('active',garden);$('singleView').classList.toggle('active',garden&&viewMode==='single');$('featuredView').classList.toggle('active',next==='featured');$('storyView').classList.toggle('active',next==='story');$('filmView').classList.toggle('active',next==='film');$('filmView').setAttribute('aria-current',next==='film'?'page':'false');$('howToPlay').hidden=!garden||viewMode==='single';$('canvasTools').hidden=!garden||viewMode==='single';$('back').hidden=!garden||viewMode!=='single';if(!garden)helpPanel.hidden=true;$('plateView').setAttribute('aria-pressed',String(garden));$('singleView').setAttribute('aria-pressed',String(garden&&viewMode==='single'));fitDesign();if(!preserveGardenScroll)window.scrollTo(0,0)}
const oldView=setView;setView=function(mode){oldView(mode);if(viewMode==='single'&&items[selectedIndex]?.droppedSeeds?.length){seedSelection=new Set(items[selectedIndex].droppedSeeds);updateSeedButtons()}navigate('garden');syncSeedData()};
const oldSelectSeed=selectSeed;selectSeed=function(k){if(viewMode==='single'&&items[selectedIndex])delete items[selectedIndex].droppedSeeds;oldSelectSeed(k);syncSeedData()};
$('plateView').onclick=()=>setView('plate');$('singleView').onclick=()=>setView('single');$('storyView').onclick=()=>navigate('story');$('filmView').onclick=()=>navigate('film');$('featuredView').onclick=()=>{navigate('featured');renderDisplays()};
// Water grows only a container actually intersected by one of the visible blue jets.
let water=null,waterGhost=null,waterFrame=null;
function growOne(i){
 if(!items[i])return;if(growth[i]){enlargePlant(i);return}plantingRound++;const o=items[i];
 const pool=o.droppedSeeds?.length?o.droppedSeeds:[...seedSelection];
 let seeds=o.droppedSeeds?.length?o.droppedSeeds.slice(-2):[chooseFrom(pool,rng(o.seed^plantingRound))];
 const resolved=[];for(const seed of seeds){let chosen=seed;if(seed==='mixed'){const choices=Object.keys(BOTANY).filter(x=>!resolved.includes(x)&&!seeds.includes(x));chosen=chooseFrom(choices,rng(o.seed^plantingRound^resolved.length*771))}if(!resolved.includes(chosen))resolved.push(chosen)}
 const plans=resolved.map((key,j)=>{const plan=plantPlan(o,key,Math.imul(plantingRound+j*71,2654435761));if(resolved.length===2){
  const saved=random;random=rng(o.seed^0x87a6);const g=geometry(o);random=saved;const soil=plantingSurface(o,g),oldX=plan.root[0],oldY=plan.root[1];plan.root[0]+=(j?1:-1)*plan.span*.48;plan.root[1]=soilAnchorY(o,soil,plan.root[0])??oldY;plan.span*=.5;
  plan.stems=plan.stems.filter((_,index)=>index%2===0);for(const stem of plan.stems){const oldBase=stem.pts[0],baseX=plan.root[0]+oldBase[0]*.5,baseY=soilAnchorY(o,soil,baseX)??plan.root[1];stem.pts=stem.pts.map(([x,y])=>[x*.5,y-oldBase[1]+baseY-plan.root[1]]);stem.profile={...stem.profile,len:stem.profile?.len?stem.profile.len*.87:stem.profile?.len}}
  plan.rosettes=plan.rosettes.slice(0,Math.max(1,Math.ceil(plan.rosettes.length/2)));for(const rosette of plan.rosettes){rosette.x*=.45;rosette.y=(soilAnchorY(o,soil,plan.root[0]+rosette.x)??plan.root[1])-plan.root[1];rosette.r*=.78}
  for(const fruit of plan.fruit){fruit.x*=.5;fruit.r*=.87}
 }return plan});
 const plan=plans.length===1?plans[0]:{plans,species:'mixed',seedType:resolved.join(' + '),duration:Math.max(...plans.map(p=>p.duration))};
 if(viewMode==='single'&&!o.droppedSeeds?.length){o.individualSeed=resolved[0];o.seedChoices=[resolved[0]]}
 growth[i]={plan,progress:0,start:performance.now(),delay:0};if(animationId===null)animationId=requestAnimationFrame(animatePlants);compose();syncSeedData();
}
const drawOnePlant=drawPlant;
const jets=[{x1:-38,y1:12,x2:-58,y2:122},{x1:-36,y1:13.5,x2:-36,y2:134},{x1:-34,y1:15,x2:-11,y2:120}];
function syncSeedData(){canvas.dataset.seedSlots=JSON.stringify(items.map(o=>o.droppedSeeds||[]));canvas.dataset.plants=JSON.stringify(growth.map(g=>g?.plan.seedType||null));}
function addSeedToContainer(i,key){const o=items[i];if(!o)return;let prior=o.droppedSeeds||[];o.droppedSeeds=[...prior.filter(k=>k!==key),key].slice(-2);o.seedChoices=o.droppedSeeds.slice();delete o.individualSeed;if(viewMode==='single'){seedSelection=new Set(o.droppedSeeds);updateSeedButtons()}interact();syncSeedData();canvas.classList.add('seed-received');setTimeout(()=>canvas.classList.remove('seed-received'),260)}

// Opening coordinates use exactly the same scale, yaw and roll as container drawing.
function waterOpeningHit(i,p){
 const o=items[i];if(!o||o.photoShape?.mouth?.visible===false)return false;
 const single=viewMode==='single',size=single?2.35:1.25;
 const origin=single?{x:1000,y:715}:{x:positions[i].x,y:positions[i].y+3.5};
 const sx=size*o.scale*Math.cos(o.view.yaw*Math.PI/180)*.96,sy=size*o.scale;
 if(Math.abs(sx)<.001||Math.abs(sy)<.001)return false;
 const x=(p.x-origin.x)/sx,y=(p.y-origin.y)/sy,a=o.view.roll*Math.PI/180;
 const local={x:x*Math.cos(a)+y*Math.sin(a),y:-x*Math.sin(a)+y*Math.cos(a)};
 const saved=random;random=rng(o.seed^0x87a6);let surface;
 try{const g=geometry(o),a=g.opening;surface=a.rect||openingPoints({...a,rx:a.rx+1.5,ry:a.ry+1.5})}finally{random=saved}
 let inside=false;for(let n=0,j=surface.length-1;n<surface.length;j=n++){
  const [ax,ay]=surface[n],[bx,by]=surface[j];
  if((ay>local.y)!==(by>local.y)&&local.x<(bx-ax)*(local.y-ay)/(by-ay)+ax)inside=!inside;
 }return inside;
}
function waterTargets(x,y,zoom){
 const current=new Set(),box=canvas.getBoundingClientRect();
 for(const jet of jets)for(let step=0;step<=120;step++){
  const t=step/120,clientX=x+((1-t*t)*jet.x1+t*t*jet.x2)*zoom;
  const clientY=y+((1-t)*(1-t)*jet.y1+2*(1-t)*t*50+t*t*jet.y2)*zoom;
  if(clientX<box.left||clientX>box.right||clientY<box.top||clientY>box.bottom)continue;
  const p=canvasPoint({clientX,clientY});
  const i=viewMode==='single'?(layerHit(singleHitLayer,p.x,p.y)?selectedIndex:-1):hitSpecimen(p);
  if(i<0)continue;
  if(waterOpeningHit(i,p))current.add(i);
  // A jet stops at the first visible container: walls and handles block water too.
  break;
 }return current;
}
function waterTick(){if(!water)return;const b=canvas.getBoundingClientRect();if(b.width<=0||b.height<=0){stopWater();return}const zoom=designScale();waterGhost.style.left=(water.x/zoom)+'px';waterGhost.style.top=(water.y/zoom)+'px';for(const i of waterTargets(water.x,water.y,zoom))if(!water.hit.has(i)){water.hit.add(i);growOne(i)}waterFrame=requestAnimationFrame(waterTick);}
function stopWater(){if(!water)return;if(waterFrame!==null)cancelAnimationFrame(waterFrame);waterFrame=null;water=null;waterGhost?.remove();waterGhost=null;waterButton.classList.remove('held');}
waterButton.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();interact();waterButton.setPointerCapture(e.pointerId);water={id:e.pointerId,x:e.clientX,y:e.clientY,hit:new Set()};waterGhost=document.createElement('div');waterGhost.id='waterGhost';waterGhost.innerHTML='<div class="tilted-can">'+canSVG+'</div><svg class="water-jets" viewBox="-80 0 160 120">'+jets.map(j=>`<path class="jet-start" d="M${j.x1} ${j.y1} L${j.x1} ${j.y1+7}"/><path class="falling-jet" d="M${j.x1} ${j.y1+5} Q${j.x1} 50 ${j.x2} ${j.y2}"/>`).join('')+'</svg>';document.body.append(waterGhost);waterButton.classList.add('held');waterTick();};
waterButton.onpointermove=e=>{if(water&&water.id===e.pointerId){water.x=e.clientX;water.y=e.clientY}};waterButton.onpointerup=stopWater;waterButton.onpointercancel=stopWater;waterButton.onlostpointercapture=stopWater;
window.addEventListener('blur',stopWater);
// The same seed selection is honoured in Single Container and on a targeted seed drop.
const oldDown=canvas.onpointerdown;canvas.onpointerdown=e=>{if(screen!=='garden'||viewMode==='single')return;oldDown(e)};
for(const b of document.querySelectorAll('[data-seed]')){let seedDrag=null,seedGhost=null,seedScroll=null,pointerY=0;function endSeedScroll(){if(seedScroll!==null)clearInterval(seedScroll);seedScroll=null}b.onpointerdown=e=>{if(e.button!==0)return;seedDrag={x:e.clientX,y:e.clientY,id:e.pointerId,moved:false};b.setPointerCapture(e.pointerId)};b.onpointermove=e=>{pointerY=e.clientY;if(!seedDrag)return;if(Math.hypot(e.clientX-seedDrag.x,e.clientY-seedDrag.y)>6){seedDrag.moved=true;if(!seedGhost){seedGhost=document.createElement('div');seedGhost.className='seed-ghost';seedGhost.innerHTML=lineIcon(b.dataset.seed);document.body.append(seedGhost);seedScroll=setInterval(()=>{if(pointerY<100)window.scrollBy(0,-22);else if(pointerY>window.innerHeight-70)window.scrollBy(0,22)},32)}const z=designScale();seedGhost.style.left=e.clientX/z-30+'px';seedGhost.style.top=e.clientY/z-30+'px';if(e.clientY<90)window.scrollBy(0,-20);else if(e.clientY>window.innerHeight-60)window.scrollBy(0,20)}};b.onpointerup=e=>{if(!seedDrag)return;endSeedScroll();let moved=seedDrag.moved;seedDrag=null;seedGhost?.remove();seedGhost=null;if(moved){const box=canvas.getBoundingClientRect();if(e.clientX>=box.left&&e.clientX<=box.right&&e.clientY>=box.top&&e.clientY<=box.bottom){const p=canvasPoint(e),i=viewMode==='single'?(layerHit(singleHitLayer,p.x,p.y)?selectedIndex:-1):hitSpecimen(p);if(i>=0){addSeedToContainer(i,b.dataset.seed)}}b.dataset.suppressClick='true';setTimeout(()=>delete b.dataset.suppressClick,0)}if(b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId)};b.addEventListener('click',e=>{if(b.dataset.suppressClick){delete b.dataset.suppressClick;e.stopImmediatePropagation();e.preventDefault()}},true);b.onpointercancel=()=>{endSeedScroll();seedDrag=null;seedGhost?.remove();seedGhost=null};}
// IndexedDB stores images without localStorage's small string quota. A hosted server can share the same gallery.
let dbPromise=null;function db(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('where-habit-takes-root',1);req.onupgradeneeded=()=>req.result.createObjectStore('displays',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise}
async function localList(){const database=await db();return new Promise((resolve,reject)=>{const r=database.transaction('displays').objectStore('displays').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function localSave(entry){const database=await db();return new Promise((resolve,reject)=>{let tx=database.transaction('displays','readwrite');tx.objectStore('displays').put(entry);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
let sharedGallery=false;
async function listDisplays(){try{let r=await fetch('/api/displays',{signal:AbortSignal.timeout(5000)});if(r.ok&&r.headers.get('content-type')?.includes('application/json')){let list=await r.json();sharedGallery=true;return list}}catch(e){}sharedGallery=false;return localList()}
async function saveDisplay(entry){if(location.protocol!=='file:'){let r;try{r=await fetch('/api/displays',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry),signal:AbortSignal.timeout(15000)})}catch(e){}if(r?.ok&&r.headers.get('content-type')?.includes('application/json')){sharedGallery=true;return r.json()}if(r?.ok)r=null;if(r&&r.status!==404&&r.status!==405){let detail=await r.json().catch(()=>({}));throw Error(detail.error||'The display could not be saved. Please try again.')}}await localSave(entry);sharedGallery=false;return entry}
function snapshot(){compose();const image=document.createElement('canvas');image.width=1320;image.height=748;image.getContext('2d').drawImage(canvas,0,0,1320,748);return image.toDataURL('image/png')}
function publicationMode(done){$('titleForm').hidden=done;$('publishBack').hidden=done;$('publishedMessage').hidden=!done;$('publishedTitle').hidden=!done;$('downloadDisplay').hidden=!done;}
$('export').onclick=()=>{stopWater();pendingSnapshot=snapshot();$('publishPreview').src=pendingSnapshot;$('gardenTitle').value='';$('publishError').textContent='';publicationMode(false);navigate('publish');$('gardenTitle').focus()};$('publishBack').onclick=()=>navigate('garden');
$('gardenTitle').onkeydown=e=>{if(e.key==='Enter')publishAction.click()};
publishAction.onclick=async()=>{const title=$('gardenTitle').value.trim();if(!title){$('publishError').textContent='Please add a title.';$('gardenTitle').focus();return}publishAction.disabled=true;$('publishError').textContent='';try{let entry={id:crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2),title,image:pendingSnapshot,createdAt:new Date().toISOString()};currentDisplay=await saveDisplay(entry);showDisplay(currentDisplay,true)}catch(e){$('publishError').textContent=e.message||'Unable to save. Please try again.'}finally{publishAction.disabled=false}};
function showDisplay(entry,justPublished=false){currentDisplay=entry;$('publishPreview').src=entry.image;$('publishedTitle').textContent=entry.title;publicationMode(true);$('publishedMessage').hidden=!justPublished;navigate('complete')}
$('downloadDisplay').setAttribute('aria-label','Download garden image');
$('downloadDisplay').onclick=()=>{if(!currentDisplay)return;const a=document.createElement('a');a.href=currentDisplay.image;a.download=(currentDisplay.title.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,60)||'my-garden')+'.png';a.click()};
newAction.onclick=()=>{clearGarden();ui.seed.value=Math.floor(Math.random()*4294967296);generate();hasInteracted=false;seedSelection=new Set(['mixed']);homeSeedSelection=new Set(['mixed']);updateSeedButtons();setView('plate')};
async function renderDisplays(){const grid=$('displayGrid');grid.replaceChildren();$('galleryStatus').textContent='Loading…';$('galleryEmpty').hidden=true;try{const list=await listDisplays();list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));for(const entry of list){const card=document.createElement('button');card.className='display-card';const img=document.createElement('img');img.src=entry.image;img.alt=entry.title;img.loading='lazy';const title=document.createElement('span');title.textContent=entry.title;card.append(img,title);card.onclick=()=>showDisplay(entry);grid.append(card)}$('galleryEmpty').hidden=!!list.length;$('galleryStatus').textContent=sharedGallery?'':'Displays are saved in this browser.';}catch(e){$('galleryStatus').textContent='Unable to load saved displays. Please try again.'}}
// Public test hooks expose behavior and state, never credentials.
const backIcon='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8L10 13"/></svg><span>Back</span>';for(const id of ['back','allTypes','publishBack']){const b=$(id);b.innerHTML=backIcon;b.classList.add('arrow-back');b.setAttribute('aria-label','Back')}
window.GardenApp={navigate,growOne,snapshot,listDisplays,saveDisplay,getScreen:()=>screen,addSeedToContainer,getState:()=>({items:items.length,grown:growth.map((g,i)=>g?i:null).filter(i=>i!==null),viewMode}),waterJets:jets,waterOpeningHit,waterTargets};

function placeVector(el,key,labelText){el.innerHTML=design[key];el.setAttribute('aria-label',labelText||key);const svg=el.querySelector('svg');svg.classList.add('design-vector')}
placeVector($('siteTitle'),'brand','Where Habits Take Root — return to garden');$('siteTitle').setAttribute('role','button');$('siteTitle').tabIndex=0;$('siteTitle').onclick=()=>{stopWater();setView('plate')};$('siteTitle').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('siteTitle').click()}};placeVector($('plateView'),'garden','Build My Garden');placeVector($('featuredView'),'featured','Featured Displays');placeVector($('storyView'),'story','Story');placeVector($('filmView'),'film','Film');placeVector($('export'),'save','Save');
$('singleView').hidden=true;$('singleView').classList.add('removed-action');
$('canvasTools').insertBefore($('new'),$('clearGarden'));$('new').classList.add('recreate-tool');placeVector($('new'),'reset-plant','Drag a container here to reset its plants');placeVector($('clearGarden'),'clear','Clear');placeVector($('trash'),'trash','Delete container by dragging it here');placeVector($('howToPlay'),'how-framed','How to Play');placeVector(waterButton,'can','Drag watering can to water containers');
for(const [selector,key,labelText]of [['#collectedSection h2','collected','My Collected Containers'],['#seedTab','seed-tab','Choose My Seeds'],['#otherTab','other-tab','Other Containers'],['#previous','previous','Previous container'],['#next','next','Next container'],['#back','back','Back'],['#allTypes','back','Back'],['#publishBack','back','Back'],['#downloadDisplay','download','Download garden image']])placeVector(document.querySelector(selector),key,labelText);
placeVector(publishAction,'publish','Publish');placeVector(newAction,'new-one','Create a New One');placeVector(more,'more','Click to get more');placeVector($('closeHelp'),'close','Close instructions');placeVector($('closeUpload'),'close','Close');
// Preserve the original upload arrow independently of its editable label.
const oldCollection=renderCollection;renderCollection=function(){oldCollection();const tile=document.querySelector('.upload-tile');if(tile){placeVector(tile,'upload-tile','Upload My Container');tile.insertAdjacentHTML('beforeend','<span class="upload-label">Upload<br>My<br>Container</span>')}};
$('publishPage').classList.add('publication-layout');
$('gardenTitle').placeholder='Title';
const originalPublicationMode=publicationMode;publicationMode=function(done){originalPublicationMode(done);publishPage.classList.toggle('completed',done)};
for(const b of document.querySelectorAll('[data-seed]')){b.classList.add('bold-seed');b.setAttribute('aria-label',seedNames[b.dataset.seed]);const caption=b.querySelector('.seed-name');if(caption&&design['seed-'+b.dataset.seed])caption.innerHTML=design['seed-'+b.dataset.seed];}
// Keep concrete container choices, independently of editable uploaded containers.
function rememberContainer(o){
 if(!o)return;
 const saved=JSON.parse(JSON.stringify(o));
 for(const k of ['historyId','collectionId','droppedSeeds','seedChoices','individualSeed','_historyKey'])delete saved[k];
 const signature=JSON.stringify(saved),key=o.historyId||o.collectionId||o._historyKey||signature;
 const prior=historyContainers.find(h=>h.historyId===o.historyId&&o.historyId||h._historyKey===key||(()=>{let v={...h};delete v.historyId;delete v._historyKey;return JSON.stringify(v)===signature})());
 saved.historyId=prior?.historyId||'history-'+(crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
 saved._historyKey=prior?._historyKey||key;
 historyContainers=historyContainers.filter(h=>h!==prior);historyContainers.push(saved);historyContainers=historyContainers.slice(-12);
 saveHistory();renderHistory();
}
const addChosenContainer=addToGarden;
addToGarden=function(o,p){const prior=preserveGardenScroll;preserveGardenScroll=true;try{rememberContainer(o);addChosenContainer(o,p);syncSeedData()}finally{preserveGardenScroll=prior}};
const selectGardenContainer=canvas.onpointerdown;
canvas.onpointerdown=function(e){selectGardenContainer(e);if(e.button===0&&drag)rememberContainer(items[drag.index])};

// Reset affects only the dragged container; preserve its type, appearance and placement.
const resetPlantButton=$('new');resetPlantButton.id='resetPlant';resetPlantButton.classList.remove('recreate-tool');
resetPlantButton.onclick=()=>notice('Drag a container here to remove its plants and choose new seeds.');
// Recreate and Reset Plant have separate identities and actions.
const recreateButton=document.createElement('button');recreateButton.id='new';recreateButton.className='recreate-tool';main.append(recreateButton);
function resetContainerPlant(i){
 if(!items[i])return;
 growth[i]=null;
 for(const k of ['droppedSeeds','seedChoices','individualSeed'])delete items[i][k];
 if(viewMode==='single'){seedSelection=new Set(['mixed']);updateSeedButtons()}
 compose();syncSeedData();
}
function overResetPlant(e){const b=resetPlantButton.getBoundingClientRect();return e.clientX>=b.left-10&&e.clientX<=b.right+10&&e.clientY>=b.top-10&&e.clientY<=b.bottom+10}
const moveContainer=canvas.onpointermove;
canvas.onpointermove=e=>{moveContainer(e);resetPlantButton.classList.toggle('over',!!drag&&overResetPlant(e))};
const finishGardenPointer=finishPointer;
finishPointer=function(e,cancel=false){
 resetPlantButton.classList.remove('over');
 if(drag&&drag.id===e.pointerId&&drag.moved&&!cancel&&overResetPlant(e)){
  const d=drag;positions[d.index]=d.origin||positions[d.index];drag=null;
  canvas.classList.remove('dragging');$('trash').classList.remove('over');
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  resetContainerPlant(d.index);updateCursor(lastHover);return;
 }
 finishGardenPointer(e,cancel);
};
canvas.addEventListener('lostpointercapture',()=>resetPlantButton.classList.remove('over'));

// Subsequent watering grows the existing plan, never rerolls its species or geometry.
function plantSize(plan,now=performance.now()){
 const b=plan.waterBoost;if(!b)return plan.waterSize||1;
 const t=clamp((now-b.start)/b.duration);return b.from+(b.to-b.from)*smooth(t);
}
function enlargePlant(i){
 const g=growth[i];if(!g)return;
 const plan=g.plan,now=performance.now(),from=plantSize(plan,now),to=Math.min(1.42,(plan.waterBoost?.to||plan.waterSize||1)+.07);
 if(to<=from)return;
 plan.waterBoost={from,to,start:now,duration:650};
 if(animationId===null)animationId=requestAnimationFrame(animatePlants);
}
const boostPlanCache=new WeakMap();
function enlargedPlan(plan,size){
 if(size<=1.0001)return plan;
 const old=boostPlanCache.get(plan);if(old&&old.size===size)return old.plan;
 const grown={...plan};
 grown.stems=(plan.stems||[]).map(stem=>{const y0=stem.pts[0][1];return{...stem,pts:stem.pts.map(([x,y])=>[x,y0+(y-y0)*size]),profile:{...stem.profile,len:stem.profile?.len?stem.profile.len*Math.sqrt(size):stem.profile?.len}}});
 grown.rosettes=(plan.rosettes||[]).map(r=>({...r,r:r.r*size}));
 grown.fruit=(plan.fruit||[]).map(f=>{
  let nearest=null,distance=Infinity;for(const stem of plan.stems||[])for(const [x,y]of stem.pts){const d=(x-f.x)**2+(y-f.y)**2;if(d<distance){distance=d;nearest=stem}}
  const y0=nearest?.pts[0][1]||0;return{...f,y:y0+(f.y-y0)*size,r:f.r*Math.sqrt(size)};
 });
 boostPlanCache.set(plan,{size,plan:grown});return grown;
}
drawPlant=function(o,p,t,x,y,scale){const size=plantSize(p);if(p.plans)for(const sub of p.plans)drawOnePlant(o,enlargedPlan(sub,size),t,x,y,scale);else drawOnePlant(o,enlargedPlan(p,size),t,x,y,scale)};
const animateOriginalPlants=animatePlants;
animatePlants=function(now){
 animateOriginalPlants(now);let active=false;
 for(const g of growth){const plan=g?.plan,b=plan?.waterBoost;if(!b)continue;if(now-b.start>=b.duration){plan.waterSize=b.to;delete plan.waterBoost}else active=true}
 if(active&&animationId===null)animationId=requestAnimationFrame(animatePlants);
};

// The supplied guide is outlined vector artwork, including all five steps and icons.
helpPanel.querySelector('div').innerHTML=design['help-guide'];
helpPanel.querySelector('div').className='guide-artwork';
const guideDescription=document.createElement('p');guideDescription.className='sr-only';guideDescription.textContent='Choose containers from Other Containers or upload a photo. Drag unwanted containers to the bin, or use Clear to empty the garden. Rearrange containers. Click a seed to select one plant type, or drag seeds into individual containers. Click a container to bring it to the front. Drag the watering can so its blue water reaches the container opening to grow the selected plant; water again to enlarge the same plants. Drag a container onto Reset Plant to remove its plants and choose new seeds. Save and publish your garden.';helpPanel.append(guideDescription);
function showInstructions(focus=true){stopWater();helpPanel.hidden=false;help.setAttribute('aria-expanded','true');if(focus)$('closeHelp').focus({preventScroll:true})}
$('plateView').onclick=()=>{setView('plate');showInstructions()};
$('siteTitle').onclick=()=>{setView('plate');showInstructions()};
Object.assign(window.GardenApp,{resetContainerPlant,enlargePlant,rememberContainer,getHistory:()=>JSON.parse(JSON.stringify(historyContainers)),getPlantState:i=>growth[i]?{species:growth[i].plan.seedType,seed:growth[i].plan.seed,size:plantSize(growth[i].plan),target:growth[i].plan.waterBoost?.to||growth[i].plan.waterSize||1}:null});
syncSeedData();

/* Catalogue layout and interactions. */
// Three catalogues share the first panel below the drawing canvas.
const collected74=renderCollection;renderCollection=function(){collected74();const tile=document.querySelector('.upload-tile'),bin=$('collectionTrash');if(tile&&bin){const pack=document.createElement('div');pack.className='upload-controls';tile.parentNode.insertBefore(pack,tile);pack.append(tile,bin)}if($('historyList'))renderHistory()};
const chooser=$('chooserSection'),tabs=$('chooserTabs');
document.body.insertBefore(chooser,$('collectedSection'));
const historyTab=document.createElement('button');historyTab.id='historyTab';
placeVector(historyTab,'history-tab','History');
const divider1=document.createElement('span'),divider2=document.createElement('span');
divider1.className=divider2.className='tab-divider';divider1.setAttribute('aria-hidden','true');divider2.setAttribute('aria-hidden','true');
tabs.replaceChildren($('otherTab'),divider1,$('seedTab'),divider2,historyTab,$('allTypes'));
const historyPanel=document.createElement('section');historyPanel.id='historySection';historyPanel.hidden=true;
const historyList=document.createElement('div');historyList.id='historyList';historyList.className='catalogue';historyPanel.append(historyList);chooser.append(historyPanel);
historyContainers=historyContainers.slice(-12);saveHistory();
function renderHistory(){historyList.replaceChildren();for(const o of [...historyContainers].reverse())historyList.append(card(o,true))}
renderHistory();
const catalogueOrder=['kettle','cookware','enamelVase','paintBucket','foodBucket','trashBin','clayJar','clayBasin','tyre','ceramicPot','ceramicBowl','foldingBasin','woodBucket','enamelBasin','toilet','foamBox','plasticBasket','detergentBottle','bambooContainer','milkTin','biscuitTin','waterJug','coconutShell','yoghurtTub'];
showTypes=function(){
 activeVariant=null;const el=$('otherList');el.replaceChildren();
 catalogueOrder.forEach((type,i)=>{let o=makeContainer(19000+i*743,type);
  if(type==='cookware'){o.structure.cookware='wok';o.structure.w=82;o.structure.h=35;o.structure.bottom=.45}
  if(type==='detergentBottle'){o.transformation.cut='none';o.transformation.cutFraction=0;o.transformation.cutAngle=0;o.structure.bottleKind='detergent';o.handle=true}
  el.append(card(o));
 });updateChooser();
};
let variantShuffleRound=0;
showVariants=function(type){
 chooserPage='containers';activeVariant=type;const el=$('otherList');el.replaceChildren();
 const specimens=Array.from({length:24},(_,i)=>makeContainer(62000+i*439,type));
 if(['kettle','clayBasin','clayJar','foldingBasin','coconutShell','biscuitTin','ceramicBowl','ceramicPot'].includes(type)){const shuffle=rng((Date.now()^++variantShuffleRound)>>>0);for(let i=specimens.length-1;i>0;i--){let j=Math.floor(shuffle()*(i+1));[specimens[i],specimens[j]]=[specimens[j],specimens[i]]}}
 specimens.forEach(o=>el.append(card(o,true)));
 updateChooser();chooser.scrollIntoView({behavior:'smooth',block:'start'});
};
updateChooser=function(){
 const single=viewMode==='single';if(single)chooserPage='seeds';
 $('seedsSection').hidden=chooserPage!=='seeds';$('otherSection').hidden=single||chooserPage!=='containers';historyPanel.hidden=single||chooserPage!=='history';
 for(const [el,page]of [[$('otherTab'),'containers'],[$('seedTab'),'seeds'],[historyTab,'history']]){
  el.classList.toggle('active',chooserPage===page);el.setAttribute('aria-selected',String(chooserPage===page));el.setAttribute('role','tab');
 }
 tabs.setAttribute('role','tablist');tabs.classList.toggle('variant',chooserPage==='containers'&&activeVariant!==null);
 $('allTypes').hidden=single||chooserPage!=='containers'||activeVariant===null;
 more.hidden=single||chooserPage!=='containers'||activeVariant!==null;
};
$('otherTab').onclick=()=>{chooserPage='containers';showTypes()};
$('seedTab').onclick=()=>{chooserPage='seeds';updateChooser()};
historyTab.onclick=()=>{chooserPage='history';renderHistory();updateChooser()};
$('allTypes').onclick=()=>{chooserPage='containers';showTypes()};

// Independent onboarding hints: only their matching actions dismiss them.
let gardenOrganised=false,waterUsed=false;
interact=function(){hasInteracted=true};
const dragHint=$('dragHint');placeVector(dragHint,'drag-organise','Drag it to organise');
const waterHint=document.createElement('div');waterHint.id='waterHint';placeVector(waterHint,'water-hint','Drag it to water your plants');main.append(waterHint);
function updateHints(){
 const plate=screen==='garden'&&viewMode==='plate';dragHint.hidden=!plate||gardenOrganised||items.length<3;waterHint.hidden=!plate||waterUsed;
 if(!dragHint.hidden&&objectHitLayers[2]){
  const layer=objectHitLayers[2],px=layer.getContext('2d').getImageData(0,0,layer.width,layer.height).data;
  let top=layer.height;for(let y=0;y<layer.height&&top===layer.height;y++)for(let x=0;x<layer.width;x++)if(px[(y*layer.width+x)*4+3]>45){top=y;break}
  dragHint.style.left=(positions[2].x*1320/canvas.width-88)+'px';
  dragHint.style.top=Math.max(10,(positions[2].y-182.5+top)*748/canvas.height-82)+'px';
 }
}
const down74=canvas.onpointerdown;
canvas.onpointerdown=e=>{if(viewMode==='single')return;down74(e)};
const move74=canvas.onpointermove;
canvas.onpointermove=e=>{move74(e);if(viewMode==='single'){canvas.style.cursor='default';return}if(drag?.moved){gardenOrganised=true;dragHint.hidden=true}};
const cursor74=updateCursor;updateCursor=e=>{if(viewMode==='single'){canvas.style.cursor='default';return}cursor74(e)};
const waterDown74=waterButton.onpointerdown;
waterButton.onpointerdown=e=>{if(e.button!==0)return;waterUsed=true;waterHint.hidden=true;waterDown74(e)};

// Restore Recreate alongside Reset Plant, without using reset to reroll the garden.
$('canvasTools').insertBefore(recreateButton,resetPlantButton);
placeVector(recreateButton,'recreate-frame','Recreate');recreateButton.insertAdjacentHTML('beforeend','<span>Recreate</span>');
recreateButton.onclick=()=>{stopWater();gardenOrganised=false;hasInteracted=false;viewMode='plate';ui.seed.value=Math.floor(Math.random()*4294967296);generate();setView('plate');updateHints()};
resetPlantButton.onclick=()=>{if(viewMode==='single'&&items[selectedIndex]){resetContainerPlant(selectedIndex);rememberContainer(items[selectedIndex])}};
const grow74=growOne;growOne=function(i){grow74(i);if(items[i])rememberContainer(items[i])};
const addSeed74=addSeedToContainer;
addSeedToContainer=function(i,key){addSeed74(i,key);if(!items[i])return;rememberContainer(items[i]);if(viewMode==='single'){growth[i]=null;growOne(i)}};

// Dismiss only after a scroll reaches the garden bottom during this page visit.
const scrollPrompt=document.createElement('div');scrollPrompt.id='scrollPrompt';scrollPrompt.hidden=true;placeVector(scrollPrompt,'scroll-down','Scroll down');document.body.append(scrollPrompt);
let reachedGardenBottom=false,introActive=true;
function pageAtBottom(){return window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-3}
function updateScrollPrompt(){scrollPrompt.hidden=screen!=='garden'||introActive||reachedGardenBottom}
window.addEventListener('scroll',()=>{
 if(screen!=='garden'||introActive||reachedGardenBottom)return;
 if(pageAtBottom()){reachedGardenBottom=true;updateScrollPrompt()}
},{passive:true});
const navigate74=navigate;
navigate=function(next){navigate74(next);$('canvasTools').hidden=next!=='garden';recreateButton.hidden=next!=='garden'||viewMode==='single';updateHints();updateScrollPrompt()};
const setView74=setView;setView=function(mode){setView74(mode);updateHints()};
Object.assign(window.GardenApp,{navigate,growOne,addSeedToContainer,rememberContainer,getHistory:()=>JSON.parse(JSON.stringify(historyContainers)),getCatalogueOrder:()=>catalogueOrder.slice()});
// Each gallery keeps its own index. Edge clones make previous/next wrap by one frame.
function initialiseStoryGalleries(){
 return Array.from(document.querySelectorAll('.story-slider')).map(figure=>{
  const viewport=figure.querySelector('.story-slider-viewport'),track=figure.querySelector('.story-slider-track');
  const photos=Array.from(track.querySelectorAll('.story-slide')),dots=Array.from(figure.querySelectorAll('.story-slider-dot')),count=photos.length;
  let position=1,busy=false,timer=null,pending=null;
  const clone=photo=>{const img=document.createElement('img');img.className='story-slide';img.src=photo.getAttribute('src');img.alt='';img.setAttribute('aria-hidden','true');img.decoding='async';return img};
  track.prepend(clone(photos[count-1]));track.append(clone(photos[0]));
  const current=()=>((position-1)%count+count)%count;
  function label(){const index=current();figure.dataset.index=String(index);dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));photos.forEach((img,i)=>img.setAttribute('aria-hidden',String(i!==index)));figure.querySelector('.story-slider-status').textContent=`Photograph ${index+1} of ${count}`;photos[index].loading='eager'}
  function snap(){track.style.transition='none';track.style.transform=`translateX(${-position*100}%)`;void track.offsetWidth;track.style.transition=''}
  function finish(){if(!busy)return;busy=false;clearTimeout(timer);timer=null;if(position===0)position=count;else if(position===count+1)position=1;snap();const next=pending;pending=null;if(next)change(next)}
  function change(action){
   if(busy){pending=action;return}
   if(action.index!==undefined){const index=Math.max(0,Math.min(count-1,action.index));if(index===current())return;position=index+1}
   else position+=action.delta<0?-1:1;
   label();busy=true;track.style.transform=`translateX(${-position*100}%)`;
   if(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)finish();else timer=setTimeout(finish,410);
  }
  track.addEventListener('transitionend',e=>{if(e.target===track&&e.propertyName==='transform')finish()});
  const direction=e=>{const box=viewport.getBoundingClientRect();return e.clientX<box.left+box.width/2?-1:1};
  viewport.onpointermove=e=>{viewport.dataset.direction=direction(e)<0?'previous':'next'};
  viewport.onpointerenter=viewport.onpointermove;
  viewport.onclick=e=>change({delta:e.detail===0?1:direction(e)});
  viewport.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change({delta:e.key==='ArrowLeft'?-1:1})}};
  dots.forEach((dot,index)=>{dot.onclick=()=>change({index})});
  snap();label();return {index:current,count};
 });
}
const storyGalleryControllers=initialiseStoryGalleries();
function setPadletUrl(value){
 const link=$('storyShareLink');$('storyShareStatus').textContent='';let url=null;
 try{const parsed=new URL(value);if(parsed.protocol==='https:')url=parsed.href}catch(e){}
 link.setAttribute('href',url||'#');link.setAttribute('aria-disabled',String(!url));
 if(url){link.setAttribute('target','_blank');link.setAttribute('rel','noopener noreferrer')}
 link.onclick=e=>{if(!url){e.preventDefault();$('storyShareStatus').textContent='The sharing link is unavailable. Please try again.'}};
 return !!url;
}
setPadletUrl(siteConfig?.padletUrl||$('storyShareLink').getAttribute('href'));
Object.assign(window.GardenApp,{getStoryGalleryIndices:()=>storyGalleryControllers.map(g=>g.index()),setPadletUrl,getSelectedSeeds:()=>[...seedSelection]});

// Show the dedication on every page load, then introduce the existing game guide.
function startGardenIntro(){
 const intro=$('gardenIntro');
 const html=document.documentElement,previousOverflow=html.style.overflow,previousGutter=html.style.scrollbarGutter;
 // Remove the reserved scrollbar strip for the opening screen only.
 html.style.scrollbarGutter='auto';html.style.overflow='hidden';
 const blocked=Array.from(document.body.children).filter(el=>el!==intro);
 const previousInert=blocked.map(el=>el.inert);
 blocked.forEach(el=>{el.inert=true});
 const fit=()=>{
  // Explicit viewport pixels compensate for the garden's body zoom, including scrollbar changes.
  const zoom=Number(document.body.style.zoom)||1;
  intro.style.width=(window.innerWidth/zoom)+'px';
  intro.style.height=(window.innerHeight/zoom)+'px';
 };
 fit();window.addEventListener('resize',fit);
 let leaving=false,finished=false,cleanupTimer=null,revealTimer=null;
 // Keep the garden prompt hidden while the dedication covers the page.
 introActive=true;updateScrollPrompt();
 const finish=()=>{
  if(finished)return;finished=true;
  if(cleanupTimer!==null)clearTimeout(cleanupTimer);if(revealTimer!==null)clearTimeout(revealTimer);
  intro.removeEventListener('transitionend',onTransitionEnd);
  intro.hidden=true;html.style.overflow=previousOverflow;html.style.scrollbarGutter=previousGutter;fitDesign();
  blocked.forEach((el,i)=>{el.inert=previousInert[i]});
  window.removeEventListener('resize',fit);
  $('closeHelp').focus({preventScroll:true});introActive=false;updateScrollPrompt();
 };
 const onTransitionEnd=e=>{if(leaving&&e.target===intro&&e.propertyName==='opacity')finish()};
 intro.addEventListener('transitionend',onTransitionEnd);
 intro.onclick=e=>{
  e.preventDefault();e.stopPropagation?.();if(leaving)return;leaving=true;
  // Prepare the guide in this click, never in a delayed cleanup callback.
  showInstructions(false);introActive=false;updateScrollPrompt();
  intro.classList.remove('intro-visible');intro.classList.add('intro-leaving');
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){finish();return}
  // Only unlock/remove the fading cover here; guide visibility never waits for this timer.
  cleanupTimer=setTimeout(finish,220);
 };
 intro.focus({preventScroll:true});
 // Give the transparent initial state a paint before starting its transition.
 revealTimer=setTimeout(()=>{revealTimer=null;if(!leaving)intro.classList.add('intro-visible')},50);
}
chooserPage='containers';showTypes();renderCollection();updateChooser();navigate('garden');
// Resolve local UI font metrics before revealing the first usable layout.
if(document.fonts?.load)await Promise.all([document.fonts.load('500 21px Quicksand'),document.fonts.load('700 21px Quicksand')]).catch(()=>[]);
startGardenIntro();document.documentElement.dataset.ready='true';
})().catch(error=>{console.error(error);document.documentElement.dataset.ready='error'});
