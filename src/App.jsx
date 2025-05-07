
import React from "react";

import "./App.css";
import Fire from "./assets/fire-gif.gif";
import Star from "./assets/star-gif.gif";
import Party from "./assets/happy-gif.gif";
import Navbar from "./components/Navbar/Navbar";
import MovieList from "./components/MovieList/MovieList";

const App = () => {
    return (
        <div className='app'>
            <Navbar />

            <MovieList type='popular' title='Popular' emoji={Fire} />
            <MovieList type='top_rated' title='Top Rated' emoji={Star} />
            <MovieList type='upcoming' title='Upcoming' emoji={Party} />
        </div>
    );
};

export default App;
