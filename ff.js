var i = 0, c, ctx,
selpiece = 'rmark',
playerpiece = 'rmark',
speclist = [],
spechistory = [],
action = 'mark',
rrem = [ 'arout', 'brout', 'crout', 'drout' ],
grem = [ 'agout', 'bgout', 'cgout', 'dgout' ],
brem = [ 'about', 'bbout', 'cbout', 'dbout' ],
crem = [ 'acout', 'bcout', 'ccout', 'dcout' ],
prem = [ 'apout', 'bpout', 'cpout', 'dpout' ],
players = [
['r', 6, rrem, []],
['g', 6, grem, []],
['b', 6, brem, []],
['c', 6, crem, []],
['p', 6, prem, []]
],
player,
turn = 1,
playerturn = 0,
turnorder = [ 0, 1, 2, 3, 4 ],
board = [
[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, 'afact', 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
],
boardhistory = [],
adjlist = [],
emptyremaining = 96;

spechistory.push( speclist );
boardhistory.push( board );


function shuffleArray( array ) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

function findonlist( list, xsq, ysq ) {
	var i = 0;

	if (list) {
		for (i = 0; i < list.length; i++) {
			if ((list[i][0] === xsq) && (list[i][1] === ysq)) {
				return true;
			}
		}
	}
	return false
}

function removefromlist( list, xsq, ysq ) {
	var i = 0, ret = [];

	if (list) {
		for (i = 0; i < list.length; i++) {
			if ((list[i][0] !== xsq) || (list[i][1] !== ysq)) {
				ret.push( [list[i][0], list[i][1]] );
			};
		}
	}
	return ret;
}

// test a square to be filled:  if it is empty or a road, set it to 'fill' and add it to the list of recently filled squares
function filltest( tempboard, testx, testy, front ) {
	var testpt;
	var at = tempboard[testx][testy];

	if ((at === 0) || (at === 'road') || ((at !== -1) && at.substr( 1, 5 ) === 'mark')) {
		tempboard[testx][testy] = 'fill';
		testpt = new Object();
		testpt.x = testx;
		testpt.y = testy;
		front.push( testpt );
	}
}

// flood fill algorithm
function flood( tempboard, x, y ) {
	var front, oldfront;

	front = new Array();
	filltest( tempboard, x, y, front );

	oldfront = front;
	front = new Array();

	// if the old list is empty we are done
	while (oldfront.length) {
		for (i = 0; i < oldfront.length; i++) {
			filltest( tempboard, oldfront[i].x - 1, oldfront[i].y, front );
			filltest( tempboard, oldfront[i].x + 1, oldfront[i].y, front );
			filltest( tempboard, oldfront[i].x, oldfront[i].y - 1, front );
			filltest( tempboard, oldfront[i].x, oldfront[i].y + 1, front );
		}
		oldfront = front;
		front = new Array();
	}
}

// find an empty square
function findempty( bd, pt ) {
	var x, y, at;
	for (x = 1; x <= 10; x++) {
		for (y = 1; y <= 10; y++) {
			at = bd[x][y];
			if ((at === 0) || (at === 'road') || ((at !== -1) && at.substr( 1, 5 ) === 'mark')) {
				pt.x = x;
				pt.y = y;
				return;
			}
		}
	}
}

// test a square to see if it should be a road:  block it, flood fill an area, and see if any squares are not flooded
function testroad( x, y ) {
	var pt = new Object(), tempboard = $.extend( true, [], board );

	tempboard[x][y] = 'park';
	pt.x = 0;
	pt.y = 0;
	findempty( tempboard, pt );
	flood( tempboard, pt.x, pt.y );
	pt.x = 0;
	pt.y = 0;
	findempty( tempboard, pt );
	if ((pt.x != 0) || (pt.y != 0)) {
		return true;
	}
	return false;
}

function findroads( board ) {
	var i = 0, x, y;
	for (x = 1; x <= 10; x++) {
		for (y = 1; y <= 10; y++) {
			at = board[x][y];
			if ((at === 0) || ((at !== -1) && at.substr( 1, 5 ) === 'mark')) {
				if (testroad( x, y )) {
					board[x][y] = 'road';
					for (i = 0; i < 5; i++) {
						if (findonlist( players[i][3], x, y )) {
							players[i][3] = removefromlist( players[i][3], x, y );
							players[i][1]++
						}
					}
				}
			}
		}
	}
	updateadjlist();
}

function checkspec( board, x, y ) {
	var	adjcount = (
		((board[x - 1][y] !== 'road') && (board[x - 1][y] !== 0))
		+ ((board[x + 1][y] !== 'road') && (board[x + 1][y] !== 0))
		+ ((board[x][y - 1] !== 'road') && (board[x][y - 1] !== 0))
		+ ((board[x][y + 1] !== 'road') && (board[x][y + 1] !== 0))
		);

	if (adjcount === 3) {
		if (board[x - 1][y] === 0) {
			board[x - 1][y] = 'road';
		} else if (board[x + 1][y] === 0) {
			board[x + 1][y] = 'road';
		} else if (board[x][y - 1] === 0) {
			board[x][y - 1] = 'road';
		} else {
			board[x][y + 1] = 'road';
		}
	}
}

function haspieceadjacent( xsq, ysq ) {
	var np = board[xsq][ysq-1];
	var ep = board[xsq-1][ysq];
	var wp = board[xsq+1][ysq];
	var sp = board[xsq][ysq+1];
	return (
		((np !== 0) && (np !== -1)) ||
		((ep !== 0) && (ep !== -1)) ||
		((wp !== 0) && (wp !== -1)) ||
		((sp !== 0) && (sp !== -1))
		)
}

function updateadjlist() {
	var i, j, xsq, ysq;

	adjlist = [];
	for (i = 1; i <= 10; i++) {
		for (j = 1; j <= 10; j++) {
			if ((board[i][j] === 0) && haspieceadjacent( i, j )) {
				adjlist.push( [i, j] );
			}
		}
	}
}

function imgdrawat( piece, xsq, ysq ){
	ctx.drawImage( $( '#' + piece )[0], xsq*50 - 45 , ysq*50 - 45 )
}

function drawboard() {
	var i, x, y, xdraw, ydraw, playermark, turnstr = '';;

	ctx.clearRect( 0, 0, 501, 501 );
	ctx.beginPath();
	for (i = 0; i <= 10; i++) {
		ctx.moveTo( i*50 + .5, .5 );
		ctx.lineTo( i*50 + .5, 500.5 );
		ctx.moveTo( .5, i*50 + .5 );
		ctx.lineTo( 500.5, i*50 + .5 );
	}
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;
	ctx.stroke();

	for (x = 1, xdraw = 1; x <= 10; x++, xdraw += 50) {
		for (y = 1, ydraw = 1; y <= 10; y++, ydraw += 50) {
			p = board[x][y];
			if ((p === 0 ) || (p === -1)) {
				/* do nothing */
			} else if (p === 'road') {
				ctx.fillStyle = '#808080';
				ctx.fillRect( xdraw, ydraw, 49, 49 );
			} else {
				imgdrawat( p, x, y );
			}
		}
	}
	for (i = 0; i < 5; i++ ) {
		playermark = players[turnorder[i]][0] + 'mark';
		turnstr += "<img id='" + playermark + "' src='" + playermark + ".png'>" + players[turnorder[i]][1];
	}
	$( '#turnorder' ).html( turnstr );
	$( '#' + playerpiece ).css( 'border', 'solid 3px black' );
}

function firstmousemove( e ) {
	var i, j, x, y, xsq, ysq, xboard, yboard;

	drawboard();
	x = e.pageX - this.offsetLeft;
	y = e.pageY - this.offsetTop;
	xsq = Math.floor( x/50 );
	ysq = Math.floor( y/50 );
	xboard = xsq + 1;
	yboard = ysq + 1;
	if (board[xboard][yboard] === 0) {
		imgdrawat( selpiece,
			Math.ceil( (e.pageX - this.offsetLeft)/50 ),
			Math.ceil( (e.pageY - this.offsetTop)/50 ) );
	}
	for (i = 1; i <= 10; i++) {
		for (j = 1; j <= 10; j++) {
			if (board[i][j] === 0) {
				imgdrawat( 'tar', i, j );
			}
		}
	}
}

function mousemove( e ) {
	var i, x, y, xsq, ysq, xboard, yboard, at, targetlist = [];

	x = e.pageX - this.offsetLeft;
	y = e.pageY - this.offsetTop;
	xsq = Math.floor( x/50 );
	ysq = Math.floor( y/50 );
	xboard = xsq + 1;
	yboard = ysq + 1;
	at = board[xboard][yboard];

	drawboard();
	if ((at === 0) || ((at !== -1) && (at.substr( 1, 5 )) === 'mark')) {
		imgdrawat( selpiece,
			Math.ceil( (e.pageX - this.offsetLeft)/50 ),
			Math.ceil( (e.pageY - this.offsetTop)/50 ) );
	}
	if (action === 'mark') {
		for (i = 0; i < adjlist.length; i++) {
			imgdrawat( 'tar', adjlist[i][0], adjlist[i][1] )
		}
	} else if (action === 'pick') {
		targetlist = players[player][3];
		for (i = 0; i < targetlist.length; i++) {
			imgdrawat( 'picktar', targetlist[i][0], targetlist[i][1] )
		}
	} else {
		console.log( 'ERROR: invalid action' );
	}
}

function pick() {
	var tile = 'park';
	var r = Math.floor( Math.random() * emptyremaining );
	var outletsremaining = players[player][2];
	if (r < outletsremaining.length) {
		tile = outletsremaining[r];
	}
	action = 'pick';
	$( '#pick' ).html( "<img src='" + tile + ".png'>" );
	selpiece = 'park';
}

function undo() {
}

function done() {
	selpiece = players[player][0] + 'mark';
	playerpiece = selpiece;
	$( '#' + playerpiece ).css( 'border', 'solid 3px white' );
	if (action === 'mark') {
		players[player][1]--;
	} else if (action === 'pick') {
		console.log( 'TODO: place tile' );
	} else {
		console.log( 'ERROR: invalid action' );
	}
	nextplayer();
}

function place( xboard, yboard ) {
	var xboard, yboard, testx, testy, type, s;

	boardhistory.push( board );
	board = $.extend( true, [], board );

	if (selpiece === 'park') {
		board[xboard][yboard] = 'park';
	} else if (selpiece === 'out') {
		board[xboard][yboard] = 'out';
		checkspec( board, xboard, yboard );
	} else if (selpiece === 'fact') {
		board[xboard][yboard] = 'fact';
		checkspec( board, xboard, yboard );
	}

	findroads( board );

	testx = xboard - 1;
	testy = yboard;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substr(2, 3);
		if ((s === 'out') || (s === 'act')) {
			checkspec( board, testx, testy );
		}
	}
	testx = xboard + 1;
	testy = yboard;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substr(2, 3);
		if ((s === 'out') || (s === 'act')) {
			checkspec( board, testx, testy );
		}
	}
	testx = xboard;
	testy = yboard - 1;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substr(2, 3);
		if ((s === 'out') || (s === 'act')) {
			checkspec( board, testx, testy );
		}
	}
	testx = xboard;
	testy = yboard + 1;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substr(2, 3);
		if ((s === 'out') || (s === 'act')) {
			checkspec( board, testx, testy );
		}
	}

	drawboard();	
}


