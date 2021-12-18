/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
var express=require('express');
var app=express();
var path = require('path');
var layout=require('express-layout');
var engine=require('ejs-mate');
var bodyparser=require('body-parser');
var session = require('express-session')

var middleware=[
    layout(),
    express.static(path.join(__dirname,'public'))
]
app.use(session({
    secret:'2*EYyd&@_&x2EqGu',
    resave:false,
    saveUninitialized:true
}))
app.use(middleware);
app.engine('ejs',engine);
app.set('view engine','ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended:true
}))
const routes=require('./routes');
app.use('/',routes);
app.get('/',function(req,res){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
    res.render('register')
})
'use strict';

const { Gateway, Wallets } = require('fabric-network');

const fs = require('fs');
const res = require('express/lib/response');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryAllCars');
        
        app.get('/display',function(req,res){
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.render('display',{users:result});
        })
        app.listen(3001,function(){
            console.log("Server started on port 3001");
        })
        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();