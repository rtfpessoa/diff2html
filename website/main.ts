import 'bulma/css/bulma.css';

document.addEventListener('DOMContentLoaded', () => {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  $navbarBurgers.forEach((el: HTMLElement) => {
    el.addEventListener('click', () => {
      el.classList.toggle('is-active');
      if (el.dataset.target !== undefined) {
        document.getElementById(el.dataset.target)?.classList.toggle('is-active');
      }
    });
  });
});