function nextplayer() {
	playerturn++;
	if (playerturn === 5) {
		playerturn = 0;
	}
	player = turnorder[playerturn];
	selpiece = players[player][0] + 'mark';
	playerpiece = selpiece;
	$( '#' + playerpiece ).css( 'border', 'solid 3px black' );
	if (players[player][1]) {
		action = 'mark';
		$( '#pick' ).html( "<button id='pickbtn'>Pick</button>" );	
		$( '#pickbtn' ).click( pick );
	} else {
		action = 'pick';
		pick();
	}
}

function click( e ) {
	var x, y, xboard, yboard, targetlist = [];

	x = e.pageX - this.offsetLeft;
	y = e.pageY - this.offsetTop;
	xboard = Math.floor( x/50 ) + 1;
	yboard = Math.floor( y/50 ) + 1;

	if (turn === 1) {
		if (board[xboard][yboard] === 0) {
			boardhistory.push( board );
			board = $.extend( true, [], board );
			board[xboard][yboard] = selpiece;	
		}
		players[player][1]--;
		players[player][3].push( [xboard, yboard] );
		playerturn++;
		if (playerturn === 5) {
			turn++;
			playerturn = 0;
			$( '#board' ).off( 'mousemove' );		
			$( '#board' ).mousemove( mousemove );
			updateadjlist();
		}
		player = turnorder[playerturn];
		$( '#' + playerpiece ).css( 'border', 'solid 3px white' );
		selpiece = players[player][0] + 'mark';
		playerpiece = selpiece;
		$( '#' + playerpiece ).css( 'border', 'solid 3px black' );
		drawboard();
		return;
	}
	if (action === 'mark') {
		if (findonlist( adjlist, xboard, yboard )) {
			boardhistory.push( board );
			board = $.extend( true, [], board );
			board[xboard][yboard] = selpiece;	
			if (players[player][1]) {
				players[player][3].push( [xboard, yboard] );
				players[player][1]--;
			} else {
				console.log( 'tried to mark with none left' );
			}
			nextplayer();
		}
		updateadjlist();
		drawboard();
		for (i = 0; i < adjlist.length; i++) {
			imgdrawat( 'tar', adjlist[i][0], adjlist[i][1] )
		}
	} else if (action === 'pick') {
		targetlist = players[player][3];
		if (!findonlist( targetlist, xboard, yboard )) {
			return;
		}
		place( xboard, yboard );
		players[player][3] = removefromlist( players[player][3], xboard, yboard );
		players[player][1]++;
		nextplayer();
	} else {
		console.log( 'invalid action');
	}
	drawboard();
}

