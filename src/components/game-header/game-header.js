import React from 'react';
import './game-header.css';

import SearchFilter from '../search-filter/search-filter.js';

const GameHeader = ({onGameModeChange, gameModes, gameState="setup", toggleGameState})=>{


    let selectorRootClassList = "selectorRoot";
    let launchButtonClassList = "btn";
    let launchButtonContent;
    if (gameState==="ended") {
        launchButtonClassList+=" btn-secondary";
        launchButtonContent = <span><i className="fa fa-repeat"></i> Начать заново</span>
    }
    else if (gameState==="setup"){
        launchButtonClassList+=" btn-success";
        launchButtonContent = <span><i className="fa fa-play"></i> Играть</span>
    }
    if (gameState==="is on"){
        selectorRootClassList+=" disabled";
        launchButtonClassList+=" btn-secondary";
        launchButtonContent = <span><i className="fa fa-repeat"></i> Начать заново</span>
    }

    return(
        <div className="headerRoot mb-3">
            <div className="mb-1 launchRoot">
                <button onClick={toggleGameState} className={launchButtonClassList}>{launchButtonContent}</button>
            </div>
            <div className={selectorRootClassList+" mb-1"}>
                <div className="selectorText" style={{flexBasis: "40%"}}>Режим игры:</div>
                <SearchFilter onChange={onGameModeChange} options={gameModes} style={{flexBasis: "60%"}}/>
            </div>
            
        </div>
    );
}

export default GameHeader;