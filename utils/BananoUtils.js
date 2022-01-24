require("dotenv").config({ path: "../.env" });
const config = require("../config.json");

const bananojs = require("bananojs");
const axios = require("axios");
bananojs.bananodeApi.setUrl(config["http-node"]);

const seed = process.env["WALLET_SEED"];

exports.getPublicKey = async (pkI) => {
    let ret = "";
    await bananojs.getPublicKey(bananojs.getPrivateKey(seed, pkI)).then(publicKey => {
        ret = bananojs.getBananoAccount(publicKey);
    });
    return ret;
}

exports.sendBan = async (destAccount, amountRaw, pkI=0) => {
    try {
        const response = await bananojs.bananoUtil.sendFromPrivateKey(
            bananojs.bananodeApi,
            bananojs.getPrivateKey(seed, pkI),
            destAccount,
            amountRaw,
            `ban_`
        );
        console.log(`payment successful: (${(amountRaw / 1e29).toFixed(8)} BAN)`, response);
        return response;
    } catch(err) {
        return err;
    };
}

exports.sendBanID = async (destI, amountRaw, pkI=0) => {
    const destAccount = await exports.getPublicKey(destI);
    const response = await bananojs.bananoUtil.sendFromPrivateKey(
        bananojs.bananodeApi,
        bananojs.getPrivateKey(seed, pkI),
        destAccount,
        amountRaw,
        `ban_`
    );
    console.log(`payment successful: (${(amountRaw / 1e29).toFixed(8)} BAN)`, response);
    return response;
}

exports.accountInfo = async (account) => {
    let accInfo = await bananojs.getAccountInfo(account, {
        "representative": "true"
    });
    return accInfo;
}

exports.accountBalance = async (account) => {
    let toReturn = {};
    await axios.post(config["http-node"], {  
        "action": "account_balance",
        "account": account
    })
    .then(res => {
        toReturn = res.data;
    })
    .catch(err => console.log(err));
    return toReturn;
}

exports.receivePending = async (pkI=0) => {
    const txList = await bananojs.receiveBananoDepositsForSeed(seed, pkI, config["rep-account"]);
    return txList;
}