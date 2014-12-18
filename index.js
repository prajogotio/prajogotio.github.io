var menubar;
var menubar_ghost;

document.addEventListener("DOMContentLoaded", function(){
    demos = document.getElementById('demo-list');
    projects = document.getElementById('project-list');
    menubar = document.getElementById('menubar');
    menubar_ghost = document.getElementById('menubar-ghost');
    initializeMenu();
    registerEvents();
});


function registerEvents(){
	window.addEventListener('scroll', function(e){
		var scrollLeftOffset = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
		var scrollTopOffset = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		if(scrollTopOffset > menubar.offsetTop){
			menubar_ghost.style.setProperty('display', 'flex');
		} else {
			menubar_ghost.style.setProperty('display', 'none');
		}
	});
}