
/* **** Global Variables **** */
//I'm making each game an object, and passing that object around to mutate it and trigger udpates to the DOM.

/* **** Guessing Game Functions **** */

// Generates a new game object with all the initial default values
function Game(){
	this.winningNumber = generateNumber();
	this.playersGuess;
	this.remainingGuesses = 10;
	this.guessHistory = [];
}

// Generates a number - for winningNumber and hints
function generateNumber(){
	return Math.floor(Math.random()*100+1);
}

// Manage repeat guesses
function repeatGuessMgr(game, playersGuessEl){
	console.log(playersGuessEl);
	//console.log(game.remainingGuesses);
	if(game.guessHistory.length>0){ // to avoid thinking the first guess is a repeat guess
		for (var i = 0; i<game.guessHistory.length; i++){ 
			if(game.playersGuess == game.guessHistory[i]){
				playersGuessEl.attr('placeholder','Repeat guess, try again!');
				highlightInput(playersGuessEl);
				return;
			}
		}
	}
	game.remainingGuesses--;	
	game.guessHistory.push(game.playersGuess);
	
}

// Fetch the Players Guess and figure out what to do with it
function playersGuessSubmission(game){
	// add code here
	var playersGuessEl = $('.playersguess'); // trying to avoid calling this thing a thousand times
	if(game.remainingGuesses > 0){ 
		game.playersGuess = +playersGuessEl.val();
		if(game.playersGuess >0 && game.playersGuess < 101){			
			playersGuessEl.val('');
			playersGuessEl.attr('placeholder','Guess again');
			repeatGuessMgr(game, playersGuessEl);
			$('.guess').text(game.guessHistory);

			//update remaining guesses box
			$('.guesscount').text(game.remainingGuesses);
			
			//tell the user if they're hot or cold
			lowerOrHigher(game, playersGuessEl);

			//helper stuff
			console.log(game.winningNumber);
		} else {
			playersGuessEl.val('Must be a number between 1 and 100!');
			highlightInput(playersGuessEl);
		}
	} else{
		//console.log(game.remainingGuesses);
		gameOver(playersGuessEl, 'You Lose - the winning number was ' + game.winningNumber);
	}

}

// Determine if the next guess should be a lower or higher number
function lowerOrHigher(game, playersGuessEl){
	// add code here
	//I tried to do something a little different than asked, which is a directional indication. 
	var status = $('.status');
	var currentGuess = Math.abs(game.playersGuess - game.winningNumber);
	var prevGuess = Math.abs(game.guessHistory[game.guessHistory.length-2] - game.winningNumber);
	if(currentGuess == 0){
		gameOver(playersGuessEl,'YOU WON!!');
		$('.guesscount').text('YOU WON!!')
		$('.guess').text('YOU WON!!')
		$('.hint-display').text('YOU WON!!')
		$('.status').text('YOU WON!!')

	} else if(currentGuess < prevGuess){
		status.text('Closer than previous guess!');
	} else if (currentGuess > prevGuess){
		status.text('Further than previous guess :(');
	} else {
		status.text('Waiting for more data');
	}
}


// Create a provide hint button that provides additional clues to the "Player"
//hint generator combines the winning number with some randomly generated ones. 
function provideHint(game){
	// add code here
	var hints = [];
	for(var i = 0; i < game.remainingGuesses-1; i++){
		var num = generateNumber();
		//check once in case the hint is the same as the winning number
		if(num === game.winningNumber){
			num = generateNumber();
		}
		else{
			hints.push(generateNumber());
		}
	}
	hints.push(game.winningNumber);
	//randomize hints, using Fisher-Yates (which I googled... but I think I understand how it works)
	for (var i = hints.length-1; i > 0; i--){
		var j = Math.floor(Math.random() * (i+1));
		var temp = hints[i];
        hints[i] = hints[j];
        hints[j] = temp;
	}
	var hintDisplay = $('.hint-display');
	hintDisplay.text(hints);
	hintDisplay.prev().text('Try one of these...');
	setTimeout(function(){
		hintDisplay.prev().text('HINTS');
	},2000);
	
}

// Generic highlight function - used in a few contexts. Could have made this better, to style things differently if you win vs. other errors. 
function highlightInput(playersGuessEl){
	playersGuessEl.addClass('highlight');
	setTimeout(function(){
		playersGuessEl.removeClass('highlight');
		playersGuessEl.val('');
	},1000);
}

//Display game over messaging, whether you won or used all your turns up
function gameOver(playersGuessEl, message){
	playersGuessEl.val('GAME OVER');
	playersGuessEl.attr('placeholder','Click "Reset Game" to play again');
	highlightInput(playersGuessEl);
	$('.submit').prop('disabled',true);
	$('.hint').prop('disabled',true);
	$('.status').text(message);
}

// Reset everything
function playAgain(){
	// add code here
	$('header').slideDown().animate({'font-size': '32px'}, 'fast').animate({'font-size': '30px'}, 'fast');
	$('.guess').text('--');
	$('.status').text('Waiting...');
	$('.hint-display').text('--');
	$('.guesscount').text('10');
	$('.playersguess').val('').attr('placeholder','Enter a number from 1-100');
	$('.submit').prop('disabled',false);
	$('.hint').prop('disabled',false);	
	//game = new Game() // having this here didn't work - the game var gets reset to a new Game object in this scope, but not the outer. So I have to do it from line 197. But since objects are passed by refence, and game is not local to this function, shouldn't it have just updated the game var's reference in the outer scope to the new object?
	//console.log(game);
}

// Check if the Player's Guess is the winning number 
//Note: I ended up using lowerOrHIgher to check if winninNumber == playersGuess. 
/*
function checkGuess(winningNumber, playersGuess){
	// add code here
	return winningNumber === playersGuess;
	
}
*/
/* **** Event Listeners/Handlers ****  */
$(document).ready(function(){
	//initial set up
	$('header').slideDown().animate({'font-size': '32px'}, 'fast').animate({'font-size': '30px'}, 'fast');
	var game = new Game();
	$('.guesscount').text(game.remainingGuesses);

	//all things when you click submit
	$('.submit').click(function(){
		playersGuessSubmission(game);
	});

	//all things when you click enter
	$('.playersguess').keydown(function(e){
		if(e.which == 13){
			playersGuessSubmission(game);
		}
	});
	//all the things when you click hint
	$('.hint').on('click', function(){
		if(game.remainingGuesses<10)
			provideHint(game);
		else{
			$('.hint-display').text("Please make a guess first");
		}
	});

	//reset all the fields if the user resets
	$('.reset').on('click', function(){
		playAgain();
		game = new Game(); // i tried doing this in line 155 as part of playAgain, but it only reset game in playAgain's scope. That doesn't make sense to me though... see line 155 for more. Any thoughts?
	});
});




