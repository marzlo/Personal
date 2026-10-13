(function(root) {
  root.PodcastSwipe = {
    attach(track) {
      let drag = null, suppressClick = false;
      track.addEventListener('pointerdown', event => {
        // Touchscreens and trackpads use the same native scrolling as the home page.
        if (event.pointerType !== 'mouse' || event.button !== 0 || drag) return;
        suppressClick = false;
        if (event.target.closest('button,a,input,select,textarea')) return;
        drag = {id:event.pointerId,x:event.clientX,y:event.clientY,left:track.scrollLeft,started:false};
      });
      track.addEventListener('pointermove', event => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (!drag.started) {
          if (Math.abs(dx) < 8) return;
          if (Math.abs(dy) > Math.abs(dx)) {drag = null;return}
          drag.started = true;track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');
        }
        event.preventDefault();track.scrollLeft = drag.left - dx;
      });
      function finish(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const previous = drag;drag = null;track.classList.remove('is-dragging');
        if (!previous.started) return;
        suppressClick = true;
        const width = Math.max(1,track.clientWidth), dx = previous.left - track.scrollLeft;
        const start = Math.round(previous.left / width);
        const next = event.type === 'pointercancel' ? start : Math.abs(dx) >= 50 ? start + (dx < 0 ? 1 : -1) : Math.round(track.scrollLeft / width);
        track.scrollTo({left:Math.max(0,Math.min(track.scrollWidth - width,next * width)),behavior:'smooth'});
      }
      track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);
      track.addEventListener('lostpointercapture',finish);
      track.addEventListener('click', event => {
        if (!suppressClick) return;suppressClick = false;event.preventDefault();event.stopPropagation();
      },true);
    }
  };
})(typeof window === 'undefined' ? globalThis : window);
