import React from 'react';
import Game from './components/game/game.js';
import './App.css';

const App = ()=>{
    return (
        <div className="appRoot">
            <div className="leftBar"></div>
            <Game/>
            <div className="rightBar"></div>
        </div>
    );
}

export default App;