$( document ).ready( function(){
	var i, x, y, playermark, turnstr = '';

	shuffleArray( turnorder );
	for (i = 0; i < 5; i++ ) {
		playermark = players[turnorder[i]][0] + 'mark';
		turnstr += "<img id='" + playermark + "' src='" + playermark + ".png'>" + players[turnorder[i]][1];
	}
	$( '#turnorder' ).html( turnstr );

	player = turnorder[0];
	selpiece = players[player][0] + 'mark';
	playerpiece = selpiece;
	$( '#' + selpiece ).css( 'border', 'solid 3px black' );

	x = Math.floor( Math.random() * 5 + 6 );
	y = Math.floor( Math.random() * 5 + 6 );
	board[x][y] = 'bfact';
	x = Math.floor( Math.random() * 5 + 1 );
	y = Math.floor( Math.random() * 5 + 6 );
	board[x][y] = 'cfact';
	x = Math.floor( Math.random() * 5 + 1 );
	y = Math.floor( Math.random() * 5 + 1 );
	board[x][y] = 'dfact';

	findroads( board );

	c = document.getElementById( 'board' );
	ctx = c.getContext( '2d' );

	$( '#board' ).mousemove( firstmousemove );
	$( '#board' ).mouseleave( function( e ) {
		drawboard();
	});
	$( '#board' ).click( click );
	$( '#pickbtn' ).click( pick );
	$( '#undo' ).click( undo );
	$( '#done' ).click( done );

	drawboard();
});
