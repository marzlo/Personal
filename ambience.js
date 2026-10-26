(() => {
 const windowElement=document.querySelector('.ambient-window');if(!windowElement)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),button=windowElement.querySelector('.ambient-toggle');
 let paused=reduce.matches||Boolean(navigator.connection?.saveData),frame=0;
 const rain=document.createElement('div');rain.className='ambience-rain';rain.setAttribute('aria-hidden','true');
 for(let i=0;i<18;i++){
  const drop=document.createElement('span');drop.className='ambience-drop';
  drop.style.setProperty('--drop-x',((i*37+11)%100)+'%');drop.style.setProperty('--drop-length',(28+(i*13)%54)+'px');
  drop.style.setProperty('--drop-duration',(5+(i*7)%8)+'s');drop.style.setProperty('--drop-delay',(-i*.81)+'s');rain.append(drop);
 }
 windowElement.prepend(rain);
 function updateButton(){document.body.toggleAttribute('data-ambience-paused',paused||document.hidden||reduce.matches);button.textContent=paused?'播放動態':'暫停動態';button.setAttribute('aria-pressed',String(!paused));button.disabled=reduce.matches;if(reduce.matches)button.textContent='已減少動態'}
 button.onclick=()=>{paused=!paused;updateButton()};document.addEventListener('visibilitychange',updateButton);
 reduce.addEventListener('change',()=>{paused=reduce.matches;updateButton()});updateButton();
 function updateScroll(){
  frame=0;const progress=Math.min(1,Math.max(0,scrollY/(windowElement.offsetTop+windowElement.offsetHeight)));
  document.documentElement.style.setProperty('--ambience-opacity',String(.9-progress*.74));
  document.documentElement.style.setProperty('--ambience-dim',String(.15+progress*.7));
 }
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateScroll)},{passive:true});addEventListener('resize',updateScroll);updateScroll();
 function loadArtwork(){
  const image=new Image();image.decoding='async';image.fetchPriority='low';
  const url=innerWidth<=1024?'./assets/ambience/rain-window-small.webp':'./assets/ambience/rain-window.webp';
  image.onload=()=>document.documentElement.style.setProperty('--ambience-image','url("'+new URL(url,location.href).href+'")');
  image.src=url;
 }
 const start=()=>setTimeout(loadArtwork,0);
 if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();
