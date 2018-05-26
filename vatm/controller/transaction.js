/******************************************************************************
Title: Transaction
Author: Robert Hill  = RH3;
Date: 05/12/2018 - 5/16/2018
Code version: 1.0.0;
Location: ../controller
-------------------------------------------------------------------------------
This File has the functions for the
* Servers reference, to Pass data
* to a function to try to POST, PUT, or GET data
* ---
* Controller validate, value formats. --If the JSON keys Pass--
* ---
* The verified information is passed to the Model.
* To attempt INSERT, UPDATE, and SELECT statements
* ---
* on the transaction table in VATM DB
--RH3
--Last Modified--> RH3 05/16/2018
******************************************************************************/
//This is for reference for model functions
const model = require('../model/model');

//This is for reference for helper functions
const helper = require('../helpers/helpers');

//Check to see if fields are formatted the Data
let serverGetTrans = helper.trans.select;

//To Check PUT request format from server
let serverPutTrans = helper.trans.update;

//To Check POST request format from server
let serverPostTrans = helper.trans.insert;

//To work with Confirmation Code
//// keys (gCode: addCode to new Obj),(cAuth: Authenticate),(makeCode: string maker)
let contCon = helper.codeCon ;

//To work with the Token Code
let contToken = helper.token ; // keys (generate: generate), (decode: decode)

/*****************************************************************************
                              GET / SELECT
*****************************************************************************/
/**
 * This is the function for the Controller
 * to try a SELECT statement for the
 * from the Model--> DB
 * // -->Controller expects all the following keys:
 * // * Token
 * // * transactionId && id
 * //                          --RH3 05/12/2018
 * @param  {[type]}   data     Server data === Encrypted Token and transactionId
 * @param  {Function} callback Model data == selected transaction information
 * @return {[type]}            JSON object
 */
//
let get = function(data, callback) {
////////////////////////////////////////////////////////////////////////////////
      /*    Validate Server Data format   */
////////////////////////////////////////////////////////////////////////////////
  //Check the Server Data
  var getData = serverGetTrans(data);

  //Begin process function
  if(getData){
    /**************************************************************************/
    //////////////////////////Process Server Data//////////////////////////////
    /**************************************************************************/
    //Object for server output
    var transGet = {};
    //get the token from the data
    var getToken = data.token;
    //decode the token to make phoneNumber & password
    var theToken = contToken.decode(getToken);
    //add the phoneNumber key
    //and the associated phoneNumber
    //to the data
    data["phoneNumber"] = theToken.phoneNumber;
    //add the password key
    //and the associated password
    //to the data
    data["password"] = theToken.password;
    //remove the token from the data Object
    delete data["token"];
    //Use the Object to store server data
    transGet = data;
    //reference to the Model function
    /*-------------------------------------------------------------------------
    / Model Function
    / Controller sends data
    --> Controller to Model to run SELECT statment
    -------------------------------------------------------------------------*/
    model.transaction.get(transGet, function(err, result){
      //Trigger Model error occured from the model
      if(err === 500) {
        return callback(500, result);
      }
      else {
/*$$$$$$$$$$$$$$$$$$ Model returns this information to controller$$$$$$$$$$$$$*/
        //ServerData Returned Object /To string --5/23/2018 RH3
        var resultTranscationId = result.transactionId;
        result.transcationId = resultTranscationId.toString();
        // MOD convert Model return data from
        // Integers to Strings for
        // UI compatibility per WW --RH3
        //transactionAmount
        var transAmount = result.transactionAmount;
        result.transactionAmount = transAmount.toString();
        //cashBackAmount
        var cashBackAmount = result.cashBackAmount;
        result.cashBackAmount = cashBackAmount.toString();
        //transactionFee
        var transFee = result.transactionFee;
        result.transactionFee = transFee.toString();
        //total
        var total = result.total;
        result.total = total.toString();
        //send it on back

        return callback(200, result);
      }
    });
  }
  else /*/There was an issue with the data format/*/{
      return callback(406, data);
  }
};
/*****************************************************************************
                              PUT / UPDATE
*****************************************************************************/
/**
 * This is the function for the Controller
 * to try an UPDATE statement for the
 * from the Model--> DB
 * -->Controller expects all the following keys:
 * // * Token
 * // * transactionId && id
 * // * trasactionAmount
 * // * cashBackAmount
 * // * transactionFee
 * // * total
 * // * timeRequested
 * // * timeDelivered && null
 * // * confirmationCode && string
 * // * isCancelled
 *  --RH3 05/12/2018
 * @param  {[type]}   data     Server data == JSON obj
 * @param  {Function} callback Model data == JSON obj of UPDATED information
 * @return {[type]}            JSON object
 -----------------------------------------------------------------------------*/
