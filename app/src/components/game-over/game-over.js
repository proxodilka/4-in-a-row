import React, { useState, useEffect } from 'react';
import {Redirect, Link} from 'react-router-dom';

const GameOver = (props)=>{
    return (
        <div>
            {`Победил игрок ${props.location.winner}`}
            {/*<Link to='/'>Начать сначала</Link>*/}
        </div>
    );
}

export default GameOver;