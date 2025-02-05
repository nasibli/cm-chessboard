/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

import {ChessboardState} from "./model/ChessboardState.js"
import {FEN, Position} from "./model/Position.js"
import {PositionAnimationsQueue} from "./view/PositionAnimationsQueue.js"
import {EXTENSION_POINT} from "./model/Extension.js"
import {ChessboardView} from "./view/ChessboardView.js"

export const COLOR = {
    white: "w",
    black: "b"
}
export const INPUT_EVENT_TYPE = {
    moveInputStarted: "moveInputStarted",
    validateMoveInput: "validateMoveInput",
    moveInputCanceled: "moveInputCanceled"
}
export const SQUARE_SELECT_TYPE = {
    primary: "primary",
    secondary: "secondary"
}
export const BORDER_TYPE = {
    none: "none", // no border
    thin: "thin", // thin border
    frame: "frame" // wide border with coordinates in it
}
export const MARKER_TYPE = {
    frame: {class: "marker-frame", slice: "markerFrame"},
    square: {class: "marker-square", slice: "markerSquare"},
    dot: {class: "marker-dot", slice: "markerDot"},
    circle: {class: "marker-circle", slice: "markerCircle"}
}
export const PIECE = {
    wp: "wp", wb: "wb", wn: "wn", wr: "wr", wq: "wq", wk: "wk", ww: "ww", wc: "wc",
    bp: "bp", bb: "bb", bn: "bn", br: "br", bq: "bq", bk: "bk", bw: "bw", bc: "bc",
}

export class Chessboard {

    constructor(context, props = {}) {
        if (!context) {
            throw new Error("container element is " + context)
        }
        this.context = context
        this.id = (Math.random() + 1).toString(36).substring(2, 8)
        this.extensions = []
        let defaultProps = {
            position: FEN.empty, // set as fen, can use FEN.start or FEN.empty
            orientation: COLOR.white, // white on bottom
            responsive: true, // resize the board automatically to the size of the context element
            animationDuration: 300, // pieces animation duration in milliseconds. Disable all animation with `0`.
            language: navigator.language.substring(0, 2).toLowerCase(), // supports "de" and "en" for now, used for pieces naming
            style: {
                cssClass: "default", // set the css theme of the board, try "green", "blue" or "chess-club"
                showCoordinates: true, // show ranks and files
                borderType: BORDER_TYPE.none, // "thin" thin border, "frame" wide border with coordinates in it, "none" no border
                aspectRatio: 1, // height/width of the board
                moveFromMarker: MARKER_TYPE.frame, // the marker used to mark the start square
                moveToMarker: MARKER_TYPE.frame, // the marker used to mark the square where the figure is moving to
            },
            sprite: {
                url: "./assets/images/chessboard-sprite.svg", // pieces and markers are stored in a sprite file
                size: 40, // the sprite tiles size, defaults to 40x40px
                cache: true // cache the sprite
            },
            extensions: [ /* {class: ExtensionClass, props: { ... }} */] // add extensions here
        }
        this.props = {}
        Object.assign(this.props, defaultProps)
        Object.assign(this.props, props)
        this.props.sprite = defaultProps.sprite
        this.props.style = defaultProps.style
        if (props.sprite) {
            Object.assign(this.props.sprite, props.sprite)
        }
        if (props.style) {
            Object.assign(this.props.style, props.style)
        }
        if (props.extensions) {
            this.props.extensions = props.extensions
        }
        if (this.props.language !== "de" && this.props.language !== "en") {
            this.props.language = "en"
        }

        this.state = new ChessboardState()
        this.view = new ChessboardView(this)
        this.positionAnimationsQueue = new PositionAnimationsQueue(this)
        this.state.orientation = this.props.orientation
        // instantiate extensions
        for (const extensionData of this.props.extensions) {
            this.extensions.push(new extensionData.class(this, extensionData.props))
        }
        this.view.redrawBoard()
        this.state.position = new Position(this.props.position)
        this.view.redrawPieces()
        this.state.invokeExtensionPoints(EXTENSION_POINT.positionChanged)
    }

    // API //

    async setPiece(square, piece, animated = false) {
        const positionFrom = this.state.position.clone()
        this.state.position.setPiece(square, piece)
        this.state.invokeExtensionPoints(EXTENSION_POINT.positionChanged)
        return this.positionAnimationsQueue.enqueuePositionChange(positionFrom, this.state.position.clone(), animated)
    }