let put = function(data, callback) {
////////////////////////////////////////////////////////////////////////////////
      /*    Validate Server Data format   */
////////////////////////////////////////////////////////////////////////////////
//////////////Validate Token & Keys format
  var tTransPut = (serverGetTrans(data) && serverPutTrans(data));
////////////////////////////////////////////////////////////////////////////////

/******************Token & Keys format were checked*************/
    if (tTransPut){
/**************************************************************************/
//////////////////////////Process Server Data//////////////////////////////
/**************************************************************************/
      //Object for server output
      var transPut = {};
      //get the token from the data
      var getToken = data.token;
      //decode the token to make phoneNumber & password
      var theToken = contToken.decode(getToken);
      //add the phoneNumber key
      //and the associated phoneNumber
      //to the data
      data["phoneNumber"] = theToken.phoneNumber;
      //add the password key
      //and the associated password
      //to the data
      data["password"] = theToken.password;
      //remove the token from the data Object
      delete data["token"];
      //Use the Object to store server data
      transPut = data;
      //console.log(transPut);
        //reference to the Model function
        /*-------------------------------------------------------------------------
        / Model Function
        / Controller sends data
        --> Controller to Model to run INSERT statment
        -------------------------------------------------------------------------*/
        model.transaction.put(transPut, function(err, result){
          //Trigger Model error occured from the model
          if(err === 500) {
          console.log(result);
            return callback(500, result);
          }
          else {
/*$$$$$$$$$$$$$$$$$$ Model returns this information to controller$$$$$$$$$$$$$$$*/
            //add model transactionId to the
            //ServerData Returned Object /To string --5/23/2018 RH3
            var transPutTranscationId = result.transactionId;
            transPut.transcationId = transPutTranscationId.toString();
            // MOD convert Model return data from Integers to Strings for UI compatibility per WW --RH3
            //transactionAmount
            var transAmount = result.transactionAmount;
            transPut.transactionAmount = transAmount.toString();
            //cashBackAmount
            var cashBackAmount = transPut.cashBackAmount;
            transPut.cashBackAmount = cashBackAmount.toString();
            //transactionFee
            var transFee = transPut.transactionFee;
            transPut.transactionFee = transFee.toString();
            //add confirmationCode to the ServerData Object
            var confir = contCon.makeCode(transPut);
            transPut.confirmationCode = confir;
            //total
            var total = transPut.total;
            transPut.total = total.toString();
            //send it on back
            return callback(200, transPut);
          }
        });
      // } else There was an issue with the data format/{
      //   return callback(500, data);
      }else /*Send back Server data*/{
         return callback(406, data);
    }
};
/*****************************************************************************
                              POST / INSERT
*****************************************************************************/
/**
 * This is the function for the Controller
 * to try an INSERT statement for the
 * Model--> DB
 * -->Controller expects all the following keys:
 * // * Token
 * // * transactionId --> null !value
 * // * trasactionAmount
 * // * cashBackAmount
 * // * transactionFee
 * // * total
 * // * timeRequested
 * // * timeDelivered --> null !value
 * // * confirmationCode --> null !value
 * // * isCancelled
 *  --RH3 05/13/2018
 * @param  {[type]}   data     Server data == JSON obj
 * @param  {Function} callback Model data == JSON obj of UPDATED information
 * @return {[type]}            JSON object
 -----------------------------------------------------------------------------*/
