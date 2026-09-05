function focusRouteHeading() {
  const heading = document.querySelector('main h1');
  const status = document.querySelector('#route-status');
  if (!heading || !status) return;
  window.requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    status.textContent = `${document.title} loaded`;
  });
}

window.addEventListener('pageshow', focusRouteHeading);
