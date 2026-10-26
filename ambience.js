(() => {
 const windowElement=document.querySelector('.ambience-backdrop');if(!windowElement)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),button=document.querySelector('.ambient-toggle');
 let paused=reduce.matches||Boolean(navigator.connection?.saveData),frame=0;
 const opening=document.querySelector('.scene-opening');
 let renderer=null,artwork,rainLoading=false,artworkRequest=0,effect='rain';
 const sceneButton=document.createElement('button');sceneButton.type='button';sceneButton.className='ambient-toggle ambient-scene';sceneButton.disabled=true;sceneButton.textContent='載入場景';document.querySelector('.ambient-controls').prepend(sceneButton);
 const credit=document.createElement('a');credit.className='ambient-credit';credit.href='./assets/ambience/rain/NOTICE.txt';credit.target='_blank';credit.rel='noopener';credit.textContent='雨效：rocksdanister / BigWings';credit.title='CC BY-NC-SA 3.0 · 非商業使用';document.querySelector('.ambient-controls').append(credit);
 async function enableRain(){
  if(effect!=='rain'||renderer||rainLoading||!artwork||reduce.matches||(navigator.connection?.saveData&&paused))return;
  rainLoading=true;const source=artwork;try{const module=await import('./rain-renderer.js');const created=await module.createRainRenderer(windowElement,source);if(source!==artwork||effect!=='rain'){created?.dispose()}else renderer=created}catch{windowElement.dataset.rain='fallback'}finally{rainLoading=false;updateButton();if(source!==artwork)enableRain().catch(()=>{})}
 }
 function updateButton(){document.body.toggleAttribute('data-ambience-paused',paused||document.hidden||reduce.matches);button.textContent=paused?'播放動態':'暫停動態';button.setAttribute('aria-pressed',String(!paused));renderer?.setRunning(!paused&&!document.hidden&&!reduce.matches);button.disabled=reduce.matches;if(reduce.matches)button.textContent='已減少動態';else if(effect==='rain'&&windowElement.dataset.rain==='fallback'){button.textContent='使用靜態背景';button.disabled=true;button.setAttribute('aria-pressed','false')}}
 windowElement.addEventListener('ambience-fallback',updateButton);
 button.onclick=()=>{paused=!paused;if(!paused)enableRain().catch(()=>{});updateButton()};document.addEventListener('visibilitychange',updateButton);
 reduce.addEventListener('change',()=>{paused=reduce.matches;if(!paused)enableRain().catch(()=>{});updateButton()});updateButton();
 function updateScroll(){
  frame=0;
  const box=opening.getBoundingClientRect(),distance=opening.offsetHeight*.85;
  const progress=Math.min(1,Math.max(0,scrollY/Math.max(distance,1))),ease=progress*progress*(3-2*progress);
  const bounds={top:Math.max(0,box.top),left:Math.max(0,box.left),right:Math.max(0,innerWidth-box.right),bottom:Math.max(0,innerHeight-box.bottom)};
  for(const [edge,value] of Object.entries(bounds))windowElement.style[edge]=(value*(1-ease))+'px';
  windowElement.style.borderRadius=(18*(1-ease))+'px';
  document.documentElement.style.setProperty('--ambience-opacity',String(1-progress*.28));
  document.documentElement.style.setProperty('--ambience-dim',String(progress*.35));
  document.documentElement.style.setProperty('--reading-surface',String(.6+progress*.2));
  const main=document.querySelector('.main');main.style.setProperty('--opening-end',(opening.offsetTop+opening.offsetHeight-main.offsetTop+24)+'px');
  renderer?.setRunning(!paused&&!document.hidden&&!reduce.matches);
 }
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateScroll)},{passive:true});addEventListener('resize',updateScroll);updateScroll();
 async function loadArtwork(requestedScene){
  const {currentAmbienceScene,nextAmbienceScene,sceneDetails}=await import('./scripts/ambience-scenes.mjs?v=3');
  const scene=requestedScene||currentAmbienceScene(window.DASHBOARD_DATA),request=++artworkRequest;
  sceneButton.disabled=true;
  sceneButton.onclick=()=>loadArtwork(nextAmbienceScene(windowElement.dataset.scene)).catch(()=>{});
  const image=new Image();image.decoding='async';image.fetchPriority='low';
  const url='./assets/ambience/'+scene+(innerWidth<=1024?'-small':'')+'.webp';
  image.onload=()=>{if(request!==artworkRequest)return;renderer?.dispose();renderer=null;windowElement.dataset.scene=scene;effect=sceneDetails[scene].effect;windowElement.dataset.effect=effect;credit.hidden=effect!=='rain';delete windowElement.dataset.rain;sceneButton.disabled=false;sceneButton.textContent=sceneDetails[scene].label+' · 換個場景';sceneButton.setAttribute('aria-label','目前場景：'+sceneDetails[scene].label+'，點選切換');document.documentElement.style.setProperty('--ambience-image','url("'+new URL(url,location.href).href+'")');artwork=image;updateButton();enableRain().catch(()=>{})};
  image.onerror=()=>{if(request!==artworkRequest)return;sceneButton.disabled=false;sceneButton.textContent='場景載入失敗 · 重試';sceneButton.onclick=()=>loadArtwork(scene).catch(()=>{})};
  image.src=url;
 }
 const start=()=>setTimeout(()=>loadArtwork().catch(()=>{}),0);
 if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();
