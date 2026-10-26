(() => {
 const button=document.querySelector('.home-atom-toggle');if(!button)return;
 const svg=button.querySelector('svg'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,visible=true;
 function update(){
  const stopped=paused||document.hidden||reduce.matches||!visible;
  if(stopped)svg.pauseAnimations();else svg.unpauseAnimations();
  button.disabled=reduce.matches;
  button.setAttribute('aria-pressed',String(paused||reduce.matches));
  const label=reduce.matches?'原子圖示（已減少動態）':paused?'播放原子動畫':'暫停原子動畫';
  button.setAttribute('aria-label',label);button.title=label;
 }
 button.onclick=()=>{paused=!paused;update()};
 document.addEventListener('visibilitychange',update);reduce.addEventListener('change',update);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()}).observe(button);
 update();
})();
