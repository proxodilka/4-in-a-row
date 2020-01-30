import React, { useState, useEffect } from 'react';
import './loader.css';

const Loader = ()=>{
    return(
        <div class="loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
        </div>
    );
}

export default Loader;