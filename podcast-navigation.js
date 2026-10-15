(() => {
  const nav = document.getElementById('podcastNavigation');
  const select = document.getElementById('podcastJump');
  if (!nav || !select) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  let scheduled = false;
  function update() {
    scheduled = false;
    const boundary = Math.max(100,nav.getBoundingClientRect().height + 25);
    let active = links[0]?.hash;
    for (const link of links) {
      const target = document.getElementById(link.hash.slice(1));
      if (target && target.getBoundingClientRect().top <= boundary) active = link.hash;
    }
    for (const link of links) {
      if (link.hash === active) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
    if (active) select.value = active;
  }
  function schedule() {
    if (!scheduled) {scheduled = true;requestAnimationFrame(update)}
  }
  select.addEventListener('change', () => {
    const target = document.getElementById(select.value.slice(1));
    if (!target) return;
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    history.replaceState(null,'',location.pathname + location.search + select.value);
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('hashchange',schedule);
  new MutationObserver(schedule).observe(document.getElementById('episodeContent'),{childList:true});
  // Deferred episode content must exist before resolving incoming section links.
  const initial = links.find(link => link.hash === location.hash);
  if (initial) requestAnimationFrame(() => document.getElementById(initial.hash.slice(1))?.scrollIntoView());
  update();
})();
