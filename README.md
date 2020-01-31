# 4 in a row game

**Training project by implementing 4 in a row game, targeted to learn basic React concepts**

![](https://sun9-28.userapi.com/c854416/v854416664/1e3770/Mee2MqxbLig.jpg)

## Small description
Implementation of classic 4 in a row game, two players throws down balls of their colors and that who will get four color in a row wins.
Player could play with his friend, with computer, or watch how AI trying to beat the same AI.

Game supports multiplayer, it's lobby based and implemented with web-socket protocol, you may proceed to [server side repository](https://github.com/proxodilka/4-in-a-row-server) to know more.
![demo](https://s5.gifyu.com/images/4inrow_demo0fe3c52bedd47dc0.gif)

## Used technologies
- **[React 16.9](https://github.com/facebook/react/)** 
- **[Socket.IO 2.3.0](https://github.com/socketio/socket.io-client)**
- **[Bootstrap 4.3.1](https://github.com/twbs/bootstrap)**

## How to run it localy
- Clone repository

  `git clone https://github.com/proxodilka/4-in-a-row`
- Install packages

  `npm install`
- If you want to have your own multiplayer server, set `REACT_APP_SERVER_BASE` variable at `.env` file, it's located at `app/` folder. You may let variable equals to `null` or delete this file to disable multiplayer.
By default it linked to demo server `REACT_APP_SERVER_BASE = "https://inarow-server.herokuapp.com/"`.
Visit [server side repository](https://github.com/proxodilka/4-in-a-row-server) to know more.

- Run local dev server by `npm start`
