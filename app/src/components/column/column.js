import React from 'react';
import './column.css';
import Cell from '../cell/cell.js';

const Column = ({data, columnAction, id, cellsToPulse})=>{
    return(
        <div onClick={ ()=>columnAction(id, 'action') } onMouseEnter={ ()=>columnAction(id, 'hint') } 
             onMouseLeave={()=>columnAction(id, 'hideHint')} onTouchStart={ ()=>columnAction(id, 'hint') } className='column'>
            {data.map( (x,i)=><Cell key={id.toString()+i.toString()} val={x}
                                    pulse={cellsToPulse.findIndex((x)=>x[1]===i)!==-1}/>)}
        </div>
    );
}

export default Column
