var i = 0, c, ctx,
	boardhistory = new Array(),
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
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
	];
boardhistory.push( board );


// test a square to be filled:  if it is empty or a road, set it to 'fill' and add it to the list of recently filled squares
function filltest( tempboard, testx, testy, front ) {
	var testpt;

	if ((tempboard[testx][testy] == 0) || (tempboard[testx][testy] == 'road')) {
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

	// start with a square to be filled
	tempboard[x][y] = 'fill';

	// test squares orthogonally adjacent to this square and fill them if they are eligible, keeping a list of recently filled squares
	front = new Array();
	filltest( tempboard, x - 1, y, front )
	filltest( tempboard, x + 1, y, front )
	filltest( tempboard, x , y - 1, front )
	filltest( tempboard, x, y + 1, front )

	// save the old list of recently filled squares and construct a new one
	oldfront = front;
	front = new Array();

	// if the old list is empty we are done
	while (oldfront.length) {
		for (i = 0; i < oldfront.length; i++) {

			// add to the new list
			filltest( tempboard, oldfront[i].x - 1, oldfront[i].y, front )
			filltest( tempboard, oldfront[i].x + 1, oldfront[i].y, front )
			filltest( tempboard, oldfront[i].x, oldfront[i].y - 1, front )
			filltest( tempboard, oldfront[i].x, oldfront[i].y + 1, front )
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
			if (bd[x][y] == 0) {
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
			if (board[x][y] == 0) {
				if (testroad( x, y )) {
					board[x][y] = 'road';
				}
			}
		}
	}
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
			if (board[x][y] == 'road') {
				ctx.fillStyle = '#808080';
				ctx.fillRect( xdraw, ydraw, 49, 49 );
			} else if (board[x][y] == 'park') {
				ctx.fillStyle = '#008000';
				ctx.fillRect( xdraw, ydraw, 49, 49 );			
			} else if (board[x][y] == 'fill') {
				ctx.fillStyle = '#200000';
				ctx.fillRect( xdraw, ydraw, 49, 49 );			
			}
		}
	}
}



$( document ).ready( function(){

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

	$( '#board' ).click( function( e ) {
		var x, y, xsq, ysq, xboard, yboard;

		x = e.pageX - this.offsetLeft;
		y = e.pageY - this.offsetTop;
		xsq = Math.floor( x/50 );
		ysq = Math.floor( y/50 );
		xboard = xsq + 1;
		yboard = ysq + 1;
		if (board[xboard][yboard] == 0) {
			boardhistory.push( board );
			board = $.extend( true, [], board );
			board[xboard][yboard] = 'park';
			findroads( board );
			drawboard();
		}
	});

	$( '#undo' ).click( function( e ) {
		if (boardhistory.length > 0) {
			board = boardhistory.pop();
			drawboard();
		}
	});

	drawboard();
});
