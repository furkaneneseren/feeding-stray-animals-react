import React from 'react'
import MainPage from './mainPage'
import './home.css'
import WhatIs from './whatis'
import Footer from '../footer'
function Home() {
    return (
        <div className="home" id="main">
            
            <h6>
                <WhatIs/>
            </h6>
                <MainPage />
                <Footer/>
        </div>
    )
}
export default Home;