// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';

const MAX_HEIGHT = 5; // Max number of nodes to go up the DOM checking for allBracketsMatchIn()

$(document).click(function(event) {

	var s = window.getSelection();
    var range = s.getRangeAt(0);
    var node = s.anchorNode;
    var offset = s.anchorOffset - 1;
    var clickedChar = node.textContent[offset]
    if (bracketPresentIn(clickedChar)) {
    	range.setStart(node, range.startOffset-1);
    	range.deleteContents();
    	var highlight = document.createElement('span');
    	highlight.className = "highlighted-bracket";
    	highlight.innerHTML = clickedChar;
        range.insertNode(highlight);
        range.collapse();


    }
});

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


var bracketPresentIn = str => bracketsRe.test(str)

function inVicinity(char, event, margin) {
    return (
    		(event.offsetX >= (char.offsetLeft - margin)) &&
    		(event.offsetX <= (char.offsetLeft + char.offsetWidth + margin)) &&
    		(event.offsetY >= (char.offsetTop - margin)) &&
    		(event.offsetY <= (char.offsetTop + char.offsetHeight + margin))  
    	)
}

function findMatching(bracket, str) {

	var stack = [bracket.innerText];
	var chars = target.children('span[class^="char"]')
	var matchingBrackets = closingBrackets

	if (bracket in closingBrackets) { // search backwards
		chars = chars.reverse()
		matchingBrackets = startingBrackets
	}


	for (var char of chars) {
		var v = inVicinity(char, event, 5)
		if (bracketPresentIn(char.innerText) && inVicinity(char, event, 5)) {
			console.log("Bracket CLICKED")
			return $(char)
		}
	}



	var returnArr;
	while ((returnArr = re.exec(str)) !== null) {

		var bracket = returnArr[0]
		if (bracket in matchingBrackets) {
			var topOfStack = stack[stack.length-1]
			if (topOfStack === closingBrackets[bracket]) {
				var popped = stack.pop()
				if (!stack) {
					return popped
				}
			} else {
				return false;
			}
		} else {
			stack.push(bracket);
		}
	}
}

function allBracketsMatchIn(str) {

	const re = new RegExp( bracketsRe, 'g');
	var stack = [];
	var returnArr;
	while ((returnArr = re.exec(str)) !== null) {

		var bracket = returnArr[0]
		if (bracket in closingBrackets) {
			var topOfStack = stack[stack.length-1]
			if (topOfStack === closingBrackets[bracket]) {
				stack.pop()
			} else {
				return false;
			}
		} else {
			stack.push(bracket);
		}
	}
	return stack.length === 0
}

function seekMatchesInParents(event) {
	return
}