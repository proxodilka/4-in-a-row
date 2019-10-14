import React, { useState, useEffect, useContext, useRef } from 'react';
import Game from '../multiplayer/multiplayer';
import GameContext from '../game/game-context';
import GameHandlerContext from './game-handler-context';
import AiTurn from '../ai/ai.js';
import {checkWin, insertInColumn} from '../lib/stuff.js';
import GameControl from './game-class';
import useServer from '../../hooks/onServer';

const GameHandler = ()=>{

    const {fieldInfo, gameInfo, user, socket, roomInfo} = useContext(GameContext);
    const {RowsNumber, ColumnNumber, WinLen} = fieldInfo;
    const {gameMode} = gameInfo;
    const {userName} = user;
    const {id, alias, role} = gameMode;

    const context = useContext(GameContext);

    const config = buildConfig(context);

    console.log(gameMode);

    return (
        <GameHandlerContext.Provider value={config}>
            <Game />
        </GameHandlerContext.Provider>
    );

}

const ai = ({field, curePlayer})=>{
    console.log('ai', curePlayer, field);
    return AiTurn(field.map((arr)=>[...arr]), curePlayer, checkWin);
}

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

const buildConfig = (data)=>{
    const {fieldInfo, gameInfo, user, socket, roomInfo} = data;
    const {RowsNumber, ColumnNumber, WinLen} = fieldInfo;
    let {gameMode} = gameInfo;
    let {userName} = user;
    let {id, alias, role} = gameMode;

    const players = [];
    let uid;
    if (gameMode.id!=='multiplayer'){
        role='player';
        id = 1;

        switch (gameMode.alias[0]){
            case 'player': players.push({id: 1, playerName: 'Player 1'}); break;
            case 'ai': players.push({id: 2, playerName: 'AI 1'}); break;
            default: players.push({id: 1, playerName: 'unknown player'});
        }

        switch (gameMode.alias[1]){
            case 'player': players.push({id: 1, playerName: 'Player 2'}); break;
            case 'ai': players.push({id: 2, playerName: 'AI 2'}); break;
            default: players.push({id: 1, playerName: 'unknown player'});
        }

    }
    else{
        id = socket.id;
    }

    const config = {
        playerInfo: {
            id,
            players,
            userName, 
        },

        gameInfo: {
            role,
            gameMode,
        },
        roomInfo: {
            roomId: roomInfo || 1,
        },
        socket,
    }

    return {
        ...config,
        controls: {
            useServer: gameMode.id=='multiplayer'?useServer:(data)=>useGameHandler(data, config),
        }
    }

}

export default GameHandler;