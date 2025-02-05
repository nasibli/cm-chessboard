/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {Chessboard} from "../src/cm-chessboard/Chessboard.js"
import {FEN} from "../src/cm-chessboard/model/Position.js"

describe("TestBoard", () => {

    // https://github.com/shaack/cm-chessboard/issues/47
    it("should create and immediately destroy a board without failure", () => {
        const chessboard = new Chessboard(document.getElementById("TestBoard"), {
            sprite: {url: "../assets/images/chessboard-sprite.svg"},
            position: FEN.start
        })
        chessboard.destroy()
    })

    it("should create and destroy a board", () => {
        const chessboard = new Chessboard(document.getElementById("TestBoard"), {
            sprite: {url: "../assets/images/chessboard-sprite.svg"},
            position: FEN.start
        })
        assert.equal(chessboard.view.context.childNodes.length, 1)
        chessboard.destroy()
        assert.equal(chessboard.state, undefined)
    })

})
