var demos;
var projects;

function initializeMenu(){
    initializeDS();
    initializeProjects();
}

function initializeDS() {
    var dsMenu = "";
    for (var i = 0; i < Demos.length; ++i) {
        dsMenu += renderAsOption(Demos[i]);
    }
    demos.innerHTML = dsMenu;
}

function initializeProjects(){
    var projMenu = "";
    for (var i = 0; i < Projects.length; ++i) {
        projMenu += renderAsOption(Projects[i]);
    }
    projects.innerHTML = projMenu;
}

function renderAsOption(opt){
  var ret =  "<a href=";
      ret += opt.url;
      ret += "><div class='project'><div class='project-title'>";
      ret += opt.title;
      ret += "</div><div class='project-image'><img src=";
      ret += opt.img 
      ret += "></div><div class='project-description'>";
      ret += opt.caption;
      ret += "</div></div></a>";
  return ret;
}