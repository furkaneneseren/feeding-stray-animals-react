import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';
import "./navbar.css";
import logofeedme from './logofeedme.png';
function Navbar() {
    const [click, setClick] = useState(false);
    const handleClick = () => setClick(!click);
    return (
        <nav className="navbar" >
            <div className="container-nav">
                <NavLink exact to="/" className="logo">
                <img src={logofeedme} alt="logo"/>
                </NavLink>
                <ul 
                className={click ? "menu active" :"menu" }>
                    <li className="item">
                        <NavLink exact to="/"
                            className="link"
                            onClick={handleClick}>
                            Home
                        </NavLink>
                    </li>
                    <li className="item">
                        <NavLink exact to="/login"
                            className="link"
                            onClick={handleClick}>
                            Login
                        </NavLink>
                    </li>
                    <li className="item">
                        <NavLink exact to="/signup"
                            className="link"
                            onClick={handleClick}>
                            Sign Up
                        </NavLink>
                    </li>
                </ul>
                <div className="icon" onClick={handleClick}>
                    <i
                        className=
                        {click ? "fas fa-times" : "fas fa-bars"}>
                    </i>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;