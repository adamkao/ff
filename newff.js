"use strict";

var ctx;
var selectedPieceImg = '', playerPieceImg = '', action = 'mark';
var playerColors = [ 'r', 'g', 'b', 'c', 'm' ];
var factoryQuadrants = [ 'a', 'b', 'c', 'd' ];
var players = {}, playerTurnOrder = [], playerOnTurn = 0, turn = 1;
/*
board squares are labeled with two chars.
'--' is the edge of the board (off the board).
'  ' is a square with nothing on it.
'Qf' is a factory. Q is the quadrant (a, b, c, d), starting at the SE and going clockwise.
'QP' is a players outlet. Q is the corresponding factory, P is the player (r, g, b, c, m).
'mP' is a players marker.
'rd' is a road.
'pk' is a park.
May be temporarily set to 'fl' when testing by flood-filling.
*/
var board = [
[ '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'af', '--' ],
[ '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--' ],
];
var boardHistory = [];
var adjacentList = [];
var emptySquaresRemaining = 96;

boardHistory.push( board );

function playerInit( color ) {
	return {
		color: color,
		markersRemaining: 8,
		spacesMarked: 6,
		outletsRemaining: [ 'a', 'b', 'c', 'd' ],
	};
};
players = {
	r: playerInit( 'r' ),
	g: playerInit( 'g' ),
	b: playerInit( 'b' ),
	c: playerInit( 'c' ),
	m: playerInit( 'm' ),
};
playerTurnOrder = [ players.r, players.g, players.b, players.c, players.m ];

function setSquare( board, x, y, label ) {
	var row = board[y];
	board[y] = row.replace( )
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

function removeNameFromList( list, name ) {
	var i = 0, ret = [];

	if (list) {
		for (i = 0; i < list.length; i++) {
			if (list[i] !== name) {
				ret.push( name );
			};
		}
	}
	return ret;
}

function isRoad( x, y ) {
	return (board[y][x] === 'rd');
}

function isMarker( x, y ) {
	return (board[y][x].slice( 1, 2 ) === 'm' );
}

function isEmpty( x, y ) {
	return (board[y][x] === '  ');
}

function isFillable( x, y ) {
	return (isRoad( x, y ) || isMarker( x, y ) || isEmpty( x, y ));
}

function fillTest( tempboard, testx, testy, front ) {
	if (isFillable( testx, testy )) {
		tempboard[ testy ][ testx ] = 'fl';
		front.push( { x: testx, y: testy } );
	}
}

// flood fill algorithm
function flood( tempboard, x, y ) {
	var front, oldFront;

	front = [];
	filltest( tempBoard, x, y, front );

	oldFront = front;
	front = [];

	// if the old list is empty we are done
	while (oldFront.length) {
		for (var i = 0; i < oldFront.length; i++) {
			fillTest( tempBoard, oldFront[i].x - 1, oldFront[i].y, front );
			fillTest( tempBoard, oldFront[i].x + 1, oldFront[i].y, front );
			fillTest( tempBoard, oldFront[i].x, oldFront[i].y - 1, front );
			fillTest( tempBoard, oldFront[i].x, oldFront[i].y + 1, front );
		}
		oldFront = front;
		front = [];
	}
}

function findFillable( bd, pt ) {
	for (var x = 1; x <= 10; x++) {
		for (var y = 1; y <= 10; y++) {
			if (isFillable( x, y )) {
				pt = { x: x, y: y };
				return pt;
			}
		}
	}
}

// test a square to see if it should be a road:  block it, flood fill an area, and see if any squares are not flooded
function testRoad( x, y ) {
	var pt = { x: x, y: y };
	var tempBoard = $.extend( true, [], board );

	tempBoard[y][x] = 'pk';
	findFillable( tempboard, pt );
	flood( tempboard, pt.x, pt.y );
	findFillable( tempboard, pt );

	return (pt.x || pt.y);
}

function findRoads( board ) {
/*
	var at = '';
	for (var x = 1; x <= 10; x++) {
		for (var y = 1; y <= 10; y++) {
			at = board[x][y];
			if ((at === '  ') || (at.substr( 1, 1 ) === 'm')) {
				if ((at === 0) || ((at !== -1) && at.substr( 1, 5 ) === 'mark')) {
					if (testRoad( x, y )) {
						board[x][y] = 'rd';
						emptySquaresRemaining--;					
						for (var i = 0; i < 5; i++) {
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
*/
}

function hasmarker( at ) {
	if (at === 0) {
		return false;
	} else if (at === -1) {
		return false;
	} else if (at.substring( 1, 5 ) === 'mark') {
		return true;
	} else {
		return false;
	}
}

function checkspec( board, x, y ) {
	var	adjcount, nadj, eadj, wadj, sadj;

	nadj = board[x][y - 1];
	eadj = board[x + 1][y];
	wadj = board[x - 1][y];
	sadj = board[x][y + 1];

	adjcount = (
		(((nadj !== 'road') && (nadj !== 0)) && !hasmarker( nadj ))
		+ (((eadj !== 'road') && (eadj !== 0)) && !hasmarker( eadj ))
		+ (((wadj !== 'road') && (wadj !== 0)) && !hasmarker( wadj ))
		+ (((sadj !== 'road') && (sadj !== 0)) && !hasmarker( sadj ))
		);

	if (adjcount === 3) {
		if ((nadj === 0) || hasmarker( nadj )) {
			board[x][y - 1] = 'road';
			emptyremaining--;			
			for (i = 0; i < 5; i++) {
				if (findonlist( players[i][3], x, y - 1 )) {
					players[i][3] = removefromlist( players[i][3], x, y - 1 );
					players[i][1]++
				}
			}
		} else if ((eadj === 0) || hasmarker( eadj )) {
			board[x + 1][y] = 'road';
			emptyremaining--;
			for (i = 0; i < 5; i++) {
				if (findonlist( players[i][3], x + 1, y )) {
					players[i][3] = removefromlist( players[i][3], x + 1, y );
					players[i][1]++
				}
			}
		} else if ((wadj === 0) || hasmarker( wadj )) {
			board[x - 1][y] = 'road';
			emptyremaining--;
			for (i = 0; i < 5; i++) {
				if (findonlist( players[i][3], x - 1, y )) {
					players[i][3] = removefromlist( players[i][3], x - 1, y );
					players[i][1]++
				}
			}
		} else if ((sadj === 0) || hasmarker( sadj )) {
			board[x][y + 1] = 'road';
			emptyremaining--;
			for (i = 0; i < 5; i++) {
				if (findonlist( players[i][3], x, y + 1 )) {
					players[i][3] = removefromlist( players[i][3], x, y + 1 );
					players[i][1]++
				}
			}
		} else {
			console.log( 'ERROR: impossible case in checkspec' );
		}
	}
	updateadjlist();
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

	adjacentList = [];
	for (i = 1; i <= 10; i++) {
		for (j = 1; j <= 10; j++) {
			if ((board[i][j] === 0) && haspieceadjacent( i, j )) {
				adjacentList.push( { x: i, y: j } );
			}
		}
	}
}

function imgdrawat( piece, xsq, ysq ){
	ctx.drawImage( $( '#' + piece )[0], xsq*50 - 45 , ysq*50 - 45 )
}

function drawBoard() {
	var x = 0, y = 0, xdraw = 0, ydraw = 0;
	var at = '', q = '', p = '';
	var playerMark = '', turnString = '';

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

	for (y = 1, ydraw = 1; y <= 10; y++, ydraw += 50) {
		for (x = 1, xdraw = 1; x <= 10; x++, xdraw += 50) {

			q = board[x][y].charAt( 0 );
			p = board[x][y].charAt( 1 );

			if ((q === ' ') || (q === '-')) {
				// do nothing
			} else if (q === 'r') {
				ctx.fillStyle = '#808080';
				ctx.fillRect( xdraw, ydraw, 49, 49 );				
			} else if (q === 'p') {
				imgdrawat( 'park', x, y );
			} else if (p === 'f') {
				imgdrawat( q + 'fact', x, y );
			} else if (_.contains( playerColors, p )) {
				if (_.contains( factoryQuadrants, q )) {
					imgdrawat( q + 'out', x, y );
				}
				imgdrawat( p + 'mark', x, y );
			} else {
				console.log( 'ERROR: impossible case in drawBoard' );
			}
		}

		for (var i = 0; i < 5; i++ ) {
			playerMark = playerTurnOrder[i].color + 'mark';
			turnString += "<img id='" + playerMark + "' src='" + playerMark + ".png'>" + playerTurnOrder[i].markersRemaining;
		}
		$( '#turnorder' ).html( turnString );
		$( '#' + playerPieceImg ).css( 'border', 'solid 3px black' );
	}
}

function firstmousemove( e ) {
	var i, j, x, y, xsq, ysq, xboard, yboard;

	drawBoard();
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

function mouseleave( e ) {
	var x, y, xsq, ysq, xboard, yboard, at, targetlist = [];

	x = e.pageX - this.offsetLeft;
	y = e.pageY - this.offsetTop;
	xsq = Math.floor( x/50 );
	ysq = Math.floor( y/50 );
	xboard = xsq + 1;
	yboard = ysq + 1;
	at = board[xboard][yboard];

	drawBoard();
	if (turn === 1) {
		for (var i = 1; i <= 10; i++) {
			for (var j = 1; j <= 10; j++) {
				if (board[i][j] === 0) {
					imgdrawat( 'tar', i, j );
				}
			}
		}
		return;
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
	selpiece = tile;
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
		emptyremaining--;
	} else if (selpiece.substring( 2, 5 ) === 'out') {
		board[xboard][yboard] = selpiece;
		emptyremaining--;
		checkspec( board, xboard, yboard );
	}

	findroads( board );

	testx = xboard - 1;
	testy = yboard;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substring( 2, 5 );
		if ((s === 'out') || (s === 'act')) {
			checkspec( board, testx, testy );
		}
	}
	testx = xboard + 1;
	testy = yboard;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substring( 2, 5 );
		if ((s === 'out') || (s === 'act')) {
			checkspec( board, testx, testy );
		}
	}
	testx = xboard;
	testy = yboard - 1;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substring( 2, 5 );
		if ((s === 'out') || (s === 'act')) {
			checkspec( board, testx, testy );
		}
	}
	testx = xboard;
	testy = yboard + 1;
	type = board[testx][testy];
	if ((type !== 0) && (type !== -1)) {
		s = type.substr( 2, 5 );
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
		turn++;
	}
	player = turnorder[playerturn];
	selpiece = players[player][0] + 'mark';
	playerpiece = selpiece;
	$( '#' + playerpiece ).css( 'border', 'solid 3px black' );
	if (players[player][1]) {
		action = 'mark';
		if (players[player][3].length) {
			$( '#pick' ).html( "<button id='pickbtn'>Pick</button>" );	
			$( '#pickbtn' ).click( pick );			
		} else {
			$( '#pick' ).html( 'foo' );	
		}
	} else if (adjlist) {
		action = 'pick';
		pick();
	} else {
		nextplayer();
		console.log( 'TODO: check for end of game' );
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
			players[player][3].push( [xboard, yboard] );
			players[player][1]--;
		}
		nextplayer();
		if (turn === 2) {
			$( '#board' ).off( 'mousemove' );		
			$( '#board' ).mousemove( mousemove );
			updateadjlist();
		}
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
		}
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
	} else {
		console.log( 'invalid action');
	}
	nextplayer();
	updateadjlist();
	drawboard();
}

