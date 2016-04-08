"use strict";

var ctx;
var selectedPiece = '', playerPieceImg = '', action = 'mark';
var colors = [ 'r', 'g', 'b', 'c', 'm' ];
var quadrants = [ 'a', 'b', 'c', 'd' ];
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

function at( board, pt ) {
	return (board[ pt.y ][ pt.x ]);
}

function put( board, pt, label ) {
	board[ pt.y ][ pt.x ] = label;
}

function isRoad( board, pt ) {
	return (board[ pt.y ][ pt.x ] === 'oo');
}

function isMarker( board, pt ) {
	return (board[ pt.y ][ pt.x ].charAt( 0 ) === 'm' );
}

function isEmpty( board, pt ) {
	return (board[ pt.y ][ pt.x ] === '  ');
}

function isFillable( board, pt ) {
	return (isRoad( board, pt ) || isMarker( board, pt ) || isEmpty( board, pt ));
}

function isSpecial( board, pt ) {
	return (_.contains( quadrants, at( board, pt ).slice( 0, 1 ) ));
}

function isBuilding( board, pt ) {
	return ((board[ pt.y ][ pt.x ] === 'pk') || isSpecial( board, pt ));
}

function isPiece( board, pt ) {
	var p = at( board, pt );
	return ((p !== '  ') && (p !== '--'));
}

function hasPieceAdjacent( board, xsq, ysq ) {
	return (
		isPiece( board, { x: xsq, y: ysq - 1 } ) ||
		isPiece( board, { x: xsq - 1, y: ysq } ) ||
		isPiece( board, { x: xsq + 1, y: ysq } ) ||
		isPiece( board, { x: xsq, y: ysq + 1 } )
		);
}

function fillTest( tempBoard, testx, testy, front ) {
	if (isFillable( tempBoard, { x: testx, y: testy } )) {
		tempBoard[ testy ][ testx ] = 'fl';
		front.push( { x: testx, y: testy } );
	}
}

// flood fill algorithm
function flood( tempBoard, x, y ) {
	var front, oldFront;

	front = [];
	fillTest( tempBoard, x, y, front );

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
			if (isFillable( bd, { x: x, y: y } )) {
				pt.x = x;
				pt.y = y;
				return pt;
			}
		}
	}
}

// test a square to see if it should be a road:  block it, flood fill an area, and see if any squares are not flooded
function testRoad( pt ) {
	var tempBoard = $.extend( true, [], board );
	var tempPt = { x: 0, y: 0 };

	tempBoard[ pt.y ][ pt.x ] = 'pk';
	findFillable( tempBoard, tempPt );
	flood( tempBoard, tempPt.x, tempPt.y );
	tempPt = { x: 0, y: 0 };
	findFillable( tempBoard, tempPt );

	return (tempPt.x || tempPt.y);
}

function findRoads( board ) {
	var pt;
	for (var x = 1; x <= 10; x++) {
		for (var y = 1; y <= 10; y++) {
			pt = { x: x, y: y };
			if (isEmpty( board, pt ) || isMarker( board, pt )) {
				if (testRoad( pt )) {
					put( board, pt, 'oo' );
					emptySquaresRemaining--;
					if (isMarker( board, pt )) {
						markerToRoad( { x: x, y: y });
					}	
				}
			}
		}
	}
	updateAdjacentList();
}

function markerToRoad( pt ) {

	function predicate( testpt ) {
		return ((pt.x === testpt.x) && (pt.y === testpt.y));
	}
	for (var i = 0; i < 5; i++) {
		if (_.findWhere( playerTurnOrder[i].markedSpaces, pt )) {
			playerTurnOrder[i].markedSpaces = _.reject( playerTurnOrder[i].markedSpaces);
			playerTurnOrder[i].markersRemaining++;
			return;
		}
	}
	console.log( 'ERROR: no marker found in markerToRoad()' );
}

function checkSpecial( board, x, y ) {
	var nPt = { x: x, y: y - 1 };
	var ePt = { x: x + 1, y: y };
	var wPt = { x: x - 1, y: y };
	var sPt = { x: x, y: y + 1 };
	var adjCount = (
		(isBuilding( board, nPt ) || (at( board, nPt ) === '--')) +
		(isBuilding( board, ePt ) || (at( board, ePt ) === '--')) +
		(isBuilding( board, wPt ) || (at( board, wPt ) === '--')) +
		(isBuilding( board, sPt ) || (at( board, sPt ) === '--'))
	);

	if (adjCount === 3) {
		if (isEmpty( board, nPt ) || isMarker( board, nPt )) {
			put( board, nPt, 'oo');
			emptySquaresRemaining--;
			if (isMarker( board, nPt )) {
				markerToRoad( nPt );
			}
		} else if (isEmpty( board, ePt ) || isMarker( board, ePt )) {
			put( board, ePt, 'oo');
			emptySquaresRemaining--;
			if (isMarker( board, ePt )) {
				markerToRoad( board, ePt );
			}
		} else if (isEmpty( board, wPt ) || isMarker( board, wPt )) {
			put( board, wPt, 'oo');
			emptySquaresRemaining--;
			if (isMarker( board, wPt )) {
				markerToRoad( board, wPt );
			}
		} else if (isEmpty( board, sPt ) || isMarker( board, sPt )) {
			put( board, sPt, 'oo');
			emptySquaresRemaining--;
			if (isMarker( board, sPt )) {
				markerToRoad( board, sPt );
			}
		} else {
			console.log( 'ERROR: impossilbe case in checkSpecial()' );
		}
	}
	updateAdjacentList();
}

