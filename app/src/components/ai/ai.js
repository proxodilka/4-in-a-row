let Table = [];
let IsWin = ()=>1;
let Player;
let winLen;

const maxDeepLvl = 1;

const TLHandler = {
    start: 0,
    maxTime: 2000
}

const INF = 10e30;

const getRandom = (min, max)=>{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getInsertPosition = (array)=>{
    const ind = array.findIndex((a)=>a>0);
    return (ind===-1?array.length:ind)-1;
}

const rateField = (player)=>{
    let rating = 0;
    let isWinObj = IsWin(Table, winLen);

    if (isWinObj.isWin){
        if (isWinObj.isWin==="draw")
            return 0;
        if (isWinObj.winner===player)
            return INF;
        return -INF;
    }

    if (checkMayWin(player===1?2:1)>=0){
        return -INF;
    }  
        

    for(let i=2; i<=winLen; i++){
        isWinObj = IsWin(Table, i, 0);
        rating+= isWinObj.filter((x)=>x.winner===player).length*Math.pow(10, i*5);
        rating-= isWinObj.filter((x)=>x.winner!==player).length*Math.pow(10, i);
    }

    //console.log(rating);
    return rating;
}

const getWays = ()=>{
    const res = [];
    Table.forEach((arr, i)=>{
        let tmp = getInsertPosition(arr);
        if (tmp<0)
            return;
        res.push([i, tmp]);
    })
    return res;
}

// const states = {};

const checkMayWin = (player)=>{
    let ways = getWays();

    for(let x of ways){
        Table[x[0]][x[1]]=player;
        if (IsWin(Table,winLen).isWin){
            return x[0];
        }
        Table[x[0]][x[1]]=0;
    }

    return -1;
}

const go = (player, deepLvl=0)=>{
    if (deepLvl>=maxDeepLvl)
        return rateField(Player);
    let res=-2*INF;
    let column = -1;

    let ways = getWays(Table);

    let optimalContainer = [];

    for(let x of ways){
        Table[x[0]][x[1]]=player;
        let tmpRes = go(player===1?2:1, deepLvl+1);
        if (res<tmpRes){
            optimalContainer = [];
            res = tmpRes;
            column = x[0];
            optimalContainer.push({val: res, col: column});
        }
        if (res===tmpRes){
            optimalContainer.push({val: res, col: x[0]});
        }
        Table[x[0]][x[1]]=0;
    }

    if (!deepLvl)
        return optimalContainer[getRandom(0, optimalContainer.length-1)].col;
    return res;
}

const turn = (table, player, isWin, _winLen=4)=>{
    Table = table;
    IsWin = isWin;
    Player = player;
    winLen = _winLen;

    TLHandler.start = Date.now();
    
    let tmp = checkMayWin(player);
    if (tmp>=0)
        return tmp;
    return go(player);   
}

export default turn;