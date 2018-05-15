// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';

var color;
var highlightType;

chrome.storage.sync.get(['enabled', 'color', 'highlightType'], function(data) {

	$("#enabled").prop('checked', data.enabled);
	$("#enabled").change(handleToggle);

	color = data.color;
	highlightType = data.highlightType;
	$(".highlight-button").click(changeHighlightType)
	$("#swab").spectrum({ color: color });

	handleToggle()
});


function handleToggle() {
	if ($("#enabled").is(":checked")) {
		$("input:checked + .slider").css("background-color", color)
		$("#" + highlightType).click()
		$("#swab").spectrum("enable");
		$("#swab").spectrum("set", color);
		$("#label").text(color)
	} else {
		$("input + .slider").css("background-color", "white")
		$(".highlight-button").css("cursor", "default")
		$(".highlighted").css({	
			"background-color": "#9e9e9e99",
			"border": " 1px solid #fff"
		});
		$("#swab").spectrum("set", "9e9e9e");
		$("#swab").spectrum("disable");
		$("#label").text("disabled");
	}
}

function changeHighlightType() {
	$(".highlighted").css({
		"background-color": "white",
		"border" : "1px solid #e2e2e2"

	})
	$(this).children(".highlighted").css({	
		"background-color": color+"99", // append alpha value
		"border" : "1px solid white"
	})
	// TODO: chrome.storage.sync.set()
}