function updateAdjacentList() {
	adjacentList = [];
	for (var i = 1; i <= 10; i++) {
		for (var j = 1; j <= 10; j++) {
			if (isEmpty( board, { x: i, y: j } ) && hasPieceAdjacent( board, i, j )) {
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

			q = at( board, { x: x, y: y } ).charAt( 0 );
			p = at( board, { x: x, y: y } ).charAt( 1 );

			if ((q === ' ') || (q === '-')) {
				// do nothing
			} else if (q === 'o') {
				ctx.fillStyle = '#808080';
				ctx.fillRect( xdraw, ydraw, 49, 49 );				
			} else if (q === 'p') {
				imgDrawAt( 'park', x, y );
			} else if (p === 'f') {
				imgDrawAt( q + 'fact', x, y );
			} else if (_.contains( colors, p )) {
				if (_.contains( quadrants, q )) {
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
			if (at( board, { x: i, y: j } ) === '  ') {
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
	var pt = { x: Math.ceil( x/50 ), y:  Math.ceil( y/50 ) };

	drawBoardFirst();
	if (isEmpty( board, pt )) {
		imgDrawAt( playerPieceImg, pt.x, pt.y );
	}
}

function mousemoveMark( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var pt = { x: Math.ceil( x/50 ), y:  Math.ceil( y/50 ) };

	drawBoardMark();
	if (isEmpty( board, pt )) {
		imgDrawAt( playerPieceImg, pt.x, pt.y );
	}
}

function mousemovePlace( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var pt = { x: Math.ceil( x/50 ), y:  Math.ceil( y/50 ) };
	var placeTargets = playerTurnOrder[playerOnTurn].markedSpaces;

	drawBoard();
	if (isEmpty( board, pt ) || (_.findWhere( placeTargets, pt ))) {
		imgDrawAt( 'park', pt.x, pt.y );
	}
	for (var i = 0; i < placeTargets.length; i++) {
		imgDrawAt( 'picktar', placeTargets[i].x, placeTargets[i].y );
	}
}

function clickFirst( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var pt = { x: Math.ceil( x/50 ), y:  Math.ceil( y/50 ) };

	if (isEmpty( board, pt )) {
		boardHistory.push( board );
		board = $.extend( true, [], board );
		put( board, pt, selectedPiece );
		playerTurnOrder[playerOnTurn].markersRemaining--;
		playerTurnOrder[playerOnTurn].markedSpaces.push( pt );
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
	var pt = { x: Math.ceil( x/50 ), y:  Math.ceil( y/50 ) };
	var thisPlayer = playerTurnOrder[playerOnTurn];

	if (!_.findWhere( adjacentList, pt )) {
		return;
	}

	boardHistory.push( board );
	board = $.extend( true, [], board );

	put( board, pt, selectedPiece );
	if (thisPlayer.markersRemaining) {
		thisPlayer.markedSpaces.push( pt );
		thisPlayer.markersRemaining--;
		nextPlayer();
		updateAdjacentList();
		drawBoard();
	}

	for (var i = 0; i < adjacentList.length; i++) {
		imgDrawAt( 'tar', adjacentList[i].x, adjacentList[i].y )
	}
}

function clickPlace( e ) {
	var x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop;
	var pt = { x: Math.ceil( x/50 ), y:  Math.ceil( y/50 ) };
	var testPt = { x: 0, y: 0 };

	if (!_.findWhere( playerTurnOrder[playerOnTurn].markedSpaces, pt )) {
		return;
	}

	boardHistory.push( board );
	board = $.extend( true, [], board );

	put( board, pt, 'pk' );
	emptySquaresRemaining--;

	findRoads( board );

	testPt = { x: pt.x - 1, y: pt.y };
	if  (isSpecial( board, testPt )) {
		checkSpecial( board, testPt.x, testPt.y );
	}
	testPt = { x: pt.x + 1, y: pt.y };
	if  (isSpecial( board, testPt )) {
		checkSpecial( board, testPt.x, testPt.y );
	}
	testPt = { x: pt.x, y: pt.y - 1 };
	if  (isSpecial( board, testPt )) {
		checkSpecial( board, testPt.x, testPt.y );
	}
	testPt = { x: pt.x, y: pt.y + 1 };
	if  (isSpecial( board, testPt )) {
		checkSpecial( board, testPt.x, testPt.y );
	}
	drawBoard();	
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
	nextPlayer();
	drawBoard;
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
