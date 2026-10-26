(() => {
 const windowElement=document.querySelector('.ambience-backdrop');if(!windowElement)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),button=document.querySelector('.ambient-toggle');
 let paused=reduce.matches||Boolean(navigator.connection?.saveData),frame=0;
 let renderer=null,visible=true,artwork,rainLoading=false;
 const credit=document.createElement('a');credit.className='ambient-credit';credit.href='./assets/ambience/rain/NOTICE.txt';credit.target='_blank';credit.rel='noopener';credit.textContent='雨效：rocksdanister / BigWings';credit.title='CC BY-NC-SA 3.0 · 非商業使用';document.querySelector('.ambient-controls').append(credit);
 async function enableRain(){
  if(renderer||rainLoading||!artwork||reduce.matches||(navigator.connection?.saveData&&paused))return;
  rainLoading=true;try{const module=await import('./rain-renderer.js');renderer=await module.createRainRenderer(windowElement,artwork)}catch{windowElement.dataset.rain='fallback'}finally{rainLoading=false;updateButton()}
 }
 function updateButton(){document.body.toggleAttribute('data-ambience-paused',paused||document.hidden||reduce.matches);button.textContent=paused?'播放動態':'暫停動態';button.setAttribute('aria-pressed',String(!paused));renderer?.setRunning(!paused&&!document.hidden&&!reduce.matches&&visible);button.disabled=reduce.matches;if(reduce.matches)button.textContent='已減少動態';else if(windowElement.dataset.rain==='fallback'){button.textContent='使用靜態背景';button.disabled=true;button.setAttribute('aria-pressed','false')}}
 windowElement.addEventListener('ambience-fallback',updateButton);
 button.onclick=()=>{paused=!paused;if(!paused)enableRain().catch(()=>{});updateButton()};document.addEventListener('visibilitychange',updateButton);
 reduce.addEventListener('change',()=>{paused=reduce.matches;if(!paused)enableRain().catch(()=>{});updateButton()});updateButton();
 function updateScroll(){
  frame=0;const progress=Math.min(1,Math.max(0,scrollY/Math.max(innerHeight*.85,1)));
  document.documentElement.style.setProperty('--ambience-opacity',String(.95-progress*.5));
  document.documentElement.style.setProperty('--ambience-dim',String(.25+progress*.47));
  document.documentElement.style.setProperty('--reading-surface',String(.58+progress*.34));
  visible=progress<1;renderer?.setRunning(!paused&&!document.hidden&&!reduce.matches&&visible);
 }
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateScroll)},{passive:true});addEventListener('resize',updateScroll);updateScroll();
 function loadArtwork(){
  const image=new Image();image.decoding='async';image.fetchPriority='low';
  const url=innerWidth<=1024?'./assets/ambience/rain-window-small.webp':'./assets/ambience/rain-window.webp';
  image.onload=()=>{document.documentElement.style.setProperty('--ambience-image','url("'+new URL(url,location.href).href+'")');artwork=image;enableRain().catch(()=>{})};
  image.src=url;
 }
 const start=()=>setTimeout(loadArtwork,0);
 if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();
