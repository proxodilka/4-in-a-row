import React, { useState, useEffect } from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import GameContext from './game-context';
import './game.css';


import Table from '../table/table.js';
import Multiplayer from '../multiplayer/multiplayer';
import AiTurn from '../ai/ai.js';
import {checkWin} from '../lib/stuff.js';
import GameHeader from '../game-header/game-header.js';
import GameHandler from '../game-handler/game-handler';


const TryToStartGame = (props)=>{

    if (props.location.state===undefined){
        return <Redirect to='/' />
    }
    console.log('interface');
    // if (props.location.state.gameInfo.gameMode.alias[1]=='web')
    //     return <Multiplayer state={props.location.state} />
    // return <Game state={props.location.state} />

    return(
        <GameContext.Provider value={props.location.state}>
            <GameHandler />
        </GameContext.Provider>
    );
    
}

const Game = (props)=>{

    const {fieldInfo, gameInfo} = props.state;
    const {RowsNumber, ColumnNumber, WinLen} = fieldInfo;
    const {gameMode} = gameInfo;

    const getEmptyField = (N,M)=>{
        return Array(M).fill(Array(N).fill(0));
    }

    const getInsertPosition = (array)=>{
        const ind = array.findIndex((a)=>a>0);
        return (ind===-1?array.length:ind)-1;
    }

    const initialGameFieldState = {
        field: getEmptyField(RowsNumber, ColumnNumber),
        lastAction: 'none',
        lastColumn: -1,
        lastHoverColumn: -1
    };

    
    const [isFieldBlocked, setFieldBlock] = useState(true);
    const [winState, setWinState] = useState({
        cellsToPulse: [],
        winner: -1 // -1 = игра ещё идёт, 0 = ничья, >0 = номер выигравшего игрока
    }); 
    const [gameField, setGameFieldState] = useState(initialGameFieldState);
    const [gameState, setGameState] = useState("is on");
    const [curePlayer, setCurePlayer] = useState(1);
    const [gonnaLeave, setGonnaLeave] = useState(false);

    useEffect(()=>{
        if (gameState==="is on")
            getNextTurn();
    },[gameState]);

    useEffect(()=>{
        if (gameField.lastAction!=='action')
            return;
        const win = checkWin(gameField.field, WinLen);
        if (!win.isWin){
            nextPlayerTurn();
        }   
        else{
            endGame(win);
        }
    }, [gameField]);

    const init = ()=>{
        setWinState({
            cellsToPulse: [],
            winner: -1
        });
        setCurePlayer(1);
        setGameFieldState(initialGameFieldState);
    }

    const startGame = ()=>{
        init();
        setGameState("is on");
    }

    const toggleGameState = ()=>{
        startGame();
    }

    const exitGame = ()=>{
        init();
        setGameState("setup");
        setGonnaLeave(true);
    }

    const norm = (x)=>{
        return x<0?0:x;
    }

    const changeArrayElem = (array, pos, value)=>{
        return array.map((arr, i)=>{
            return arr.map((x, j)=>{
                return i===pos.x && j===pos.y?value:norm(x);
            });
        })
    }

    const clickHandler = (...args)=>{
        move(...args);
    }

    const move = (columnId, action, useEff=0)=>{
        const insertPos = {x: columnId, y: getInsertPosition(gameField.field[columnId])};
        if (insertPos.y<0){
            return;
        }
        if (gameField.field[insertPos.x][insertPos.y]>0 && action==='hideHint'){
            return;
        }
        
        let fieldValue;

        switch(action){
            case 'action': fieldValue=curePlayer; break;
            case 'hint' : fieldValue=-curePlayer; break;
            case 'hideHint' : fieldValue=0; break;
            default: fieldValue=0;
        }
        setGameFieldState({
                field: changeArrayElem(gameField.field, insertPos, fieldValue),
                lastAction: action,
                lastColumn: action==='hint'?columnId:gameField.lastColumn,
                lastActionColumn: action==='action'?columnId:gameField.lastAction
            }
        );
    }

    const endGame = ({winner, indexes})=>{
        setGameState("ended");
        setWinState({
            cellsToPulse: indexes,
            winner: winner
        })
    }

    const nextPlayerTurn = ()=>{
        setCurePlayer(curePlayer===1?2:1);
    }


    const getNextTurn = ()=>{
        if (gameState!=="is on"){
            return;
        }
        switch (gameMode.alias[curePlayer-1]){
            case 'ai':{
                setFieldBlock(true);
                move(ai(), 'action');
                break;
            }
            case 'player':{
                if (gameField.lastColumn>=0) move(gameField.lastColumn, 'hint');
                setFieldBlock(false);
                break;
            }
            default:{
                console.error(`Unexpected player type: '${gameMode.alias[curePlayer-1]}'`);
                exitGame();
            }
        }
    }

    useEffect(getNextTurn, [curePlayer]);

    const curePlayerString = ()=>{
        if (gameMode.alias===undefined)
            return "¯\\_(ツ)_/¯";
        switch (gameMode.alias[curePlayer-1]){
            case 'player': return `Игрок ${curePlayer}`;
            case 'ai': return `ИИ №${curePlayer}`;
            default: return "¯\\_(ツ)_/¯";
        }
    };

    const ai = ()=>{
        return AiTurn( gameField.field.map((arr)=>[...arr]), curePlayer, checkWin);
    }

    return (
        <div className="GameRoot">
            {gonnaLeave?<Redirect to='/'/>:null}            
            <Table columnAction={clickHandler} winner={winState.winner} 
                   currentPlayer={curePlayerString()} field={gameField.field}
                   cellsToPulse={winState.cellsToPulse} gameState={gameState}
                   exitGame={exitGame} isFieldBlocked={isFieldBlocked}
                   restart={startGame} />
        </div>
    );
}

export default TryToStartGame;
