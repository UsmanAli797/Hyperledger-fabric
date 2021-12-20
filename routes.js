// const { equal } = require('assert');
// const { randomInt } = require('crypto');
const express = require('express');
const { Session } = require('express-session');
const { redirect } = require('express/lib/response');
const router = express.Router();
// const imageToBase64 = require('image-to-base64');
var fs = require('fs');




router.get('/layout', function (req, res) {
    res.render('layout', {
        errors: {},
        success: {}
    })
})
router.get('/dashboard', function (req, res) {
    res.render('dashboard', {
        errors: {},
        success: {}
    })
})


//register
router.get('/register', function (req, res) {
    res.render('register', {
        errors: {},
        success: {}
    })
})
router.post('/register_c', function (req, res) {
    errors = []
    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            success: {}
        })
    }
    else {


        /*
         * Copyright IBM Corp. All Rights Reserved.
         *
         * SPDX-License-Identifier: Apache-2.0
         */

        'use strict';
        const { Gateway, Wallets } = require('fabric-network');
        // const { Wallets } = require('fabric-network');
        const FabricCAServices = require('fabric-ca-client');
        const fs = require('fs');
        const path = require('path');

        async function main() {
            try {
                // load the network configuration
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

                // Create a new CA client for interacting with the CA.
                const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
                const ca = new FabricCAServices(caURL);

                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userIdentity = await wallet.get(req.body.idCard);
                if (userIdentity) {
                    console.log(`${req.body.fname} already exists`);
                    return;
                }

                // Check to see if we've already enrolled the admin user.
                const adminIdentity = await wallet.get('admin');
                if (!adminIdentity) {
                    console.log('An identity for the admin user "admin" does not exist in the wallet');
                    console.log('Run the enrollAdmin.js application before retrying');
                    return;
                }

                // build a user object for authenticating with the CA
                const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
                const adminUser = await provider.getUserContext(adminIdentity, 'admin');

                // Register the user, enroll the user, and import the new identity into the wallet.
                const secret = await ca.register({
                    affiliation: 'org1.department1',
                    enrollmentID: req.body.idCard,
                    role: 'client'
                }, adminUser);
                const enrollment = await ca.enroll({
                    enrollmentID: req.body.idCard,
                    enrollmentSecret: secret
                });
                IdCard = req.body.idCard;
                const x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                        IdCard: enrollment.IdCard,
                    },
                    mspId: 'Org1MSP',
                    type: 'X.509',
                    Name: req.body.fname,
                    IdCard: req.body.idCard,

                };
                await wallet.put(req.body.fname, x509Identity);
                console.log(`Successfully registered user ${req.body.fname}`);


                //storing in database
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('fabcar');
                // num = Math.floor(Math.random()*11)
                // numm = num.toString()

                // Submit the specified transaction.
                // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
                // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
                await contract.submitTransaction('CreateUser', req.body.fname, req.body.fname, req.body.lname, req.body.idCard, req.body.email, req.body.pass1);
                console.log('Transaction has been submitted');
                res.redirect('/login')

            } catch (error) {
                console.error(`Failed to register user ${req.body.fname}: ${error}`);
                // console.error(`Failed to submit transaction: ${error}`);
                // process.exit(1);
                res.redirect('/register');
                process.exit(1);


            }


        }

        main();
    }
})







//login 

router.get('/login', function (req, res) {
    res.render('login', {
        errors: {},
        success: {}
    })
})
router.post('/login_c', function (req, res) {
    errors = []
    if (errors.length > 0) {
        res.redirect('/login')
    }
    else {
        /*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const fs = require('fs');
        const path = require('path');

        async function main() {
            try {
                // load the network configuration
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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
                // num = Math.floor(Math.random()*11)
                // numm = num.toString()

                // Submit the specified transaction.
                // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
                           var login = await contract.evaluateTransaction('Login', req.body.email, req.body.pass);
                console.log(login.toString());
                console.log(req.body.pass);
                console.log(req.body.email);

                if (login.toString() == 'true') {
                    session = req.session;
                    session.userid = req.body.email;
                    console.log(req.session)
                    console.log("Login successfully");
                    res.redirect('/dashboard')

                    // Disconnect from the gateway.

                }
                else {
                    res.redirect('/login')
                    console.log("Login failed");

                }
                await gateway.disconnect();

                //await contract.submitTransaction('CreateUser',numm, req.body.fname, req.body.lname, req.body.idCard, req.body.email, req.body.pass1);
                // session.userID= req.body.email;
                // console.log('Transaction has been submitted');
                // console.log(req.session.userID)


            } catch (error) {
                console.error(`Failed to submit transaction: ${error}`);
                res.render('/login');
                process.exit(1);
            }

        }

        main();

    }
})
//complaint


router.get('/complaint', function (req, res) {
    res.render('complaint', {
        errors: {},
        success: {}
    })

})
router.post('/complaint_c', function (req, res) {
    errors = []
    if (errors.length > 0) {
        res.redirect('/complaint')
    }
    else {
        /*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

        'use strict';

        const { Gateway, Wallets } = require('fabric-network');
        const fs = require('fs');
        const path = require('path');

        async function main() {
            try {
                // load the network configuration
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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
                // num = Math.floor(Math.random()*11)
                // numm = num.toString()
//Not working base 64
                // imageToBase64(res.body.result) // insert image url here. 
                //     .then((response) => {
                //         console.log(response);  // the response will be the string base64.
                //     }
                //     )
                //     .catch(
                //         (error) => {
                //             console.log(error);
                //         }
                //     )
//2nd solution failed
// var imageAsBase64 = fs.readFileSync(req.body.result, 'base64');
// console.log(imageAsBase64);

//3rd solution
// var file = fs.readFileSync(req.body.result,{encoding:"base64"});
// console.log(file);

                // Submit the specified transaction.
                // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
                await contract.submitTransaction('CreateComplaint', req.body.name, req.body.name, req.body.idCard, req.body.email, req.body.phone, req.body.date, req.body.case, req.body.desc, req.body.result);
                res.redirect('/dashboard')

                await gateway.disconnect();

                //await contract.submitTransaction('CreateUser',numm, req.body.fname, req.body.lname, req.body.idCard, req.body.email, req.body.pass1);
                // session.userID= req.body.email;
                // console.log('Transaction has been submitted');
                // console.log(req.session.userID)


            } catch (error) {
                console.error(`Failed to submit transaction: ${error}`);
                process.exit(1);
            }

        }

        main();

    }
})



























module.exports = router
