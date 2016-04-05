"use strict";

var ctx;
var selectedPiece = '', playerPieceImg = '', action = 'mark';
var playerColors = [ 'r', 'g', 'b', 'c', 'm' ];
var factoryQuadrants = [ 'a', 'b', 'c', 'd' ];
var players = {}, playerTurnOrder = [], playerOnTurn = 0, gameTurn = 1;
/*
board squares are labeled with two chars.
'--' is the edge of the board (off the board).
'  ' is a square with nothing on it.
'Qf' is a factory. Q is the quadrant (a, b, c, d), starting at the NW and going clockwise.
'QP' is a players outlet. Q is the corresponding factory, P is the player (r, g, b, c, m).
'mP' is a players marker.
'oo' is a road.
'pk' is a park.
May be temporarily set to 'fl' when testing by flood-filling.
*/
var board = [
[ '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'af', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
[ '--', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '--' ],
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
		markedSpaces: [],
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

function at( board, x, y ) {
	return (board[y][x]);
}

function put( board, x, y, label ) {
	board[y][x] = label;
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
	return (board[y][x] === 'oo');
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

function isPiece( x, y ) {
	var p = board[y][x];
	return ((p !== '  ') && (p !== '--'));
}

function hasPieceAdjacent( xsq, ysq ) {
	return (
		isPiece( xsq, ysq - 1 ) ||
		isPiece( xsq - 1, ysq ) ||
		isPiece( xsq + 1, ysq ) ||
		isPiece( xsq, ysq + 1 )
		);
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

function updateAdjacentList() {
	adjacentList = [];
	for (var i = 1; i <= 10; i++) {
		for (var j = 1; j <= 10; j++) {
			if (isEmpty( i, j ) && hasPieceAdjacent( i, j )) {
				adjacentList.push( { x: i, y: j } );
			}
		}
	}
}

function nextPlayer() {
	var player;

	playerOnTurn++;
	if (playerOnTurn === 5) {
		playerOnTurn = 0;
		gameTurn++;
	}
	player = playerTurnOrder[ playerOnTurn ];
	selectedPiece = 'm' + player.color;
	playerPieceImg = player.color + 'mark';
	$( '#' + playerPieceImg ).css( 'border', 'solid 3px black' );
	if (player.markersRemaining && (player.markedSpaces.length < 6)) {
		action = 'mark';
		if (player.markedSpaces.length) {
			$( '#pick' ).html( "<button id='pickbtn'>Pick</button>" );	
			$( '#pickbtn' ).click( pick );			
		} else {
			$( '#pick' ).html( '' );	
		}
	} else if (adjacentList) {
		action = 'pick';
		pick();
	} else {
		nextPlayer();
		console.log( 'TODO: check for end of game' );
	}
}

function imgDrawAt( piece, xsq, ysq ){
	ctx.drawImage( $( '#' + piece )[0], xsq*50 - 45 , ysq*50 - 45 )
}

function drawBoard() {
	var x = 0, y = 0, xdraw = 0, ydraw = 0;
	var q = '', p = '';
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

			q = at( board, x, y ).charAt( 0 );
			p = at( board, x, y ).charAt( 1 );

			if ((q === ' ') || (q === '-')) {
				// do nothing
			} else if (q === 'o') {
				ctx.fillStyle = '#808080';
				ctx.fillRect( xdraw, ydraw, 49, 49 );				
			} else if (q === 'p') {
				imgDrawAt( 'park', x, y );
			} else if (p === 'f') {
				imgDrawAt( q + 'fact', x, y );
			} else if (_.contains( playerColors, p )) {
				if (_.contains( factoryQuadrants, q )) {
					imgDrawAt( q + 'out', x, y );
				}
				imgDrawAt( p + 'mark', x, y );
			} else {
				console.log( 'ERROR: impossible case in drawBoard' );
			}
		}
	}
	for (var i = 0; i < 5; i++ ) {
		playerMark = playerTurnOrder[i].color + 'mark';
		turnString += "<img id='" + playerMark + "' src='" + playerMark + ".png'>" + playerTurnOrder[i].markersRemaining;
	}
	$( '#turnorder' ).html( turnString );
	$( '#' + playerPieceImg ).css( 'border', 'solid 3px black' );
}

function drawBoardFirst() {
	drawBoard();
	for (var i = 1; i <= 10; i++) {
		for (var j = 1; j <= 10; j++) {
			if (at( board, i, j ) === '  ') {
				imgDrawAt( 'tar', i, j );
			}
		}
	}
}

function drawBoardMark() {
	drawBoard();
	for (var i = 0; i < adjacentList.length; i++) {
		imgDrawAt( 'tar', adjacentList[i].x, adjacentList[i].y )
	}
}

function drawBoardPlace () {
	var placeTargets = playerTurnOrder[playerOnTurn].markedSpaces;

	drawBoard();
	for (var i = 0; i < placeTargets.length; i++) {
		imgDrawAt( 'picktar', placeTargets[i].x, placeTargets[i].y );
	}
}

function mousemoveFirst( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var xsq = Math.ceil( x/50 ), ysq = Math.ceil( y/50 );

	drawBoardFirst();
	if (isEmpty( xsq, ysq )) {
		imgDrawAt( playerPieceImg, xsq, ysq );
	}
}

function mousemoveMark( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var xsq = Math.ceil( x/50 ), ysq = Math.ceil( y/50 );

	drawBoardMark();
	if (isEmpty( xsq, ysq )) {
		imgDrawAt( playerPieceImg, xsq, ysq );
	}
}

function mousemovePlace( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var xsq = Math.ceil( x/50 ), ysq = Math.ceil( y/50 );
	var placeTargets = playerTurnOrder[playerOnTurn].markedSpaces;

	drawBoard();
	if (isEmpty( xsq, ysq ) || (_.findWhere( placeTargets, { x: xsq, y: ysq } ))) {
		imgDrawAt( 'park', xsq, ysq );
	}
	for (var i = 0; i < placeTargets.length; i++) {
		imgDrawAt( 'picktar', placeTargets[i].x, placeTargets[i].y );
	}
}

function clickFirst( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var xsq = Math.ceil( x/50 ), ysq = Math.ceil( y/50 );

	if (isEmpty( xsq, ysq )) {
		boardHistory.push( board );
		board = $.extend( true, [], board );
		put( board, xsq, ysq, selectedPiece );
		playerTurnOrder[playerOnTurn].markersRemaining--;
		playerTurnOrder[playerOnTurn].markedSpaces.push( { x: xsq, y: ysq } );
	}
	nextPlayer();
	if (gameTurn === 2) {
		$( '#board' ).off( 'mousemove' );		
		$( '#board' ).mousemove( mousemoveMark );
		$( '#board' ).off( 'click' );		
		$( '#board' ).click( clickMark );
		$( '#board' ).off( 'mouseleave' );		
		$( '#board' ).mouseleave( drawBoardMark );
		updateAdjacentList();
	}
	drawBoard();
}

function clickMark( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var xsq = Math.ceil( x/50 ), ysq = Math.ceil( y/50 );
	var thisPlayer = playerTurnOrder[playerOnTurn];

	if (_.findWhere( adjacentList, { x: xsq, y: ysq } )) {
		boardHistory.push( board );
		board = $.extend( true, [], board );
		board[ ysq ][ xsq ] = selectedPiece;	
		if (thisPlayer.markersRemaining) {
			thisPlayer.markedSpaces.push( { x: xsq, y: ysq } );
			thisPlayer.markersRemaining--;
			nextPlayer();
			updateAdjacentList();
			drawBoard();
		} else {
			console.log( 'ERROR: tried to mark with none left' );
		}
	}
	for (var i = 0; i < adjacentList.length; i++) {
		imgDrawAt( 'tar', adjacentList[i].x, adjacentList[i].y )
	}
}

function clickPlace( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var xsq = Math.ceil( x/50 ), ysq = Math.ceil( y/50 );
	var placeTargets = playerTurnOrder[playerOnTurn].markedSpaces;

	if (_.findWhere( placeTargets, { x: xsq, y: ysq } )) {
		console.log( 'TODO: place a bldg' );
	}
}

function pick() {
	$( '#pick' ).html( "<img src='park.png'>" );
	selectedPiece = 'pk';
	$( '#board' ).off( 'mousemove' );		
	$( '#board' ).mousemove( mousemovePlace );
	$( '#board' ).off( 'click' );		
	$( '#board' ).click( clickPlace );
	$( '#board' ).off( 'mouseleave' );		
	$( '#board' ).mouseleave( drawBoardPlace );
}

function undo() {
}

function done() {
	nextplayer();
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
	selectedPiece = 'm' + playerTurnOrder[0].color;
	playerPieceImg = playerTurnOrder[0].color + 'mark';
	$( '#' + playerPieceImg ).css( 'border', 'solid 3px black' );

	board[ _.random( 6, 10 ) ][ _.random( 6, 10 ) ] = 'bf';
	board[ _.random( 6, 10 ) ][ _.random( 1, 5 ) ] = 'cf';
	board[ _.random( 1, 5 ) ][ _.random( 1, 5 ) ] = 'df';

	findRoads( board );

	$( '#board' ).mousemove( mousemoveFirst );
	$( '#board' ).mouseleave( drawBoardFirst );	
	$( '#board' ).click( clickFirst );
	$( '#pick' ).html( '' );	
	$( '#undo' ).click( undo );
	$( '#done' ).click( done );

	drawBoard();
} );
