import React from 'react';
import './table-header.css';

const TableHeader = ({winner, currentPlayer, exitGame, style})=>{
    let curePlayerText;

    // const getWinText = (text)=>{
    //     return (text);
    // }

    switch (winner){
        case -1: curePlayerText=`Сейчас ходит ${currentPlayer}`; break;
        case 0: curePlayerText='Ничья!'; break; //lose
        default: curePlayerText=`Победил ${currentPlayer}`;
    }

    return(
        <div style={style} className="tableHeader">
            <div className="curePlayerText">{curePlayerText}</div>
            <button onClick={exitGame} className="btn btn-danger"><i className="fa fa-times"></i></button>
        </div>
    );
}

export default TableHeader;