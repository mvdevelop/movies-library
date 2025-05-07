
import React from "react";

import "./Navbar.css";
import DarkMode from "../DarkMode/DarkMode";
import Fire from "../../assets/fire-gif.gif";
import Star from "../../assets/star-gif.gif";
import Party from "../../assets/happy-gif.gif";

const Navbar = () => {
    return (
        <nav className='navbar'>
            <h1>Movies Library</h1>
            
            <div className='navbar_links'>
                <DarkMode />
                <a href='#popular'>
                    Popular{" "}
                    <img src={Fire} alt='fire emoji' className='navbar_emoji' />
                </a>
                <a href='#top_rated'>
                    Top Rated{" "}
                    <img src={Star} alt='star emoji' className='navbar_emoji' />
                </a>
                <a href='#upcoming'>
                    Upcoming{" "}
                    <img
                        src={Party}
                        alt='party face emoji'
                        className='navbar_emoji'
                    />
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
