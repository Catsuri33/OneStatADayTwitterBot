require("dotenv").config();
const twit = require("./twit");
const sncf = require("./sncf");
const spacex = require("./spacex");
const fs = require("fs");
const jimp = require('jimp');
const hypixel = require('hypixel-api-wrapper');
const twitch = require('twitch');

hypixel.setKey(process.env.HYPIXEL_KEY);

var date = new Date();
var nameImgOutput = "";

async function postTweetWithImg(path, imgTxt, tweetTxt, statType){

    if(statType == "twitter"){

        var nameImg = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_TwitterStat.png";
        nameImgOutput = nameImg;
        makeTwitterStatImg("./images/background.png", "./images/twitter/generated/" + nameImgOutput);
        console.log("Posted Twitter Tweet.");

    }

    if(statType == "hypixel_watchdog"){

        var nameImg = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_HypixelWatchdogStat.png";
        nameImgOutput = nameImg;
        makeHypixelWatchdogStatImg("./images/background.png", "./images/minecraft/hypixel/watchdog/generated/" + nameImgOutput);
        console.log("Posted Hypixel Watchdog Tweet.");

    }

    if(statType == "sncf"){

        var nameImg = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_SNCFStat.png";
        nameImgOutput = nameImg;
        makeSNCFStatImg("./images/background.png", "./images/sncf/generated/" + nameImgOutput);
        console.log("Posted SNCF Tweet.");

    }
    
    setTimeout(function(){

        var b64content = fs.readFileSync(path + nameImgOutput, { encoding: 'base64' });
 
        twit.post('media/upload', { media_data: b64content }, function (err, data, response) {

        var mediaIdStr = data.media_id_string;
        var altText = imgTxt;
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
 
        twit.post('media/metadata/create', meta_params, function (err, data, response) {

            if (!err) {
      
                var params = { status: tweetTxt, media_ids: [mediaIdStr] }
 
                twit.post('statuses/update', params, function (err, data, response) {});

            }

        });

    });

    }, 45000);

}

function postTweet(text){

    twit.post('statuses/update', { status: text }, function(err, data, response) {});

}

function makeTwitterStatImg(backgroundImgPath, writeImgPath){

    var twitterlogo = new jimp("./images/twitter/twitter_logo.png", function (err, img) {});

    jimp.read(backgroundImgPath, (err, img) => {

        if (err) throw err;
        img
          .composite(twitterlogo, 0, 0)
          .write(writeImgPath);

    });

}

async function makeHypixelWatchdogStatImg(backgroundImgPath, writeImgPath){

    var hypixellogo = new jimp("./images/minecraft/hypixel/hypixel_logo.png", function (err, img) {});
    var watchdogStats = await hypixel.getWatchdogStats();
    var watchdogStatsJson = JSON.parse(JSON.stringify(watchdogStats));
    var watchdogLastMinute = watchdogStatsJson.watchdog_lastMinute;
    var watchdogTotal = watchdogStatsJson.watchdog_total;
    var watchdogDaily = watchdogStatsJson.watchdog_rollingDaily;
    var watchdogStaffDaily = watchdogStatsJson.staff_rollingDaily;
    var watchdogStaffTotal = watchdogStatsJson.staff_total;

    jimp.read(backgroundImgPath, (err, img) => {

        if (err) throw err;
        img
          .composite(hypixellogo, 0, 0)
          .write(writeImgPath);
        
        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 438, 547, watchdogLastMinute);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 682, 547, watchdogTotal);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 1007, 547, watchdogDaily);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 558, 808, watchdogStaffDaily);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 834, 808, watchdogStaffTotal);
            img.write(writeImgPath);

        });

    });

}

async function makeSNCFStatImg(backgroundImgPath, writeImgPath){

    var sncflogo = new jimp("./images/sncf/sncf_logo.png", function (err, img) {});
    var actualDate = new Date();

    if((actualDate.getMonth() + 1) < 10){

        var since = String(actualDate.getFullYear()) + "0" + String(actualDate.getMonth() + 1);
        var until = String(actualDate.getFullYear()) + "0" + String(actualDate.getMonth() + 1);

    } else {

        var since = String(actualDate.getFullYear()) + String(actualDate.getMonth() + 1);
        var until = String(actualDate.getFullYear()) + String(actualDate.getMonth() + 1);

    }

    if(actualDate.getDate() < 10){

        since = since + "0" + String(actualDate.getDate()) + "T000000";
        until = until + "0" + String(actualDate.getDate()) + "T";

    } else {

        since = since + String(actualDate.getDate()) + "T000000";
        until = until + String(actualDate.getDate()) + "T";

    }

    if(actualDate.getHours() < 10){

        until = until + "0" + String(actualDate.getHours());

    } else {

        until = until + String(actualDate.getHours());

    }

    if(actualDate.getMinutes() < 10){

        until = until + "0" + String(actualDate.getMinutes());

    } else {

        until = until + String(actualDate.getMinutes());

    }

    if(actualDate.getSeconds() < 10){

        until = until + "0" + String(actualDate.getSeconds());

    } else {

        until = until + String(actualDate.getSeconds());

    }

    var totalTrips = await sncf.getVehicleJourneyCount(since, until);
    var totalDisruptions = await sncf.getDisruptionsAmount(since, until);
    var delayedAmount = await sncf.getDelayedAmount(since, until);
    var delayedPercentage = await sncf.getDelayedPercentage(since, until);
    var cancelledAmount = await sncf.getCancelledTripsAmount(since, until);
    var cancelledPercentage = await sncf.getCancelledTripsPercentage(since, until);

    jimp.read(backgroundImgPath, (err, img) => {

        if (err) throw err;
        img
          .composite(sncflogo, 0, 0)
          .write(writeImgPath);
        
        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 711, 518, totalTrips);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 721, 791, totalDisruptions);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 426, 765, delayedAmount);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 439, 842, Math.round(delayedPercentage) + "%");
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 1016, 765, cancelledAmount);
            img.write(writeImgPath);

        });

        jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {

            img.print(font, 1029, 842, Math.round(cancelledPercentage) + "%");
            img.write(writeImgPath);

        });

    });

}

async function start(){

    var actualDate = new Date();
    date = actualDate;
    var randomTweet = Math.floor(Math.random() * 2);

    if(randomTweet == 0){

        postTweetWithImg("./images/minecraft/hypixel/watchdog/generated/" + nameImgOutput, "OneStatADay", "", "hypixel_watchdog");

    } else if(randomTweet == 1){

        postTweetWithImg("./images/sncf/generated/" + nameImgOutput, "OneStatADay", "", "sncf");

    }

    //console.log(await spacex.getLaunchesTAmount());

    console.log("Sleep 24H");
    setTimeout(arguments.callee, 86355000);

}

start();