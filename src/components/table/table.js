import React from 'react';
import './table.css';
import Column from '../column/column.js';
import TableHeader from '../table-header/table-header.js';

const Table = ({currentPlayer, field, columnAction, cellsToPulse, gameState, exitGame, isFieldBlocked, winner, restart})=>{

    let tableFieldClassList="tableField";
    let tableRootClassList="tableRoot";
    console.log('field', field);

    // switch (gameState){
    //     case "setup": tableRootClassList+=" disabled"; break;
    //     case "ended": tableFieldClassList+=" notActive";
    //     default:
    // }

    if (gameState==="setup"){
        tableRootClassList+=" disabled";
    }
    else if (gameState==="ended" || isFieldBlocked){
        tableFieldClassList+=" notActive";
    }

    return (
        <div className={tableRootClassList}>
            <TableHeader currentPlayer={currentPlayer} exitGame={exitGame}
                         winner={winner} restart={restart} style={{marginBottom: "5px"}}/>
            <div className={tableFieldClassList}>
                {field.map( (x, i)=>{
                    const cells = cellsToPulse.filter((x)=>x[0]===i);
                    return (
                        <Column key={i} id={i} columnAction={columnAction} data={x} cellsToPulse={cells}/>
                    );
                } )}
            </div>
        </div>
    );
}

export default Table;