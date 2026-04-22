(function() {
  try {
    var t = localStorage.getItem('pg-theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
