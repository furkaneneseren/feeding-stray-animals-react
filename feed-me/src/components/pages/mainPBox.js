import React from 'react'

function MainPBox(props) {
    return (
        <div className="a-box">
            <div className="a-b-img">
                <img src={props.image} alt=""/>
            </div>
            <div className="s-b-text">
                <h5>{props.title}</h5>
            </div>
        </div>
    )
}
export default MainPBox;