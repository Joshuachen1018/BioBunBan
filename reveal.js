// Subtle scroll reveals + image treatments, shared by the BioBunBan pages.
// Applied by JS (not stylesheets) so the DC templates stay inline-styled.

const REVEAL_SEL = [
  'section > div > h1', 'section > div > h2', 'h2',
  'figure', 'img', 'image-slot', '[role="img"]',
  'section > div > p', 'form'
].join(',');

export function setupReveal(root) {
  const scope = root || document;
  if (scope.__bbRevealDone) return;
  scope.__bbRevealDone = true;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Slow drift on full-bleed hero photography.
  scope.querySelectorAll('section > img').forEach((img) => {
    img.style.willChange = 'transform';
    img.style.transform = 'scale(1.04)';
    if (!reduce) img.style.animation = 'bbpan 26s ease-in-out infinite alternate';
  });

  // Gentle zoom on contained imagery when its card is hovered.
  scope.querySelectorAll('a img, figure img, a [role="img"], figure [role="img"]').forEach((img) => {
    const box = img.parentElement;
    if (!box) return;
    box.style.overflow = 'hidden'; // keep the zoom inside the card's rule
    img.style.transition = 'transform 900ms cubic-bezier(0.22,0.7,0.25,1), filter 600ms ease';
    const hoverTarget = box.closest('a, figure') || box;
    hoverTarget.addEventListener('mouseenter', () => { img.style.transform = 'scale(1.045)'; });
    hoverTarget.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; });
  });

  if (reduce || !('IntersectionObserver' in window)) return;

  const targets = [];
  scope.querySelectorAll(REVEAL_SEL).forEach((el) => {
    if (el.closest('header')) return;
    if (el.dataset.bbReveal) return;
    // Hero content animates on load already.
    if (el.closest('#top') && el.tagName !== 'IMG') return;
    if (el.tagName === 'IMG' && el.parentElement && el.parentElement.tagName === 'SECTION') return;
    el.dataset.bbReveal = '1';
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    targets.push(el);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.transition = 'opacity 760ms cubic-bezier(0.22,0.7,0.25,1) ' + (i * 70) + 'ms, transform 760ms cubic-bezier(0.22,0.7,0.25,1) ' + (i * 70) + 'ms';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach((el) => io.observe(el));
}
