var datastructure;
var projects;

document.addEventListener("DOMContentLoaded", function(){
    datastructure = document.getElementById('datastructure');
    projects = document.getElementById('projects');
    initializeMenu();
});

function initializeMenu(){
    initializeDS();
    initializeProjects();
}

function initializeDS() {
    var dsMenu = "<div class='Header'>Data Structures and Algorithms</div>"
                 + "<div class='BigMenu'>";
    for (var i = 0; i < DataStructures.length; ++i) {
        dsMenu += renderAsOption(DataStructures[i]);
    }
    dsMenu += "</div>";
    datastructure.innerHTML = dsMenu;
}

function initializeProjects(){
    var projMenu = "<div class='Header'>Projects</div>"
                 + "<div class='BigMenu'>";
    for (var i = 0; i < Projects.length; ++i) {
        projMenu += renderAsOption(Projects[i]);
    }
    projMenu += "</div>";
    projects.innerHTML = projMenu;
}

function renderAsOption(opt) {
    var str = "<a href=" 
              + opt.url 
              + "><div class='BigOption'><div>" 
              + opt.title 
              + "</div><div>" 
              + opt.caption 
              + "</div></div></a>";
    return str;
}