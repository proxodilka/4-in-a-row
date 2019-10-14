import React, { useState, useEffect, useContext, useRef } from 'react';
import Game from '../multiplayer/multiplayer';
import GameContext from '../game/game-context';
import GameHandlerContext from './game-handler-context';
import useServer from '../../hooks/onServer';
import useGameHandler from '../../hooks/onLocal';

const GameHandler = ()=>{
    const context = useContext(GameContext);
    const config = buildConfig(context);

    return (
        <GameHandlerContext.Provider value={config}>
            <Game />
        </GameHandlerContext.Provider>
    );

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