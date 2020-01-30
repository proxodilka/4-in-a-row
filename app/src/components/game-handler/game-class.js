const {Field} = require('./field');

const generateId = ()=>Math.random().toString(36).substr(2, 9);

const initValue = {
    field: new Field(),
    gameStatus: 'waiting for players',
    curePlayer: 1,
    players: [],
    winState: {
        isWin: false,
        winner: -1,
        cellsToPulse: []
    },
    creator: '__admin',
}

class Game{
    constructor(settings = {}){
        const defaultSettings = {
            ...initValue,
            ...settings
        };

        this.id = generateId();
        this.name = defaultSettings.name;
        this.field = new Field();
        this.gameStatus = defaultSettings.gameStatus;
        this.curePlayer = defaultSettings.curePlayer;
        this.players = [];
        this.spectators = [];
        this.creator = defaultSettings.creator;
        this.lastMoveInitiator = 0;
        this.lastActionEvent = Date.now();
        this.winState = {
            isWin: false,
            winner: -1,
            cellsToPulse: []
        };
        this.eventHandler = [];
    }

    joinPlayer({id, playerName, role}){
        console.log('trying to join player');
        switch (role){
            case 'player':{
                if (this.players.length>=2)
                    return {
                        ok: false,
                        reason: 'too many players in the room'
                    }
                this.players.push({id, playerName});

                if (this.players.length==2){
                    this.gameStatus='is on';
                }
                break;
            }

            case 'spectator':{
                this.spectators.push({id, playerName});
                break;
            }
        }
        
        this._execEvent('game-updated', this.getInfo());
        this._execEvent('status-changed', this.gameStatus);
        return {ok: true};
    }

    leavePlayer({id}){
        console.log('trying to kick', id, this.players);
        const ind = this.players.findIndex(x=>x.id==id);
        if (ind==-1){
            const specInd = this.spectators.findIndex(x=>x.id==id);
            if (specInd==-1)
                return;
            this.spectators.splice(specInd, 1);
            return;
        }
        this.gameStatus = 'on delete';
        this._execEvent('room-on-delete-now');
        this.players.splice(ind, 1);
        console.log('/leaves', this.players);
        if (this.players.length==0){
            this.reset();
        }
    }

    setCurePlayer(value){
        this.curePlayer = value;
        this._execEvent('game-updated', this.getInfo());
    }

    setField(value){
        this.field = value;
        this._execEvent('game-updated', this.getInfo());
    }

    getInfo(){
        return {
            id: this.id,
            field: this.field.getField(),
            gameStatus: this.gameStatus,
            curePlayer: this.curePlayer,
            players: this.players,
            winState: this.winState,
            lastMoveInitiator: this.lastMoveInitiator,
        }
    }

    move(columnId, action){

        let value=0;

        switch (action){
            case 'action': value=this.curePlayer; break;
            case 'hint': value=-this.curePlayer; break;
            case 'hidehint': value=0; break;
            default: value=0;
        }

        const newWinState = this.field.move(columnId, value);
        this.lastMoveInitiator = this.players[this.curePlayer-1];
        console.log(newWinState);
        this.winState = {
            ...this.winState,
            ...newWinState,
            cellsToPulse: newWinState.indexes || [],
        }

        if (!this.winState.isWin && action==='action'){
            console.log('setting new player');
            this.curePlayer=this.curePlayer==1?2:1;
        }
        else if (this.winState.isWin){
            this.gameStatus = 'ended';
            this._execEvent('status-changed', this.gameStatus);
        }
        this._execEvent('game-updated', this.getInfo());
    }

    restart(newStatus='is on'){
        console.log('restarting');
        this.field.reset();
        this.gameStatus = newStatus;
        this.curePlayer = initValue.curePlayer;
        //this.players = initValue.players;
        this.winState = initValue.winState;
        this._execEvent('game-updated', this.getInfo());
        this._execEvent('status-changed', this.gameStatus);
        console.log(this.gameStatus);
    }

    reset(){
        this.restart(initValue.gameStatus);
        this._execEvent('status-changed', this.gameStatus);
    }

    on(eventName, eventListener){
        //'rooms-updated'
        //'game-updated'
        this.eventHandler[eventName] = this.eventHandler[eventName] || [];
        this.eventHandler[eventName].push(eventListener);
        console.log('just pushed event|game', eventName, this.eventHandler, this.id);

    }

    removeListener(eventName, listener){
        switch (typeof(listener)){
            case 'string':{

                break;
            }

            case 'function':{

                break;
            }
            
            default:{
                return;
            }
        }
        if (typeof listener==='string'){

        }
    }

    _execEvent(eventName, ...args){
        const event = this.eventHandler[eventName];
        if (!event){
            return;
        }


        const eventListeners = event;
        this.lastActionEvent = Date.now();
        console.log('executing event', eventName, eventListeners, this.eventHandler);
        for(let event of eventListeners || []){
            event(...args);
        }
    }

}

export default Game;