let post = function(data, callback) {
////////////////////////////////////////////////////////////////////////////////
      /*    Validate Server Data format   */
////////////////////////////////////////////////////////////////////////////////
  var tTransPost = (serverGetTrans(data) && serverPostTrans(data));
////////////////////////////////////////////////////////////////////////////////
/******************Token & Keys format were checked*************/
    if (tTransPost){
/**************************************************************************/
//////////////////////////Process Server Data//////////////////////////////
/**************************************************************************/
      //Create an Object for the
      //Server output Data
      var transPost = {};
      //get the token from the data
      var getToken = data.token;
      //decode the token to make phoneNumber & password
      var theToken = contToken.decode(getToken);
      //add the phoneNumber key
      //and the associated phoneNumber
      //to the data
      data["phoneNumber"] = theToken.phoneNumber;
      //add the password key
      //and the associated password
      //to the data
      data["password"] = theToken.password;
      //Prepare the Data to be passed
      //to the Model
      transPost = data;
      //remove the token key from the passed Object
      delete transPost["token"];
        //reference to the Model function
        /*-------------------------------------------------------------------------
        / Model Function
        / Controller sends data
        --> Controller to Model to run INSERT statment
        -------------------------------------------------------------------------*/
        model.transaction.post(transPost, function(err, result){

          //Trigger Model error occured from the model
          if(err === 500) {
          console.log(result);
            return callback(500, result);
          }
          else {
/*$$$$$$$$$$$$$$$$$$ Model returns this information to controller$$$$$$$$$$$$$$$*/
            //add the transactionId to the ServerData Object
            transPost.transactionId = result.transactionId;
            //add confirmationCode to the ServerData Object
            var confir = contCon.makeCode(transPost);
            transPost.confirmationCode = confir;
            /*MOD requested 05/17/2019 --BB (Remove the phoneNumber & password
            //for security reasons)*/
            //Completed by --RH3
            var transPutTranscationId = result.transactionId;
            transPost.transcationId = transPostTranscationId.toString();
            // MOD convert Model return data from Integers to Strings for UI compatibility per WW --RH3
            //transactionAmount
            var transAmount = result.transactionAmount;
            transPost.transactionAmount = transAmount.toString();
            //cashBackAmount
            var cashBackAmount = transPost.cashBackAmount;
            transPost.cashBackAmount = cashBackAmount.toString();
            //transactionFee
            var transFee = transPost.transactionFee;
            transPost.transactionFee = transFee.toString();
            //add confirmationCode to the ServerData Object
            var confir = contCon.makeCode(transPost);
            transPost.confirmationCode = confir;
            //total
            var total = transPost.total;
            transPost.total = total.toString();
            return callback(200, transPost);
          }
        });
      // } else There was an issue with the data format/{
      //   return callback(500, data);
      }else /*Send back Server data*/{
         return callback(406, data);
    }
};

/*******************************************************************************
                                EXPORTED MODULES
*******************************************************************************/

module.exports = {
    "get"  : get,
    "put"  : put,
    "post" : post
};
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//**TEST Dev Sandbox***********************************************************/
//----------------------------------------------------------------------------//
// var test =  {
//   "token" : 'R0dzbGFwLmFwcHxtdGF2fDgxNzg2Mzc4MjA=',
//   "transactionAmount": '7.36',
//   "cashBackAmount": '60.16',
//   "transactionFee": '4.00',
//   "total": '35.07',
//   "timeRequested": '2019-05-13 02:28:31',
//   "timeDelivered": null,
//   "transactionId": '23',
//   "confirmationCode": 'MjAxOS0wNS0xMyAwMjoyODozMXx2YXRtfDIz'
// 	};
//
// put(test);
// console.log(putDataTransChecker(test));
// var postTest =  {
//   "token" : 'R0dzbGFwLmFwcHxtdGF2fDgxNzg2Mzc4MjA=',
//   "transactionAmount": '7.36',
//   "cashBackAmount": '60.16',
//   "transactionFee": '4.00',
//   "total": '35.07',
//   "timeRequested": '2019-05-13 02:28:31',
//   "transactionId": null, //'23',
//   "confirmationCode": null, //'MjAxOS0wNS0xMyAwMjoyODozMXx2YXRtfDIz'
// 	};
//
// var token = helper.token.generate({
//  "phoneNumber": 2345678955,
//  "password": "Password2123!"});
// console.log(token);
// var transData = {
//  "token": "UGFzc3dvcmQyMTIzIXxtdGF2fDIzNDU2Nzg5NTU=",
//  "transactionId": null,
//  "transactionAmount": 32,
//  "cashBackAmount": 20,
//  "transactionFee": 4,
//  "total": 56,
//  "timeRequested": '2018-05-13 12:00:00',
//  "timeDelivered": null,
//  "confirmationCode": null,
//  "isCancelled": false
// };
// //
// //console.log(post(transData));
// post(transData, function(err, data){
//   console.log(err);
//   console.log(data);
// });
// console.log(putDataTransChecker(test));
