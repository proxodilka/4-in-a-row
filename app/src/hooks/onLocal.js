import React, {useEffect, useRef} from 'react';
import AiTurn from '../components/ai/ai';
import {checkWin, insertInColumn} from '../components/lib/stuff.js';
import GameControl from '../components/game-handler/game-class';

const useGameHandler = ({handleData, getGame}, {playerInfo: {players}, gameInfo: {gameMode}})=>{

    const gameControl = useRef(new GameControl()).current;
    useEffect(()=>{
        gameControl.joinPlayer({...players[0], role: 'player'});
        gameControl.joinPlayer({...players[1], role: 'player'});
        handleData(gameControl.getInfo(), true);
    }, []);

    const handleRoutes = (route, params)=>{
        switch (route){
            case 'move': handleGame(params); break;
            case 'restart': restart(params); break; 
            case 'calling': handleCall(); break;
        }
    }

    const handleCall = ()=>{
        if (gameControl.winState.isWin){
            return;
        }
        if ((gameMode.alias[gameControl.curePlayer-1])=='ai'){
            handleGame({moveInfo: {columnId: -1, action: 'action'}});
        }
    }

    const restart = (params)=>{
        gameControl.restart();
        handleData(gameControl.getInfo(), true);
    }

    const handleGame = ({moveInfo: {columnId, action}})=>{
        if (action!='action')
            return;
        if (columnId>=0) gameControl.move(columnId, action);
        switch (gameMode.alias[gameControl.curePlayer-1]){
            case 'player': {
                handleData(gameControl.getInfo(), true);
                break;
            }
            case 'ai': {
                const aiMove = ai(gameControl.getInfo());
                gameControl.move(aiMove, 'action');
                handleData(gameControl.getInfo(), true);
                break;
            }
        }
    }

    return handleRoutes;
}

const ai = ({field, curePlayer})=>{
    console.log('ai', curePlayer, field);
    return AiTurn(field.map((arr)=>[...arr]), curePlayer, checkWin);
}


export default useGameHandler;