import React, { useState, useEffect } from 'react';
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



const delay=500;
const base = 'http://192.168.1.59:4000';

const Game = (props)=>{

    const updateField = ({data})=>{
        const {field, cureId, curePlayer: curePlayer_, status} = data;

        setGameField({
            field
        });

        const {winner} = status;

        if (winner){
            setIsFieldBlocked(true);
            setGameState(`${winner} win the game`);
            return;
        }

        setCurePlayer(curePlayer_);
        setGameState(status);

        if (cureId===uid && allowUnblocking){
            setIsFieldBlocked(false);
        }

    }
    
    const exitGame = (req)=>{
        //console.log(pingId);
        //clearInterval(pingId);
        console.log('exiting');
        errMsg = 'exiting with no errors';
        handleErrors(req);
        axios.post(`${base}/end_connection`, {id: uid});
        setGonnaLeave(true);
    }

    const fieldUrl = 'http://localhost:4000/info';
    const moveUrl = 'http://localhost:4000/move';

    const {fieldInfo, gameInfo} = props.state;
    const {RowsNumber, ColumnNumber, WinLen} = fieldInfo;
    const {gameMode} = gameInfo;

    //const [pingId, setPingId] = useState(0);
    const [uid] = useState(()=>generateId());
    const [isFieldBlocked, setIsFieldBlocked] = useState(true);
    const [gameState, setGameState] = useState('connecting to the server...');
    const [winState, setWinState] = useState({winner: -1, cellsToPulse: []});
    const [gameField, setGameField] = useState({field: getEmptyField(7,6)});
    const [gonnaLeave, setGonnaLeave] = useState(false);
    const [curePlayer, setCurePlayer] = useState(0);
    const [allowUnblocking, setAllowUnblocking] = useState(true);
    useServer(uid, updateField, exitGame);

    const curePlayerString = ()=>{
        return 'unknown';
    }

    useEffect(()=>{
        console.log('start');
        
        //window.addEventListener('beforeunload', ()=>exitGame());
    }, []);

    // useEffect(()=>{
    //     const win = checkWin(gameField.field, WinLen);
    //     if (!win.isWin){
    //         nextPlayerTurn();
    //     }   
    //     else{
    //         endGame(win);
    //     }
    // }, [gameField]);

    const insertInColumn = (columnId)=>{
        const pos = {x: columnId, y: getInsertPosition(gameField.field[columnId])};
        if (pos.y===-1)
            return;

        setGameField({
            field:changeArrayElem(gameField.field, pos, curePlayer)
        });
    }

    const clickHandler = (...args)=>{ //columnId, action
        const [columnId, action] = args;

        if (action!=='action')
            return;
        
        insertInColumn(columnId);

        setIsFieldBlocked(true);
        sendMoveToServer(columnId);
    }

    const startGame = ()=>{
        console.log(uid);
        
        //console.log(pId);
        //setPingId(pId);

    }

    

    const handleErrors = (req)=>{
        if (req.response){
            errMsg = `${req.response.data} | ${req.response.status}`;
        }
    }

    

    const sendMoveToServer = (columnId)=>{
        axios.post(`${base}/move`, {id: uid, columnId});
        setAllowUnblocking(false);
        setTimeout(()=>setAllowUnblocking(true), delay);
    }

    

    return (
        <div className="GameRoot">
            {gonnaLeave?error():null}            
            <Table columnAction={clickHandler} winner={winState.winner} 
                   currentPlayer={curePlayerString()} field={gameField.field}
                   cellsToPulse={winState.cellsToPulse} gameState={gameState}
                   exitGame={exitGame} isFieldBlocked={isFieldBlocked}
                   restart={startGame} />
            <div className="status">{gameState}</div>
        </div>
    );
}

const useServer = (uid, performData, onError)=>{

    useEffect(()=>{
        axios.post(`${base}/init_connection`, {id: uid}).catch(onError);
        let id = setInterval(pingServer, delay);
        return ()=>clearInterval(id);
    }, []);

    const pingServer = ()=>{
        axios.get(`${base}/info`, {params: {id: uid}})
            .then(performData)
            .catch(onError);
    }


}

export default Game;