    async movePiece(squareFrom, squareTo, animated = false) {
        const positionFrom = this.state.position.clone()
        this.state.position.movePiece(squareFrom, squareTo)
        this.state.invokeExtensionPoints(EXTENSION_POINT.positionChanged)
        return this.positionAnimationsQueue.enqueuePositionChange(positionFrom, this.state.position.clone(), animated)
    }

    async setPosition(fen, animated = false) {
        const positionFrom = this.state.position.clone()
        const positionTo = new Position(fen)
        if(positionFrom.getFen() !== positionTo.getFen()) {
            this.state.position.setFen(fen)
            this.state.invokeExtensionPoints(EXTENSION_POINT.positionChanged)
        }
        return this.positionAnimationsQueue.enqueuePositionChange(positionFrom, this.state.position.clone(), animated)
    }

    async setOrientation(color, animated = false) {
        const position = this.state.position.clone()
        if (this.boardTurning) {
            console.log("setOrientation is only once in queue allowed")
            return
        }
        this.boardTurning = true
        return this.positionAnimationsQueue.enqueueTurnBoard(position, color, animated).then(() => {
            this.boardTurning = false
            this.state.invokeExtensionPoints(EXTENSION_POINT.boardChanged)
        })
    }

    getPiece(square) {
        return this.state.position.getPiece(square)
    }

    getPosition() {
        return this.state.position.getFen()
    }

    getOrientation() {
        return this.state.orientation
    }

    addMarker(type, square) {
        this.state.addMarker(square, type)
        this.view.drawMarkers()
    }

    getMarkers(type = undefined, square = undefined) {
        const markersFound = []
        this.state.markers.forEach((marker) => {
            const markerSquare = marker.square
            if (!square && (!type || type === marker.type) ||
                !type && square === markerSquare ||
                type === marker.type && square === markerSquare) {
                markersFound.push({square: marker.square, type: marker.type})
            }
        })
        return markersFound
    }

    removeMarkers(type = undefined, square = undefined) {
        this.state.removeMarkers(square, type)
        this.view.drawMarkers()
    }

    enableMoveInput(eventHandler, color = undefined) {
        this.view.enableMoveInput(eventHandler, color)
    }

    disableMoveInput() {
        this.view.disableMoveInput()
    }

    enableSquareSelect(eventHandler) {
        if (this.squareSelectListener) {
            console.warn("squareSelectListener already existing")
            return
        }
        this.squareSelectListener = function (e) {
            const square = e.target.getAttribute("data-square")
            if (e.type === "contextmenu") {
                // disable context menu
                e.preventDefault()
                return
            }
            eventHandler({
                mouseEvent: e,
                chessboard: this,
                type: e.button === 2 ? SQUARE_SELECT_TYPE.secondary : SQUARE_SELECT_TYPE.primary,
                square: square
            })
        }
        this.context.addEventListener("contextmenu", this.squareSelectListener)
        this.context.addEventListener("mousedown", this.squareSelectListener)
        this.context.addEventListener("mouseup", this.squareSelectListener)
        this.context.addEventListener("touchstart", this.squareSelectListener)
        this.context.addEventListener("touchend", this.squareSelectListener)
        this.state.squareSelectEnabled = true
        this.view.visualizeInputState()
    }

    disableSquareSelect() {
        this.context.removeEventListener("contextmenu", this.squareSelectListener)
        this.context.removeEventListener("mousedown", this.squareSelectListener)
        this.context.removeEventListener("mouseup", this.squareSelectListener)
        this.context.removeEventListener("touchstart", this.squareSelectListener)
        this.context.removeEventListener("touchend", this.squareSelectListener)
        this.squareSelectListener = undefined
        this.state.squareSelectEnabled = false
        this.view.visualizeInputState()
    }

    destroy() {
        this.state.invokeExtensionPoints(EXTENSION_POINT.destroy)
        this.positionAnimationsQueue.destroy()
        this.view.destroy()
        this.view = undefined
        this.state = undefined
        if (this.squareSelectListener) {
            this.context.removeEventListener("contextmenu", this.squareSelectListener)
            this.context.removeEventListener("mouseup", this.squareSelectListener)
            this.context.removeEventListener("touchend", this.squareSelectListener)
        }
    }

}
