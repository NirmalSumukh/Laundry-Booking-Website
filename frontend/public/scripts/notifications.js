// frontend/public/scripts/notifications.js
// Simple toast notifications

const Toast = (() => {
  function show(message, duration = 3000) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerText = message;
    document.body.appendChild(el);
    setTimeout(() => {
      el.classList.add('visible');
    }, 10);
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => document.body.removeChild(el), 300);
    }, duration);
  }
  return { show };
})();
