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

$(document).ready(function(){
	$("iframe").on('load', function(){


		// Remove duplicate handlers
		$(document).off('click')
		$("iframe").off('click')

		styleIframes()
		$(document).on('click', handleClick);
		$("iframe").contents().find("body").on('click', handleClick);

	});
});

function handleClick(event) {

	// If clicked a highlighted bracket, remove highlight
	if ($(event.target).hasClass(HIGHLIGHT_CLASS)) {
		var uuid = $(event.target).data("highlight-id")
		removeHighlight(uuid)
	}

	var s = $(this).is(document) ? 
			window.getSelection() : 
			this.ownerDocument.defaultView.getSelection(); // Need to check if click in window or in iframe
    var range = s.getRangeAt(0);
    var node = s.anchorNode;
    var offset = s.anchorOffset - 1;
    var clickedChar = node.textContent[offset]

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