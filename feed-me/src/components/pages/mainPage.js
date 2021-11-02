import React from 'react'
import MainPBox from './mainPBox'
import locationpic from './images/locationpic.png'
import loginpic from './images/loginpic.png'
import foodpic from './images/foodpic.png'
import petpic from './images/petpic.png'

function MainPage() {
    return (
        <div id="features">
            <h3>How to use?</h3>
            <div className="a-container">
                <MainPBox image={loginpic} title="Login your account."/>
                <MainPBox image={locationpic} title="Check an available and the closest place to you." />
                <MainPBox image={foodpic} title="Go to the place that you found with your food." />
                <MainPBox image={petpic} title="Now you can feed our cute friends."/>
            </div>
        </div>
    )
}
export default MainPage;