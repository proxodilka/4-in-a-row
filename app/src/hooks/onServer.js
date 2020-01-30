import React, { useState, useEffect, useRef } from 'react';

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

export default useServer;