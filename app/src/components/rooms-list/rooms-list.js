import React, { useState, useEffect } from 'react';
import {Redirect} from 'react-router-dom';
import RoomUnit from '../room-unit/room-unit';
import Loader from '../loader/loader';
import axios from 'axios';
import io from 'socket.io-client';
import './rooms-list.css';
import { userInfo } from 'os';


// let roomList = [];
// const setRoomList = (newArr)=>{
//     roomList = newArr;
// }

const RoomsList = ({onRoomEnter, socket, userInfo})=>{
    console.log(socket);
    //const [socket, setSocket] = useState(io('http://192.168.1.59:4001'));
    const [roomList, setRoomList] = useState([]);
    const [connectionState, setConnectionState] = useState('loading');
    const [newRoomName, setNewRoomName] = useState('');

    // const onRoomEnter = (roomInfo)=>{
    //     console.log(roomInfo);
    // }

    const updRooms = (newRoomList)=>{
        console.log('upd rooms', newRoomList);
        newRoomList.reverse();
        setConnectionState('done');
        setRoomList(newRoomList);
    }

    useEffect(()=>{
        socket.emit('get-rooms', {}, updRooms);

        socket.on('connect-init', updRooms);

        socket.on('rooms-list-updated', updRooms);

        socket.on('connect', ()=>{console.log('connect'); socket.emit('get-rooms', {}, updRooms)});
        socket.on('disconnect', ()=>{
            console.log('disconnected...');
            setConnectionState('loading');
            setRoomList([]);
        })

        socket.on('connect_error', (error)=>{
            console.log('connect_error', error);
            setConnectionState('error');
        })

    },[]);

    const updNewRoomName = (e)=>{
        setNewRoomName(e.target.value);
    }

    const onRoomDelete = (id)=>{
        socket.emit('delete-room', {roomId: id, initiator: userInfo.id});
    }

    const roomCreated = (err)=>{
        if (err!==null){
            return;
        }
        setNewRoomName('');
    }

    const postRoom = (e)=>{
        e.preventDefault();
        socket.emit('create-room', {roomName: newRoomName, creator: userInfo.id}, roomCreated);
        
    }

    

    return(
        <div className="roomListRoot">

            <form className="newRoomForm" onSubmit={postRoom}>
                <input type="text" onChange={updNewRoomName} placeholder="name of the room" className="form-control" value={newRoomName} /> 
                <button className="btn btn-outline-primary ml-2" type='submit'>create room</button>
            </form>
            
            <div className="roomsRoot">
                {connectionState=='done'?roomList.map(x=><RoomUnit key={x.id} roomInfo={x} userInfo={userInfo} 
                                                    onRoomEnter={onRoomEnter} onRoomDelete={onRoomDelete}/>):null}
                {connectionState=='loading'?<Loader />:null}
                {connectionState=='error'?<> <ErrorMessage text='Cant connect to the server. Trying to reconnect'/> <Loader /></>:null}
            </div>
            
        </div>
    );
}

const ErrorMessage = ({text})=>{
    const style={
        textAlign: 'center',
    }

    return(
        <div style={style}>{text}</div>
    );
}

export default RoomsList;
