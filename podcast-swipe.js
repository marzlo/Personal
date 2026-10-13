(function(root) {
  root.PodcastSwipe = {
    attach(card, move) {
      let gesture = null, suppressClick = false;
      function reset() {
        gesture = null;
        card.classList.remove('is-swiping');
        card.style.transform = '';
      }
      card.addEventListener('pointerdown', event => {
        if (gesture || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
        suppressClick = false;
        if (event.target.closest('button,a,input,select,textarea')) return;
        gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,horizontal:false};
      });
      card.addEventListener('pointermove', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (!gesture.horizontal) {
          if (Math.max(Math.abs(dx),Math.abs(dy)) < 10) return;
          if (Math.abs(dy) >= Math.abs(dx)) {reset();return}
          gesture.horizontal = true;
          card.setPointerCapture?.(event.pointerId);
          card.classList.add('is-swiping');
        }
        gesture.dx = dx;
        if (event.cancelable) event.preventDefault();
        // Limit visual movement while keeping the gesture distance for navigation.
        card.style.transform = 'translateX(' + Math.max(-110,Math.min(110,dx * .45)) + 'px)';
      });
      card.addEventListener('pointerup', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const {dx,horizontal} = gesture;
        const threshold = Math.max(35,Math.min(70,card.clientWidth * .12));
        suppressClick = horizontal;
        reset();
        if (horizontal && Math.abs(dx) >= threshold) move(dx < 0 ? 1 : -1);
      });
      card.addEventListener('pointercancel', reset);
      card.addEventListener('lostpointercapture', reset);
      card.addEventListener('click', event => {
        if (!suppressClick) return;
        suppressClick = false; event.preventDefault(); event.stopPropagation();
      }, true);
    }
  };
})(typeof window === 'undefined' ? globalThis : window);
