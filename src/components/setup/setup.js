import React, { useState, useEffect } from 'react';
import {Link, Redirect} from 'react-router-dom';
import GameHeader from '../game-header/game-header.js';
import io from 'socket.io-client';
import RoomsList from '../rooms-list/rooms-list.js';
import './setup.css';

const socket = io(window.location.origin);
const generateId = ()=>Math.random().toString(36).substr(2, 9);
const localStorageUsernameKey = '4-in-a-row-username';


const Setup = (props)=>{

    const RowsNumber = 7, ColumnNumber = 6;

    const WinLen=4;

    const [gameModes, setGameModes] = useState([
        {id: 0, title: <span><i className="fa fa-user"></i> vs <i className="fa fa-desktop"></i></span>, alias: ['player', 'ai'], active: true},
        {id: 1, title: <span><i className="fa fa-user"></i> vs <i className="fa fa-user"></i></span>, alias: ['player', 'player'], active: false},
        {id: 2, title: <span><i className="fa fa-desktop"></i> vs <i className="fa fa-desktop"></i></span>, alias: ['ai', 'ai'], active: false},
        /*{id: 3, title: <span>Мультиплеер</span>, alias: ['player', 'web'], active: false}*/
    ]);
    const [gameMode, setGameMode] = useState({});
    const [gameStarted, setGameStarted] = useState(false);
    const [roomInfo, setRoomInfo] = useState('');
    const [userInfo, setUserInfo] = useLocalStorage({
        id: generateId(),
        name: `Player ${generateId()}`,
    }, localStorageUsernameKey);

    const newPlayerName = (val)=>{
        setUserInfo({
            ...userInfo,
            name: val,
        });
    }

    useEffect(()=>{
        const {id, alias} = gameModes.find((x)=>x.active);
        setGameMode({id, alias});
    }, [gameModes]);

    const onGameModeChange = (id)=>{
        setGameModes(gameModes.map((x)=>x.id===id?{...x, active: true}:{...x, active: false}));
    }

    const onRoomPicked = (x, role='player')=>{
        console.log('room in on picked', x);
        setGameMode({id: 'multiplayer', alias: ['player','web'], role});
        setRoomInfo(x);
        console.log('onRoomPicked', socket);
    }

    useEffect(()=>{
        console.log('trying to start game', roomInfo);
        if (roomInfo!==''){
            startGame();
        }
    }, [roomInfo]);

    const startGame = ()=>{

        setGameStarted(true);
    }

    const redirectToGame = ()=>{
        return (
            <Redirect to={{
                pathname: '/game',
                state: {
                    fieldInfo:{
                        RowsNumber,
                        ColumnNumber,
                        WinLen
                    },
                    gameInfo:{
                        gameMode
                    },
                    user:{
                        userName: userInfo.name
                    },
                    roomInfo,
                    socket
                }
            }}/>
        );
    }

    return (
        <>
            {gameStarted?redirectToGame():null}
            <GameHeader gameModes={gameModes} onGameModeChange={onGameModeChange} 
                        onGameStart={startGame} userName={userInfo.name} 
                        onPlayerNameChange={newPlayerName} />
            <div className="error">
                {props.location.state?props.location.state.errMsg:null}
            </div>
            {<RoomsList onRoomEnter={onRoomPicked} socket={socket} userInfo={userInfo}/>}
        </>
    );
}


const useLocalStorage = (initialValue, key)=>{

    const [value, setValue] = useState(localStorage.getItem(key)===null?initialValue:JSON.parse(localStorage.getItem(key)));

    const saveValue = (value)=>{
        localStorage.setItem(key, JSON.stringify(value));
        setValue(value);
    }

    if (localStorage.getItem(key)===null){
        saveValue(initialValue);
    }

    return [value, saveValue];
}

export default Setup;