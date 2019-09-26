import React, { useState, useEffect } from 'react';
import './game.css';

import Table from '../table/table.js';
import AiTurn from '../ai/ai.js';
import {checkWin} from '../lib/stuff.js';
import GameHeader from '../game-header/game-header.js';




const Game = ()=>{

    const RowsNumber = 7, ColumnNumber = 6;

    const WinLen=4;

    const getEmptyField = (N,M)=>{
        return Array(M).fill(Array(N).fill(0));
    }

    const initialGameFieldState = {
        field: getEmptyField(RowsNumber, ColumnNumber),
        lastAction: 'none',
        lastColumn: -1,
        lastHoverColumn: -1
    };

    const [gameModes, setGameModes] = useState([
        {id: 0, title: <span><i className="fa fa-user"></i> vs <i className="fa fa-desktop"></i></span>, alias: ['player', 'ai'], active: true},
        {id: 1, title: <span><i className="fa fa-user"></i> vs <i className="fa fa-user"></i></span>, alias: ['player', 'player'], active: false},
        {id: 2, title: <span><i className="fa fa-desktop"></i> vs <i className="fa fa-desktop"></i></span>, alias: ['ai', 'ai'], active: false}
    ]);
    const [gameMode, setGameMode] = useState({});
    const [isFieldBlocked, setFieldBlock] = useState(true);
    const [winState, setWinState] = useState({
        cellsToPulse: [],
        winner: -1 // -1 = игра ещё идёт, 0 = ничья, >0 = номер выигравшего игрока
    }); 
    const [gameField, setGameFieldState] = useState(initialGameFieldState);
    const [gameState, setGameState] = useState("setup");
    const [curePlayer, setCurePlayer] = useState(1);


    useEffect(()=>{
        const {id, alias} = gameModes.find((x)=>x.active);
        setGameMode({id, alias});
    }, [gameModes]);

    useEffect(()=>{
        if (gameState==="is on")
            getNextTurn();
    },[gameState]);

    const onGameModeChange = (id)=>{
        setGameModes(gameModes.map((x)=>x.id===id?{...x, active: true}:{...x, active: false}));
    }

    const getInsertPosition = (array)=>{
        const ind = array.findIndex((a)=>a>0);
        return (ind===-1?array.length:ind)-1;
    }

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
    }

    const norm = (x)=>{
        return x<0?0:x;
    }

    const changeArrayElem = (array, pos, value)=>{
        return array.map((arr, i)=>{
            return arr.map((x, j)=>{
                return i===pos[0] && j===pos[1]?value:norm(x);
            });
        })
    }

    const clickHandler = (...args)=>{
        move(...args);
    }

    const move = (columnId, action, useEff=0)=>{
        //console.log('move', action);
        const insertPos = [columnId, getInsertPosition(gameField.field[columnId])];
        if (insertPos[1]<0){
            return;
        }

        if (gameField.field[insertPos[0]][insertPos[1]]>0 && action==='hideHint'){
            return;
        }
        
        let fieldValue=0;

        switch(action){
            case 'action': fieldValue=curePlayer; break;
            case 'hint' : fieldValue=-curePlayer; break;
            case 'hideHint' : fieldValue=0; break;
            default: fieldValue=0;
        }

        setGameFieldState({
                field: changeArrayElem(gameField.field, insertPos, fieldValue),
                lastAction: action,
                lastColumn: action==='hint'?columnId:gameField.lastColumn
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
        return AiTurn( gameField.field.map((arr)=>[...arr]), curePlayer, checkWin, WinLen, (columnId)=>move(columnId, 'action'));
    }

    return (
        <div className="GameRoot">
            <GameHeader gameModes={gameModes} onGameModeChange={onGameModeChange}
                        toggleGameState={toggleGameState} gameState={gameState} />
                        
            <Table columnAction={clickHandler} winner={winState.winner} 
                   currentPlayer={curePlayerString()} field={gameField.field}
                   cellsToPulse={winState.cellsToPulse} gameState={gameState}
                   exitGame={exitGame} isFieldBlocked={isFieldBlocked} />
        </div>
    );
}

export default Game;
