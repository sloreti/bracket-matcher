// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';

$(document).click(function(event) {
  
	const targetText = event.target.innerText

	if (!bracketPresentIn(targetText)) {
		return
	}
	console.log(targetText)

	if (allBracketsMatchIn(targetText)) {
		var bracketClicked = wasBracketClicked(event)
		if (bracketClicked) {
			highlightClickedBracket(bracketClicked)
		}
	} else {
		console.log("Brackets DON'T match!")
		seekMatchesInParents(event)
	}

});

const closingBrackets = { 
							'}':'{', 
							']':'[', 
							')':'('
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

function highlightClickedBracket(bracket) {
	bracket.css({
		"background-color": "#ff980099",
    	"padding": "0px 2px",
    	"font-weight": "bold"
	})
}

function wasBracketClicked(event) {

	// wrap all chars in spans
	var target = $(event.target)
	if (!target.data("hasBeenLettered")) {
		$(event.target).lettering()
		target.data("hasBeenLettered", true)
	}

	// Loop through chars and see if click was in vicinity of a 
	// bracket. This could be 2D binary search
	var chars = target.children('span[class^="char"]')
	for (var char of chars) {
		var v = inVicinity(char, event, 5)
		if (bracketPresentIn(char.innerText) && inVicinity(char, event, 5)) {
			console.log("Bracket CLICKED")
			return $(char)
		}
	}
	
	console.log("Bracket not clicked")
	return false
}

function seekMatchesInParents(event) {
	return
}