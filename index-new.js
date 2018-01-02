var states = {
	currentTab : 0,
	tabs : ["#home", "#projects", "#demos", "#contacts"],
	isScrolling : false,
	lastWheel : 0,
};

$(document).ready(function() {
	states.demos = $(".demos-wrapper");
	states.projects = $(".projects-wrapper");
	initializeMenu();

	$(window).on("scroll", function(e) {
		menuBarHandler();
	});

	$(window).on("wheel", function(e){
		e.preventDefault();
		var deltaX = e.originalEvent.wheelDeltaX;
		var deltaY = e.originalEvent.wheelDeltaY;
		
		if(states.isScrolling) return;
		curTime = Date.now();
		if(curTime - states.lastWheel < 1630) return;
		states.lastWheel = curTime;
		nextTab = states.currentTab+((e.originalEvent.deltaY || e.originalEvent.wheelDelta) < 0 ? -1 : 1);
		speed = 880;

		if(nextTab >= states.tabs.length) {
			nextTab = 0;
			speed = 1300;
		}
		if(nextTab < 0) return;
		states.nextTab = nextTab;
		goToTab(states.tabs[nextTab], speed);
	});

	$("#projects-navigation, #demos-navigation").on("mousemove", function(e) {
		states.mouseEvent = {pageX : e.pageX, pageY : e.pageY};
	});

	$("#projects-navigation, #demos-navigation").on("mouseenter", function(e) {
		var that = this;
		states.mouseHandlerLoop = setInterval(function() {
			var parentOffset = $(that).offset();
			var childWidth = $(that).children().width();
			var windowWidth = $(that).width();
			var left = states.mouseEvent.pageX - parentOffset.left;
			if(left < $(that).parent().width() * 0.9 * 0.23) {
				requestFocusTo(".projects-navigation-left");
				var curLeft = parseInt($(that).children().css('left')) || 0;
				if(curLeft > 100) {
					return;
				}
				$(that).children().css('left', (curLeft+7) + 'px');
			} else if(left > $(that).parent().width() * 0.9 * 0.78) {
				requestFocusTo(".projects-navigation-right");
				var curLeft = parseInt($(that).children().css('left')) || 0;
				if(curLeft+childWidth+100 < windowWidth) {
					return;
				}
				$(that).children().css('left', (curLeft-7) + 'px');
			} else {
				handleFocusOutOfNavigationButton();
			}
		}, 1000/60);
	});
	$("#projects-navigation, #demos-navigation").on("mouseleave", function(e) {
		clearInterval(states.mouseHandlerLoop);
	});
});

function requestFocusTo(button) {
	if(states.isScrolling) return;
	$(button).css({
		"opacity" : 0.95,
	})
}

function handleFocusOutOfNavigationButton() {
	if(states.isScrolling) return;
	$(".projects-navigation-right, .projects-navigation-left").css({
		opacity : 0.5,
	})
}

$(window).load(function() {
	setTimeout(function(){
		$("html,body").prop({"scrollTop" : "0"});
		states.menuInitPosition = $("#menu").offset().top;
	} , 1);
	enter("#home")
	
	$("#projects-pointer").on("click", function() {
		goToTab("#projects", 880);
		states.nextTab = 1;
	});
	$("#demos-pointer").on("click", function() {
		goToTab("#demos", 880);
		states.nextTab = 2;
	})
	$("#contacts-pointer").on("click", function() {
		goToTab("#contacts", 880);
		states.nextTab = 3;
	})
});

function enter(tab) {
	if(tab == "#home") {
		$("#home-title").css({"opacity":"1"});
		$("#home-title-first").css({"opacity" : "1", "top" : "0px"});
	} else if (tab == "#projects") {
		$("#desktop-projects-wrapper").css({"opacity" : "1"});
		$("#projects-sidetitle-content").css({"opacity" : "1", "left" : "10px"});
		$("#projects-pointer").css({"background-color" : "#998F34"});
	} else if (tab == "#demos" ) {
		$("#desktop-demos-wrapper").css({"opacity" : "1"});
		$("#demos-sidetitle-content").css({"opacity" : "1", "left" : "10px"});
		$("#demos-pointer").css({"background-color" : "#998F34"});
	} else if (tab == "#contacts" ) {
		$("#contacts-wrapper").css({"opacity" : "1"});
		$("#contacts-sidetitle-content").css({"opacity" : "1", "left" : "10px"});
		$("#contacts-pointer").css({"background-color" : "#998F34"});

	}
}

