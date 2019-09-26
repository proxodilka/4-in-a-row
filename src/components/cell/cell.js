import React from 'react';
import './cell.css';

const color = ['transparent','red','orange'];

const Cell = ({val, pulse=false})=>{
    const circleStyle = {
        backgroundColor: color[Math.abs(val)],
        opacity: val<0?0.3:1
    }

    let classList = "circle";
    if (pulse) classList+=" pulseAnimation";

    return (
        <div className="cell">
            <div style={circleStyle} className={classList}></div>
        </div>
    );
}

export default Cell;