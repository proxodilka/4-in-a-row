import React, { useState, useEffect } from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import './multiplayer.css';


import Table from '../table/table.js';
import AiTurn from '../ai/ai.js';
import {checkWin} from '../lib/stuff.js';
import GameHeader from '../game-header/game-header.js';
import { tsPropertySignature } from '@babel/types';

let errMsg = 'no errors';

const getEmptyField = (N,M)=>{
    //console.log('getting empty fields');
    return Array(M).fill(Array(N).fill(0));
}
//

const Game = ({location: {state: {roomInfo, socket}}})=>{
    // console.log('props', props.location);
    
    // const roomInfo=null; const socket=null;
    //console.log('destruct result', roomInfo, socket);
    
    // props = props.location;
    // const {roomInfo: roomInfRoot, socket} = props.state;
    // //const {RowsNumber, ColumnNumber, WinLen} = fieldInfo;
    // //const {gameMode} = gameInfo;
    // const {roomInfo} = roomInfRoot;

    const initialGameFieldState = {
        field: getEmptyField(7, 6),
        lastAction: 'none',
        lastColumn: -1,
        lastHoverColumn: -1
    };

    const getInsertPosition = (array)=>{
        const ind = array.findIndex((a)=>a>0);
        return (ind===-1?array.length:ind)-1;
    }
    
    const changeArrayElem = (array, pos, value)=>{
        return array.map((arr, i)=>{
            return arr.map((x, j)=>{
                return i===pos.x && j===pos.y?value:norm(x);
            });
        })
    }
    
    
    const norm = (x)=>{
        return x;
        return x<0?0:x;
    }
    
    
    const generateId = ()=>Math.random().toString(36).substr(2, 9);
    
    const error = ()=>{
        return <Redirect to={{
            pathname: '/',
            state: {
                errMsg
            }
        }}/>
    }
    
    const curePlayerString = ()=>{
        return 'Stranger';
    }

    

    // const base = 'http://192.168.1.59:4000';
    // const fieldUrl = 'http://localhost:4000/info';
    // const moveUrl = 'http://localhost:4000/move';

    const getOne = ()=>{
        console.log('getting one');
        return 1;
    }

    

    const startGame = (playersList)=>{
        console.log('game started');
        if (clientId==playersList[0])
            setIsFieldBlocked(false);
    }

    const exitGame = ()=>{
        socket.emit('leave', roomInfo.name);
        setGonnaLeave(true);
    }

    const updateField = (data)=>{
        const {columnId} = data;

        insertInColumn(columnId);

        setIsFieldBlocked(false);

    }

    

    const [trap, setTrap] = useState(()=>{console.log('initial render'); return 1;});
    const [uid] = useState(generateId());
    const [isFieldBlocked, setIsFieldBlocked] = useState(true);
    const [gameState, setGameState] = useState("is on");
    const [winState, setWinState] = useState({winner: -1, cellsToPulse: []});
    const [gameField, setGameField] = useState(initialGameFieldState);
    const [gonnaLeave, setGonnaLeave] = useState(false);
    const [curePlayer, setCurePlayer] = useState(1);
    const [clientId] = useState(socket.id);

    

    useEffect(()=>{
        socket.on('kick-from-room', reason=>{
            errMsg=`you have been kicked: ${reason}`;
            exitGame();
        })
        socket.on('start-game', startGame);
        socket.on('field-updated', updateField);
        console.log('component did mount');
        //startGame();
        //console.log(roomInfo, socket);
        socket.emit('room-enter', roomInfo.id);
        //window.addEventListener('beforeunload', ()=>exitGame());
        setCurePlayer(2);
        return ()=>{
            socket.removeListener('kick-from-room');
            socket.removeListener('start-game');
            socket.removeListener('field-updated');
            console.log('unmount');
        }
    }, []);

    useEffect(()=>{
        console.log('gameField updated', gameField.field);
        setCurePlayer(2);
    },[gameField]);


    const insertInColumn = (columnId)=>{
        console.log('inserting in column...', columnId, gameField.field);

        const pos = {x: columnId, y: getInsertPosition(gameField.field[columnId])};
        if (pos.y===-1)
            return;

        
        setGameField({
            field: changeArrayElem(gameField.field, pos, curePlayer)
        });
    }

    const clickHandler = (...args)=>{ //columnId, action
        const [columnId, action] = args;

        if (action!=='action')
            return;
        
        insertInColumn(columnId);
        
        //setIsFieldBlocked(true);
        
        sendMoveToServer(columnId);
    }

    const sendMoveToServer = (columnId)=>{
        socket.emit('move', columnId);
    }

    

    return (
        <div className="GameRoot">
            {gonnaLeave?error():null}            
            <Table columnAction={clickHandler} winner={winState.winner} 
                   currentPlayer={curePlayerString()} field={gameField.field}
                   cellsToPulse={winState.cellsToPulse} gameState={gameState}
                   exitGame={exitGame} isFieldBlocked={isFieldBlocked}
                   restart={startGame} />
        </div>
    );
}

export default Game;
