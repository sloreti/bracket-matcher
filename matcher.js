// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';


$(document).click(function(event){
  // event.target is the clicked object
  const target = event.target
  //console.log(target.innerText)
  console.log(allBracketsMatch(target.innerText))
});

const closingBrackets = {'}':'{', ']':'[', ')':'('}
const openingHtmlTagRe = /\<[a-zA-Z]+(\s.+)?\>/ // Rather permissive regex, consider replacing w/ https://stackoverflow.com/a/3524392/3681279
//const closingHtmlTagRe = /\<[a-zA-Z]+(\s.+)?\>/ // Rather permissive regex
const bracketsRe = /\[|\{|\(|\]|\}|\)/
const combinedRe = new RegExp(
								openingHtmlTagRe.source + "|" +
								//closingHtmlTagRe.source + "|" + 
								bracketsRe.source,
								'g'
							);

function allReMatches(str) {
	var returnArr;
	while ((returnArr = combinedRe.exec(str)) !== null) {
	  console.log(`Found ${returnArr[0]}. Next starts at ${combinedRe.lastIndex}.`);
	}
}

function allBracketsMatch(str){

	var stack = [];
	var returnArr;

	while ((returnArr = combinedRe.exec(str)) !== null) {

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

function isParenthesisMatch(str){

    var stack = [];
    var c;

    for (var i=0; i < str.length; i++) {
        c = str.charAt(i);

        if ( c in validOpeners || x(c) ){
            stack.push(c);
        }
        else if(c == ')')
            if(stack.empty())
                return false;
            else if(stack.peek() == '(')
                stack.pop();
            else
                return false;
        else if(c == '}')
            if(stack.empty())
                return false;
            else if(stack.peek() == '{')
                stack.pop();
            else
                return false;
    }
    return stack.empty();
}