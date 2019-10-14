const {checkWin, getEmptyField, getInsertPosition, changeArrayElem} = require('../lib/stuff');

const initValue = {
    field: getEmptyField(7,6)
}

class Field{
    constructor(){
        this.field = initValue.field;
    }

    move(columnId, value){
        console.log('cId', columnId);
        const pos = {x: columnId, y: getInsertPosition(this.field[columnId] || [])};
        this.field = changeArrayElem(this.field, pos, value);
        return checkWin(this.field, 4);
    }

    getField(){
        return this.field;
    }

    reset(){
        this.field = initValue.field;
    }
}

module.exports.Field = Field;