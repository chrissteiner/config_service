//jwt
'use strict';
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Server_defines = require('../_individuals/API_defines');

// PRIVATE and PUBLIC key use 'utf8' to get string instead of byte array  (512 bit key - ja obwohl unten RS256 steht. Wieso? keinen Dau)
// var privateKEY   = fs.readFileSync('./_config/_keys/private.key', 'utf8');
// var publicKEY    = fs.readFileSync('./_config/_keys/public.key', 'utf8');

module.exports = {
/*
 ====================   JWT Signing =====================
*/
    // sign: (payload, $Options) => {
    //     //    var i  = 'Chrizly';          // Issuer 
    //     //    var s  = 'some@user.com';        // Subject 
    //     //    var a  = 'user_id'; // Audience should de de Domain "http://Chrizly.at"
    //         // SIGNING OPTIONS
    //         var signOptions = {
    //             issuer:  $Options.issuer,
    //             subject:  $Options.subject,
    //             audience:  $Options.audience,
    //             expiresIn:  Server_defines.token_expries,
    //             algorithm:  "RS256"
    //         };
    //     //console.log(jwt.sign(payload, privateKEY, signOptions));    
    //     return jwt.sign(payload, privateKEY, signOptions);
        
    // },
/*
 ====================   JWT Verify =====================
*/
    verify: (token, $Option) => {

        var verifyOptions = {
            //Die VerifyOptions werden vom Client geprüft und müssen den SignOptions entsprechen, sonst kommt IsValid:false
            // issuer:  $Option.issuer,
            // subject:  $Option.subject,
            // audience:  $Option.audience,
            expiresIn:  Server_defines.token_expries,
            algorithm:  ["RS256"]
        }; 

        try{
            return jwt.verify(token, publicKEY, verifyOptions);
        }catch (err){
            console.log("Token is invalid");
            return "Token is invalid";
        }
    },

    decode: (token) => {
        //Diese Funktion dekodiert den JWT OHNE zu validieren, das heißt gefakte Token werden auch entschlüsselt.
        //Gedankenspiel -> man könnte bei verify->error diese Funktion aufrufen und den Inhalt dem Admin per Mail schicken zum manuellen prüfen
        return jwt.decode(token, {complete: true});
        //returns null if token is invalid
    }
}
