import React from 'react'
import howtoPic from './howtoPet.png'
function WhatIs() {
    return (
        <div id="whatis">

            <div className="whatis-text">
                <h2>What is Feed Me?</h2>
                <p>Feed me is an application developed for stray animals.
                    Volunteers use this app to find stray animals that need feeding. </p>
                <p> </p>
            </div>
            <div className="whatis-image">
                <img src={howtoPic} alt='' />
            </div>
        </div>
    )
}
export default WhatIs;