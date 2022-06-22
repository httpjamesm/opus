// set html attribute for data-theme
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

setTheme(window.localStorage.getItem("theme") === "dark" ? "dark" : "light");
