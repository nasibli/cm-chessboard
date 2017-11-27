# svjs-chessboard

The chessboard for [chessmail.eu](https://www.chessmail.eu) / [chessmail.de](https://www.chessmail.de)

Very lightweight, implemented in SVG, written in ES6 and almost no external dependencies.

- Demo: [http://shaack.com/projekte/svjs-chessboard/](http://shaack.com/projekte/svjs-chessboard/)
- Repository: [https://github.com/shaack/svjs-chessboard](https://github.com/shaack/svjs-chessboard)

## Install

`npm install`

## Configuration

With default values
```
this.config = {
    sprite: "../assets/sprite.svg", // figures and markers
    initialPosition: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    initialOrientation: 'white',
    responsive: false,
    spriteGrid: 40,
    interactiveMoveMode: MOVE_MODE_LIVE,
    onBeforeMove: null, // callback, before interactive move, return true for ok
    onAfterMove: null // callback after interactive move
};
```  

## API (not implemented yet)

### fen(string fen)
- Set the position as fen

### enableMoves(boolean enable)
- Enable interactive moving

### callbacks

#### onBeforeMove(fieldFrom, fieldTo)
- Click oder drag allowed

#### onAfterMove(fieldFrom, fieldTo)
- Click oder drag allowed


