const toggleTheme = document.getElementById('toggle-theme');

console.log(toggleTheme);


toggleTheme.addEventListener('click', () => document.documentElement.classList.toggle('dark'));