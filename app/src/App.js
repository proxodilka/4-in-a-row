import React, {useEffect, useState} from 'react';
import {HashRouter, Route} from 'react-router-dom';
import Game from './components/game/game.js';
import GameOver from './components/game-over/game-over.js';
import Setup from './components/setup/setup.js';
import Multiplayer from './components/multiplayer/multiplayer';
import './App.css';
import GameHeader from './components/game-header/game-header.js';

const App = ()=>{

    return (
        <div className="appRoot">
            <HashRouter>
                <Route path='/' exact component={Setup} />
                <Route path='/game' exact component={Game} />
                <Route path='/gameover' exact component={GameOver} /> 
                <Route path='/multiplayer' exact component={Multiplayer} />    
            </HashRouter>
        </div>
    );
}

export default App;