$( document ).ready( function(){
	var playerMarkImg, turnStr = '';

	ctx = document.getElementById( 'board' ).getContext( '2d' );

	playerTurnOrder = _.shuffle( playerTurnOrder );

	for (var i = 0; i < 5; i++ ) {
		playerMarkImg = playerTurnOrder[i].color + 'mark';
		turnStr += "<img id='" + playerMarkImg + "' src='" + playerMarkImg + ".png'>" + playerTurnOrder[i].markersRemaining;
	}
	$( '#turnorder' ).html( turnStr );

	playerOnTurn = 0;
	selectedPieceImg = playerTurnOrder[0].color + 'mark';
	playerPieceImg = selectedPieceImg;
	$( '#' + selectedPieceImg ).css( 'border', 'solid 3px black' );

	board[ _.random( 6, 10 ) ][ _.random( 6, 10 ) ] = 'bf';
	board[ _.random( 6, 10 ) ][ _.random( 1, 5 ) ] = 'cf';
	board[ _.random( 1, 5 ) ][ _.random( 1, 5 ) ] = 'df';

	findRoads( board );

	$( '#board' ).mousemove( firstmousemove );
	$( '#board' ).mouseleave( mouseleave );	
	$( '#board' ).click( click );
	$( '#pick' ).html( '' );	
	$( '#undo' ).click( undo );
	$( '#done' ).click( done );

	drawBoard();
} );