function leave(tab) {
	if(tab == "#home") {
		$("#home-title").css({"opacity":"0"});
		$("#home-title-first").css({"opacity" : "0", "top" : "30px"});
	} else if(tab=="#projects"){
		$("#desktop-projects-wrapper").css({"opacity" : "0"});
		$("#projects-sidetitle-content").css({"opacity" : "0", "left" : "40px"});
		$("#projects-pointer").css({"background-color" : ""});

	}else if(tab == "#demos") {
		$("#desktop-demos-wrapper").css({"opacity" : "0"});
		$("#demos-sidetitle-content").css({"opacity" : "0", "left" : "40px"});
		$("#demos-pointer").css({"background-color" : ""});
	}else if(tab == "#contacts") {
		$("#contacts-wrapper").css({"opacity" : "0"});
		$("#contacts-sidetitle-content").css({"opacity" : "0", "left" : "40px"});
		$("#contacts-pointer").css({"background-color" : ""});
	}
}

function deassertMenuBar() {
	$("#projects-pointer").css({"background-color" : "transparent"});
	$("#demos-pointer").css({"background-color" : "transparent"});
	$("#contacts-pointer").css({"background-color" : "transparent"});
}

function showNavigationButton() {
	$(".projects-navigation-left").css({"opacity" : "0.5"});
	$(".projects-navigation-right").css({"opacity" : "0.5"});
}

function hideNavigationButton() {
	$(".projects-navigation-left").css({"opacity" : "0"});
	$(".projects-navigation-right").css({"opacity" : "0"});
}

function goToTab(tab, speed) {
	if(states.isScrolling) return;
	states.isScrolling = true;
	hideNavigationButton();
	$("html, body").animate({
		scrollTop : $(tab).offset().top,
	}, speed, function(){
		showNavigationButton();
		leave(states.tabs[states.currentTab]);
		states.currentTab = states.nextTab;
		enter(states.tabs[states.nextTab]);
		states.isScrolling = false;
	});
}


function menuBarHandler() {
	var curScroll = $(window).scrollTop();
	if(curScroll+10 > states.menuInitPosition) {
		$("#menu").css("position", "fixed");
		$("#menu").addClass("menuFixed");
	} else {
		$("#menu").css("position", "absolute");
		$("#menu").removeClass("menuFixed");
	}
}



function initializeMenu(){
    initializeDS();
    initializeProjects();
}

function initializeDS() {
    var dsMenu = "";
    for (var i = 0; i < Demos.length; ++i) {
        dsMenu += renderAsOption(Demos[i], i%2);
    }
    states.demos[0].innerHTML = dsMenu;
    dsMenu = "";
    for (var i = 0; i < Demos.length; ++i) {
        dsMenu += renderAsOption(Demos[i], 0);
    }
    states.demos[1].innerHTML = dsMenu;
}

function initializeProjects(){
    var projMenu = "";
    for (var i = 0; i < Projects.length; ++i) {
        projMenu += renderAsOption(Projects[i], i%2);
    }
    states.projects[0].innerHTML = projMenu;
    projMenu = "";
    for (var i = 0; i < Projects.length; ++i) {
        projMenu += renderAsOption(Projects[i], 0);
    }
    states.projects[1].innerHTML = projMenu;
}

function renderAsOption(opt, type){
	if(type==0){
		var ret = "<div class='project-outer-wrapper'><a href='" +opt.url+ "'' target='_blank'><div class='project'><div class='project-thumbnail'>"
		ret += "<div class='project-thumbnail-wrapper'>";
		if(opt.img){
			ret += "<img src='"+(opt.img ? opt.img : "")+"'></img>";
		}
		ret += "</div>";
		ret += "</div><div class='project-description'><div class='project-title'>"
		ret += opt.title;
		ret += "</div><div class='project-caption'>";
		ret += opt.caption;
		ret += "</div></div></div></a></div>";
	} else if(type==1){
		var ret = "<div class='project-outer-wrapper'><a href='" +opt.url+ "'' target='_blank'><div class='project project-alternated'>"
		ret += "<div class='project-description'><div class='project-title'>"
		ret += opt.title;
		ret += "</div><div class='project-caption'>";
		ret += opt.caption;
		ret += "</div></div>";
		ret += "<div class='project-thumbnail'>"
		ret += "<div class='project-thumbnail-wrapper'>";
		if(opt.img) {
			ret += "<img src='"+opt.img+"'></img>";
		}
		ret += "</div>"
		ret += "</div>"
		ret += "</div></a></div>";
	}
  	return ret;
}