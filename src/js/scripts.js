const toggleTheme = document.getElementById('toggle-theme');

console.log(toggleTheme);


toggleTheme.addEventListener('click', () => document.body.classList.toggle('dark'));