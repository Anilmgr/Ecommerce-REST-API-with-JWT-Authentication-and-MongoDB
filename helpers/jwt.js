const expressJwt = require('express-jwt');

function authJwt(){
    const secret = process.env.JWT_SECRET;
    const api = process.env.API_URL;
    return expressJwt({
        secret: secret,
        algorithms: ['HS256'],
        isRevoked: isRevokedCallback
    }).unless({
        path:[
            {url:/\/public\/uploads(.*)/, methods:['GET','OPTIONS']},
            {url:/\/api\/v1\/products(.*)/, methods:['GET','OPTIONS']},
            {url:/\/api\/v1\/categories(.*)/, methods:['GET','OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}

async function isRevokedCallback(req,payload,done){
    if(!payload.isAdmin){
        done(null,true);
    }
    done();
}

module.exports = authJwt;