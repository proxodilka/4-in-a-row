import React, { useState, useEffect } from 'react';
import {CSSTransition} from 'react-transition-group';
import './room-unit.css';

const RoomUnit = ({roomInfo, userInfo, onRoomDelete, onRoomEnter})=>{
    return(
        <div className="roomUnit" onClick={()=>onRoomEnter(roomInfo.id)}>
            <div className="headerBlock">
                <div className="roomName">
                    {roomInfo.name}
                </div>
                <div className="statusRoot">
                    <div className="gameStatus">
                        {roomInfo.gameStatus}
                    </div>
                    <div className="countersRoot">
                        <div className="players">
                            <i className="fa fa-user"></i> {roomInfo.players.length}/2
                        </div>
                        <div className="spectators">
                            <i className="fa fa-eye"></i> {roomInfo.spectators.length}
                        </div>
                    </div> 
                </div>
            </div>
            <div className="buttonsBlock">
                <div className="enterButtons">
                    <button id="spectator" className="btn btn-outline-primary" onClick={(e)=>{e.stopPropagation(); onRoomEnter(roomInfo.id, 'spectator')}}>Spectator</button>
                    <button id="join" className="btn btn-success" onClick={(e)=>{e.stopPropagation(); onRoomEnter(roomInfo.id)}}>Join</button>
                </div>
                {roomInfo.creator===userInfo.id?
                <div className="deleteButton">
                    <button id="delete" className="btn btn-danger" onClick={(e)=>{e.stopPropagation(); onRoomDelete(roomInfo.id)}}><i class="fa fa-trash-o"></i></button>
                </div>:null}
            </div>
            
        </div>
    );
}

{/* <div className="roomUnit" >
        {roomInfo.name} | {roomInfo.gameStatus}
        <button onClick={()=>onRoomEnter(roomInfo.id)}>Join room</button>
        {roomInfo.creator===userInfo.id?<button onClick={()=>onRoomDelete(roomInfo.id)}>Delete room</button>:null}
    </div> */}

export default RoomUnit;