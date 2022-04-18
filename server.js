const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors')



const users = {};
const agents = {};
const chatRequests = [];

const connections = {};


app.use(cors());

app.get('/', (req, res) => {
    res.end("Socket Server")
});

io.on('connection', (socket) => {
    console.log('a user connected');


    socket.on('user:agent:message', ({ user, agent, message }) => {
        console.log(message)
        const userSocket = agents[agent.id].socket;
        userSocket.emit('message', { user, agent, message });
    });

    socket.on('agent:user:message', ({ user, agent, message }) => {
        const userSocket = users[user.id].socket;
        userSocket.emit('message', { user, agent, message });
    });

    ///////////////////////////////////
    /////// Client Listeners //////////
    ///////////////////////////////////

    socket.on('client:register', ({ user, history }) => {
        users[user.id] = { user, socket, history };


        const registerdAgents = Object.keys(agents);

        if (registerdAgents.length > 0) {
            agents[registerdAgents[registerdAgents.length - 1]].socket.emit('client:agent:request', { user, history })
        } else {
            chatRequests.push(user);
        }
    });



    ///////////////////////////////////
    /////// Agents Listeners //////////
    ///////////////////////////////////

    socket.on('agent:register', agent => {
        console.log('agent:register', agent)
        agents[agent.id] = { agent, socket };
    });

    socket.on('agent:client:accept', ({ user, agent }) => {
        console.log("agent accepting request", user)
        const userSocket = users[user.id].socket;
        userSocket.emit('agent:accepted', agent);
    });

});

http.listen(9999, () => {
    console.log('listening on *:9999');
});