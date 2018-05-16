// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';

var color;
var highlightType;

chrome.storage.sync.get(['enabled', 'color', 'highlightType'], function(data) {

	$("#enabled").prop('checked', data.enabled);
	$("#enabled").change(handleToggle);

	color = data.color;
	highlightType = data.highlightType;
	$("#swab").spectrum({ 
		color: color,
		clickoutFiresChange: true,
		change: changeColor 
	});
	handleToggle()
});


function handleToggle() {
	if ($("#enabled").is(":checked")) {
		recolor()
		$(".highlight-button").css("cursor", "pointer").click(changeHighlightType)
		$("#swab").spectrum("enable");
	} else {
		grayOut()
		$(".highlight-button").css("cursor", "default").off();
		$("#swab").spectrum("disable");
	}
}

function recolor() {
	$("input:checked + .slider").css("background-color", color)
	$("#swab").spectrum("set", color);
	$("#label").text(color)
	removeHighlights()
	applyHighlight($("#"+highlightType))
}

function grayOut() {
	$("input + .slider").css("background-color", "white")
	$(".highlighted").css({	
			"background-color": "#9e9e9e99",
			"border": " 1px solid #fff"
		});
	$("#swab").spectrum("set", "9e9e9e");
	$("#label").text("disabled");
}

function changeHighlightType() {
	removeHighlights()
	applyHighlight($(this))
	highlightType = $(this).attr('id')
	chrome.storage.sync.set({"highlightType" : highlightType})
}

function removeHighlights() {
	$(".highlighted").css({
		"background-color": "white",
		"border" : "1px solid #e2e2e2"
	})	
}

function applyHighlight(target) {
	target.children(".highlighted").css({	
		"background-color": color+"99", // append alpha value
		"border" : "1px solid white"
	})
}

function changeColor(newColor) {
	color = newColor.toHexString()
	chrome.storage.sync.set({"color" : color})
	recolor()
}