import React, {useRef} from 'react';
import './game-header.css';

import SearchFilter from '../search-filter/search-filter.js';

const GameHeader = ({onGameModeChange, gameModes, gameState="setup", onGameStart, userName, onPlayerNameChange})=>{
    const playerNameInput = useRef();


    let selectorRootClassList = "selectorRoot";
    let launchButtonClassList = "btn";
    let launchButtonContent;
    if (gameState==="ended") {
        launchButtonClassList+=" btn-secondary";
        launchButtonContent = <span><i className="fa fa-repeat"></i> Restart</span>
    }
    else if (gameState==="setup"){
        launchButtonClassList+=" btn-success";
        launchButtonContent = <span><i className="fa fa-play"></i> Play</span>
    }
    if (gameState==="is on"){
        selectorRootClassList+=" disabled";
        launchButtonClassList+=" btn-secondary";
        launchButtonContent = <span><i className="fa fa-repeat"></i> Restart</span>
    }

    const saveName = (e)=>{
        onPlayerNameChange(e.target.value);
    }

    return(
        <div className="headerRoot mb-3">
            <div className="titleRoot">
                <h1 style={{flexShrink: 0}}>4 in a row</h1> 
                <input style={{minWidth: 0}} type='text' className="playerName" value={userName} onChange={(e)=>saveName(e)}/>
            </div>
            <div className="mb-1 launchRoot">
                <button onClick={onGameStart} className={launchButtonClassList}>{launchButtonContent}</button>
            </div>
            <div className={selectorRootClassList+" mb-1"}>
                <SearchFilter onChange={onGameModeChange} options={gameModes} style={{flexBasis: "100%"}}/>
            </div>
            
        </div>
    );
}

export default GameHeader;