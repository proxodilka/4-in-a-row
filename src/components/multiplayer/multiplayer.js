import React, { useState, useEffect, useRef } from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import './multiplayer.css';


import Table from '../table/table.js';
import AiTurn from '../ai/ai.js';
import {checkWin, getInsertPosition, changeArrayElem} from '../lib/stuff.js';
import GameHeader from '../game-header/game-header.js';

let errMsg = 'no errors';


const generateId = ()=>Math.random().toString(36).substr(2, 9);

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

const union = (arr1, arr2)=>{
    //console.log(arr1);
    const tmp = arr2.map((x,i)=>{
        return x.map((y,j)=>{
            console.log(arr1[i][j], y);
            return arr1[i][j]<0?arr1[i][j]:y
        })
    })
    //console.log('union', tmp);
    return tmp;
}


const delay=500;
const base = 'http://localhost:4000';

const Game = (props)=>{

    const handleServerData = (data)=>{
        console.log('data', data);
        const {field, gameStatus, curePlayer, winState, players, lastMoveInitiator} = data;
        
        //console.log(`${players[curePlayer-1].id} == ${uid} && ${gameStatus}`);
        console.log('game', game, field);
        //console.log('initiator', initiator);

        setGame({
            field: lastMoveInitiator===uid?game.field:field,
            gameStatus,
            curePlayer,
            winState,
            players,
        });

        
        if (role==='player' && players[curePlayer-1] && players[curePlayer-1].id==uid && gameStatus=='is on'){
            //console.log('starting');
            setIsFieldBlocked(false);
        }
    }

    const exitGame = (req)=>{
        //console.log(pingId);
        //clearInterval(pingId);
        console.log('exiting');
        errMsg = 'exiting with no errors';
        handleErrors(req);
        
        setGonnaLeave(true);
    }

    const fieldUrl = 'http://localhost:4000/info';
    const moveUrl = 'http://localhost:4000/move';

    const {fieldInfo, gameInfo, user, socket, roomInfo} = props.state;
    const {RowsNumber, ColumnNumber, WinLen} = fieldInfo;
    const {gameMode: {role}} = gameInfo;
    const {userName} = user;

    //const [pingId, setPingId] = useState(0);

    const [game, setGame] = useState({
        field: getEmptyField(7,6),
        gameStatus: 'connecting to the server...',
        curePlayer: 0,
        winState: {
            isWin: false,
            winner: -1,
            cellsToPulse: []
        },
        players: ['Player1', 'Player2'],
    })


    const [playerName] = useState(userName)
    const [uid] = useState(socket.id);
    const [isFieldBlocked, setIsFieldBlocked] = useState(true);
    const [gonnaLeave, setGonnaLeave] = useState(false);
    const [allowUnblocking, setAllowUnblocking] = useState(true);

    const sendToServer = useServer({
        socket, playerName,
        handleData: handleServerData,
        onError: exitGame, 
        roomId: roomInfo,
        role,
    });

    

    const curePlayerString = ()=>{
        return game.players[game.curePlayer-1]?game.players[game.curePlayer-1].playerName:'Unknown player';
    }

    const clickHandler = (...args)=>{ //columnId, action
        const [columnId, action] = args;

        let value=0;

        //console.log(action);
        // if (action!=='action')
        //     return;

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

        // sendToServer('move', {moveInfo: {columnId, action}, roomInfo: {roomId: roomInfo}});

        if (action!=='action')
            return;

        setIsFieldBlocked(true);
        
    }

    useEffect(()=>{
        if (game.initiator==='player'){
            sendToServer('move', {moveInfo: {columnId: game.lastColumn, action: game.lastAction}, roomInfo: {roomId: roomInfo}})
        }
        
    }, [game])

    const handleErrors = (req)=>{
        if (req){
            errMsg = `${req} | ${0}`;
        }
    }

    const restartGame = ()=>{
        if (role!=='player' || game.gameStatus!=='ended')
            return;
        sendToServer('restart', {id: uid, roomId: roomInfo});
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

const useServer = ({socket, playerName, handleData, onError, roomId, role})=>{

    const handleDataCallback = useRef();

    useEffect(()=>{
        handleDataCallback.current = handleData;
    })

    useEffect(()=>{
        socket.emit('join-room', {roomId, playerName, role}, (res)=>{
            console.log('join-room', onError);
            if (!res.ok){
                onError(res.reason);
                return;
            }
            //socket.emit('get-room-data', {playerId: socket.id, roomId}, handleDataCallback.current);
        });

        socket.on('field-updated', (data)=>handleDataCallback.current(data));
        //socket.on('field-updated', ()=>console.log('testObj', testObj));
        socket.on('kick-from-room', onError)


        socket.on('disconnect', ()=>{
            onError('connection lost')
        })

        return ()=>{
            socket.emit('leave-room', {id: socket.id, roomId});

            socket.removeAllListeners('field-updated');
            socket.removeAllListeners('kick-from-room');
        }
    }, []);

    const onPost = (addr, data)=>{
        socket.emit(addr, data);
    }

    return onPost;
    
}

export default Game;
