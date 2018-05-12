// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';

const MAX_HEIGHT = 5; // Max number of nodes to go up the DOM checking for allBracketsMatchIn()
const HIGHLIGHT_CLASS = "highlighted-bracket";
const closingBrackets = { 
							'}':'{', 
							']':'[', 
							')':'('
						}
const startingBrackets = { 
							'{':'}', 
							'[':']', 
							'(':')'
						}
const bracketsRe = /\[|\{|\(|\]|\}|\)/
// const openingHtmlTagRe = /\<[a-zA-Z]+(\s.+)?\>/ // Rather permissive regex, consider replacing w/ https://stackoverflow.com/a/3524392/3681279
var isDragging = false;
var mousedownX = 0;
var mousedownY = 0;
var mouseDistanceTravelled = 0;
const MAX_MOUSE_DISTANCE = 4;


$(document).ready(function(){
	if ($("iframe").length) {
		$("iframe").on('load', function(){
			loadHandlers()
		});
	} else {
		loadHandlers()
	}
});

function loadHandlers() {
	// Remove duplicate handlers
	$(document).off()
	$("iframe").contents().find("body").off()

	styleIframes()
	attachDragIgnoringHandler( $(document), handleClick, handleClick)
	attachDragIgnoringHandler( $("iframe").contents().find("body"), handleClick)
}

// Used to listen to only clicks and ignore drags,
// over a threshold defined by MAX_MOUSE_DISTANCE
function attachDragIgnoringHandler(target, fn) {
	target.mousedown(function(event) {
			isDragging = false;
			mousedownX = event.clientX;
			mousedownY = event.clientY;
			mouseDistanceTravelled = 0
		})
		.mousemove(function(event) {
			var newDistance = Math.sqrt(
								Math.pow(mousedownY - event.clientY, 2) + 
                            	Math.pow(mousedownX - event.clientX, 2)
                            	)
			mouseDistanceTravelled += newDistance
			mousedownY = event.clientY
            mousedownX = event.clientX
            if (mouseDistanceTravelled > MAX_MOUSE_DISTANCE) {
            	isDragging = true;
            }
		 })
		.mouseup(function(event) {
		    var wasDragging = isDragging;
		    console.log(mouseDistanceTravelled)
		    isDragging = false;
		    if (!wasDragging) {
		        fn.bind(this)(event);
		    }
		});
}

function handleClick(event) {

	var s = $(this).is(document) ? 
			window.getSelection() : 
			this.ownerDocument.defaultView.getSelection(); // Need to check if click in window or in iframe
    var range = s.getRangeAt(0);
    range.collapse()
    var node = s.anchorNode;
    var offset = s.anchorOffset - 1;
    var clickedChar = node.textContent[offset]

    // If clicked a highlighted bracket, remove highlight.
    // Second check is needed because clicks right on the 
    // edge of highlight span think they're clicks on parent
    // but Selection disagrees and think its inside span
	if ($(event.target).hasClass(HIGHLIGHT_CLASS) ||
		$(node.parentNode).hasClass(HIGHLIGHT_CLASS)) {

		var uuid = $(event.target).hasClass(HIGHLIGHT_CLASS) ?
					$(event.target).data("highlight-id") :
					$(node.parentNode).data("highlight-id")
		removeHighlight(uuid)
		return
	}

    if (bracketPresentIn(clickedChar)) {
    	
    	var uuid = uuidv4()
    	highlight(node, range, clickedChar, uuid)

        var strToSearch;
        for (var i = 0; i < MAX_HEIGHT; i++) {
        	strToSearch = node.parentNode.innerHTML;
        	var innerHtmlWithMatchHighlighted = findMatching(clickedChar, strToSearch, uuid)
        	if ( innerHtmlWithMatchHighlighted ) {
        		// Success!
        		node.parentNode.innerHTML = innerHtmlWithMatchHighlighted
        		return
        	}
        	node = node.parentNode;
        }
    }
}


function highlight(node, range, clickedChar, uuid) {

	range.setStart(node, range.startOffset-1);
	range.deleteContents();

	var highlight = document.createElement('span');
	highlight.setAttribute('data-highlight-id', uuid)
	highlight.className = HIGHLIGHT_CLASS;
	highlight.innerHTML = clickedChar;

    range.insertNode(highlight);
    range.collapse();
}

function highlightStr(clickedChar, uuid) {
	return "<span class='" + HIGHLIGHT_CLASS + "' data-highlight-id='" + uuid + "'>" + 
			clickedChar + 
			"</span>"
}

var bracketPresentIn = str => bracketsRe.test(str)

var reverse = str => str.split("").reverse().join("") // This breaks for UTF-16 https://stackoverflow.com/a/16776621/3681279

var uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

var removeHighlight = id => {
	$("[data-highlight-id='" + id + "']").contents().unwrap()
	$("iframe").contents().find("[data-highlight-id='" + id + "']").contents().unwrap()
}


function findMatching(bracket, str, idToSplitOn) {

	const re = new RegExp( bracketsRe, 'g');
	const reToSplitOn = new RegExp(idToSplitOn+'.+?\>.\<');
	var [back, forward] = str.split(reToSplitOn);
	var splitter = reToSplitOn.exec(str)[0]
	var stack = [bracket];
	
	if (bracket in startingBrackets) { 
		var searchForwards = true
	} // else search backwards
	var matchingBrackets = searchForwards ? closingBrackets : startingBrackets;
	var strToSearch = searchForwards ? forward : reverse(back);

	var returnArr;
	while ((returnArr = re.exec(strToSearch)) !== null) {

		var bracket = returnArr[0]
		if (bracket in matchingBrackets) {
			var topOfStack = stack[stack.length-1]
			if (topOfStack === matchingBrackets[bracket]) {
				var popped = stack.pop()

				if (stack.length == 0) { 
					// Success! 
					return buildNewInnerHtml(bracket, idToSplitOn, back, splitter, forward, re.lastIndex-1, searchForwards)
				}

			} else {
				return false;
			}
		} else {
			stack.push(bracket);
		}
	}
	return false
}

function buildNewInnerHtml(bracket, uuid, back, splitter, forward, locationOfMatch, wasSearchingForward) {
	var innerHtml;
	if (wasSearchingForward) {
		innerHtml = back + 
					splitter + 
					forward.slice(0, locationOfMatch) +
					highlightStr(bracket, uuid) +
					forward.slice(locationOfMatch+1, forward.length)
	} else {
		locationOfMatch = back.length - locationOfMatch
		innerHtml = back.slice(0, locationOfMatch-1) +
					highlightStr(bracket, uuid) +
					back.slice(locationOfMatch, back.length) +
					splitter + 
					forward
	}
	return innerHtml;
}

function styleIframes() {
	var iframeHead = $('iframe').contents().find("head")
	var highlightStyle = $(`
						<style>
							.highlighted-bracket {
								background-color: #ff980099;
						    	padding: 1px 2px;
						    	font-weight: bold;
						    	border-radius: 3px;
							}
						</style>`)
	iframeHead.append(highlightStyle)
}