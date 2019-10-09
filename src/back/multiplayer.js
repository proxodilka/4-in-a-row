import React, { useState, useEffect } from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import './multiplayer.css';


import Table from '../table/table.js';
import AiTurn from '../ai/ai.js';
import {checkWin} from '../lib/stuff.js';
import GameHeader from '../game-header/game-header.js';

let errMsg = 'no errors';

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
    return x<0?0:x;
}


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

const curePlayerString = ()=>{
    return 'Stranger';
}

const Game = (props)=>{

    let pingId;

    const base = 'http://192.168.1.59:4000';
    const fieldUrl = 'http://localhost:4000/info';
    const moveUrl = 'http://localhost:4000/move';

    const {fieldInfo, gameInfo} = props.state;
    const {RowsNumber, ColumnNumber, WinLen} = fieldInfo;
    const {gameMode} = gameInfo;

    const [uid] = useState(generateId());
    const [isFieldBlocked, setIsFieldBlocked] = useState(true);
    const [gameState, setGameState] = useState("is on");
    const [winState, setWinState] = useState({winner: -1, cellsToPulse: []});
    const [gameField, setGameField] = useState({field: getEmptyField(7,6)});
    const [gonnaLeave, setGonnaLeave] = useState(false);
    const [curePlayer, setCurePlayer] = useState(0);

    useEffect(()=>{
        console.log('start');
        startGame();
        //window.addEventListener('beforeunload', ()=>exitGame());
    }, []);

    const clickHandler = (...args)=>{ //columnId, action
        const [columnId, action] = args;

        if (action!=='action')
            return;
        
        const pos = {x: columnId, y: getInsertPosition(gameField.field[columnId])};
        if (pos.y===-1)
            return;

        setGameField({
            field:changeArrayElem(gameField.field, pos, curePlayer)
        });

        setIsFieldBlocked(true);
        sendMoveToServer(columnId);
    }

    const startGame = ()=>{
        console.log(uid);
        axios.post(`${base}/init_connection`, {id: uid}).catch(exitGame);
        pingId = setInterval(pingServer, 500);

    }

    const exitGame = (req)=>{
        errMsg = 'exiting with no errors';
        handleErrors(req);
        axios.post(`${base}/end_connection`, {id: uid});
        clearInterval(pingId);
        setGonnaLeave(true);
    }

    const handleErrors = (req)=>{
        if (req.response){
            errMsg = `${req.response.data} | ${req.response.status}`;
        }
    }

    const pingServer = ()=>{
        axios.get(`${base}/info`, {id: uid})
            .then(updateField);
    }

    const sendMoveToServer = (columnId)=>{
        axios.post(`${base}/move`, {id: uid, columnId});
    }

    const updateField = ({data})=>{
        const {field, cureId, curePlayer: curePlayer_} = data;

        setGameField({
            field
        });
        setCurePlayer(curePlayer_);

        if (cureId===uid){
            setIsFieldBlocked(false);
        }
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
