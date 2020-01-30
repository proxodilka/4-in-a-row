import React, { useState, useEffect, useRef, useContext } from 'react';
import {Redirect} from 'react-router-dom';

import './multiplayer.css';


import Table from '../table/table.js';
import {getInsertPosition, changeArrayElem} from '../lib/stuff.js';
import GameHandlerContext from '../game-handler/game-handler-context';

let errMsg = 'no errors';

const getEmptyField = (N,M)=>{
    return Array(M).fill(Array(N).fill(0));
}

const error = ()=>{
    return <Redirect to={{
        pathname: '/',
        state: {
            errMsg
        }
    }}/>
}

const Game = ()=>{

    const handleData = (data, callAgain=false)=>{
        console.log('data', data, uid);
        const {field, gameStatus, curePlayer, winState, players, lastMoveInitiator} = data;
        
        //console.log(`${players[curePlayer-1].id} == ${uid} && ${gameStatus}`);
        console.log('game', game, field);
        console.log('initiator', lastMoveInitiator, uid);

        setGame({
            field: lastMoveInitiator.id===uid?game.field:field,
            gameStatus,
            curePlayer,
            winState,
            players,
            callAgain,
        });

        
        if (role==='player' && players[curePlayer-1] && players[curePlayer-1].id==uid && gameStatus=='is on'){
            setIsFieldBlocked(false);
        }
    }

    const exitGame = (req)=>{
        errMsg = 'exiting with no errors';
        handleErrors(req);
        setGonnaLeave(true);
    }

    const context = useContext(GameHandlerContext);
    const {playerInfo: {id, players, userName}, gameInfo: {role}, controls: {useServer}, socket, roomInfo: {roomId}} = context;

    const [game, setGame] = useState({
        field: getEmptyField(7,6),
        gameStatus: 'connecting to the server...',
        curePlayer: 0,
        winState: {
            isWin: false,
            winner: -1,
            cellsToPulse: []
        },
        players,
    })

    useEffect(()=>{
        if (game.callAgain){
            setGame({...game, callAgain: false});
            sendToServer('calling');
        }
    }, [game]);

    const [playerName] = useState(userName)
    const [uid] = useState(id);
    const [isFieldBlocked, setIsFieldBlocked] = useState(true);
    const [gonnaLeave, setGonnaLeave] = useState(false);
    const sendToServer = useServer({
        socket,
        playerName,
        handleData,
        onError: exitGame, 
        roomId,
        role,
    });

    const curePlayerString = ()=>{
        return game.players[game.curePlayer-1]?game.players[game.curePlayer-1].playerName:'Unknown player';
    }

    const clickHandler = (...args)=>{ //columnId, action
        const [columnId, action] = args;

        let value=0;
        switch (action){
            case 'action': value=game.curePlayer; break;
            case 'hint': value=-game.curePlayer; break;
            case 'hidehint': value=0; break;
            default: value=0;
        }

        const pos = {x: columnId, y: getInsertPosition(game.field[columnId])};
        if (pos.y<0)
            return;

        setGame({
            ...game,
            field: changeArrayElem(game.field, pos, value),
            curePlayer: action=='action'?game.curePlayer==1?2:1:game.curePlayer,
            lastAction: action,
            lastColumn: columnId,
            initiator: 'player',
        });

        if (action!=='action')
            return;

        setIsFieldBlocked(true);
        
    }

    useEffect(()=>{
        if (game.initiator==='player'){
            sendToServer('move', {moveInfo: {columnId: game.lastColumn, action: game.lastAction}, roomInfo: {roomId}});
        }
    }, [game])

    const handleErrors = (req)=>{
        if (req){
            errMsg = `${req} | ${0}`;
        }
    }

    const restartGame = ()=>{
        if (role!=='player')
            return;
        sendToServer('restart', {id: uid, roomId});
    }
    
    return (
        <div className="GameRoot">
            {gonnaLeave?error():null}            
            <Table columnAction={clickHandler} winner={game.winState.winner} 
                   currentPlayer={curePlayerString()} field={game.field}
                   cellsToPulse={game.winState.cellsToPulse} gameState={game.gameStatus}
                   exitGame={exitGame} isFieldBlocked={isFieldBlocked}
                   restart={restartGame} />
            <div className="status">{game.gameStatus} {role==='spectator'?' | You are in spectator mode':null}</div>
        </div>
    );
}

export default Game;
