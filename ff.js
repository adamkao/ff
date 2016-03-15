var i = 0, c, ctx,
selpiece = '#spec',
speclist = [],
spechistory = [],
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
boardhistory = [];
spechistory.push( speclist ),
boardhistory.push( board );


// test a square to be filled:  if it is empty or a road, set it to 'fill' and add it to the list of recently filled squares
function filltest( tempboard, testx, testy, front ) {
	var testpt;

	if ((tempboard[testx][testy] === 0) || (tempboard[testx][testy] === 'road')) {
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
	var x, y;
	for (x = 1; x <= 10; x++) {
		for (y = 1; y <= 10; y++) {
			if ((bd[x][y] === 0) || (bd[x][y] === 'road')) {
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
	var x, y;
	for (x = 1; x <= 10; x++) {
		for (y = 1; y <= 10; y++) {
			if (board[x][y] === 0) {
				if (testroad( x, y )) {
					board[x][y] = 'road';
				}
			}
		}
	}
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

function imgdrawat( piece, xsq, ysq ){
	ctx.drawImage( $( piece )[0], xsq*50 - 45 , ysq*50 - 45 )
}

function drawboard() {
	var x, y, xdraw, ydraw;

	ctx.clearRect( 0, 0, 501, 501 );
	ctx.beginPath();
	for (i=0; i<=10; i++) {
		ctx.moveTo( i*50 + .5, .5 );
		ctx.lineTo( i*50 + .5, 500.5 );
		ctx.moveTo( .5, i*50 + .5 );
		ctx.lineTo( 500.5, i*50 + .5 );
	}
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;
	ctx.stroke();

	for (x = 1, xdraw = 1; x <= 10; x++, xdraw += 50) {
		for (y = 1, ydraw = 1; y<=10; y++, ydraw += 50) {
			p = board[x][y];
			if ((p === 0 ) || (p === -1)) {
				/* do nothing */
			} else if (p === 'road') {
				ctx.fillStyle = '#808080';
				ctx.fillRect( xdraw, ydraw, 49, 49 );
			} else {
				imgdrawat( '#' + p, x, y );
			}
		}
	}
}

function switchselpiece( id ) {
	$( selpiece ).css( 'border', 'solid 3px white' );
	selpiece = id;
	$( selpiece ).css( 'border', 'solid 3px black' );
}

$( document ).ready( function(){
	var x, y;

	x = Math.floor( Math.random() * 5 + 6 );
	y = Math.floor( Math.random() * 5 + 6 );
	board[x][y] = 'bfact';
	x = Math.floor( Math.random() * 5 + 1 );
	y = Math.floor( Math.random() * 5 + 6 );
	board[x][y] = 'cfact';
	x = Math.floor( Math.random() * 5 + 1 );
	y = Math.floor( Math.random() * 5 + 1 );
	board[x][y] = 'dfact';

	c = document.getElementById( 'board' );
	ctx = c.getContext( '2d' );

	$( '#board' ).mousemove( function( e ) {
		var x, y, xsq, ysq, xdraw, ydraw;
		x = e.pageX - this.offsetLeft;
		y = e.pageY - this.offsetTop;
		xsq = Math.floor( x/50 );
		ysq = Math.floor( y/50 );
		xdraw = xsq*50 + 9;
		ydraw = ysq*50 + 9;
		drawboard();
		ctx.fillStyle = '#000080';
		ctx.fillRect( xdraw, ydraw, 33, 33 );
	});
	$( '#board' ).mouseleave( function( e ) {
		drawboard();
	});

	$( '#board' ).click( function( e ) {
		var x, y, xsq, ysq, xboard, yboard, testx, testy, type, s, adjcount = 0;

		x = e.pageX - this.offsetLeft;
		y = e.pageY - this.offsetTop;
		xsq = Math.floor( x/50 );
		ysq = Math.floor( y/50 );
		xboard = xsq + 1;
		yboard = ysq + 1;
		if (board[xboard][yboard] === 0) {
			boardhistory.push( board );
			board = $.extend( true, [], board );
			if (selpiece === '#park') {
				board[xboard][yboard] = 'park';
			} else if (selpiece === '#out') {
				board[xboard][yboard] = 'out';
				checkspec( board, xboard, yboard );
			} else if (selpiece === '#fact') {
				board[xboard][yboard] = 'fact';
				checkspec( board, xboard, yboard );
			}
			findroads( board );
			testx = xboard - 1; testy = yboard; type = board[testx][testy];
			if ((type !== 0) && (type !== -1)) {
				s = type.substr(2, 3);
				if ((s === 'out') || (s === 'act')) {
					checkspec( board, testx, testy );
				}
			}
			testx = xboard + 1; testy = yboard; type = board[testx][testy];
			if ((type !== 0) && (type !== -1)) {
				s = type.substr(2, 3);
				if ((s === 'out') || (s === 'act')) {
					checkspec( board, testx, testy );
				}
			}
			testx = xboard; 	testy = yboard - 1; type = board[testx][testy];
			if ((type !== 0) && (type !== -1)) {
				s = type.substr(2, 3);
				if ((s === 'out') || (s === 'act')) {
					checkspec( board, testx, testy );
				}
			}
			testx = xboard;		testy = yboard + 1; type = board[testx][testy];
			if ((type !== 0) && (type !== -1)) {
				s = type.substr(2, 3);
				if ((s === 'out') || (s === 'act')) {
					checkspec( board, testx, testy );
				}
			}
			drawboard();
		}
	});

	$( '#undo' ).click( function( e ) {
		if (boardhistory.length > 0) {
			board = boardhistory.pop();
			speclist = spechistory.pop();
			drawboard();
		}
	});

	drawboard();
});
