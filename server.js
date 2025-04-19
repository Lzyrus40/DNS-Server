const dgram = require("node:dgram");
const dnsPacket = require("dns-packet");
const { type } = require("node:os");
const server = dgram.createSocket("udp4");

const db = {
    "lzyrus.dev": {
        type:'A',
        data:'127.0.0.1'
    },
    "blog.lzyrus.dev": {
        type:'CNAME',
        data:'hashnode.networks'
    }
}

server.on("message", (msg, rinfo) => {
    const incomingReq = dnsPacket.decode(msg);
    const ipFromDb = db[incomingReq.questions[0].name];
    const ans = dnsPacket.encode(({
        type: "response",
        id: incomingReq.id,
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incomingReq.questions,
        answers: [{
            type: ipFromDb.type,
            class: 'IN',
            name: incomingReq.questions[0].name,
            data: ipFromDb.data
        }]
    }),
    server.send(ans, 0,rinfo.port, rinfo.address)
)
})



server.bind(53, () => console.log("DNS Server is running on port 53"));

// Test with dig command using => dig @localhost lzyrus.dev