// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';

$(document).click(function(event){
  const target = event.target
  console.log(allBracketsMatch(target.innerText))
});

const closingBrackets = {'}':'{', ']':'[', ')':'('}
// const openingHtmlTagRe = /\<[a-zA-Z]+(\s.+)?\>/ // Rather permissive regex, consider replacing w/ https://stackoverflow.com/a/3524392/3681279
const re = new RegExp( /\[|\{|\(|\]|\}|\)/, 'g');

function allBracketsMatch(str){

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