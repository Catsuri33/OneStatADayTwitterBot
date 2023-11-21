const axios = require("axios");

async function getLaunchesAmount(){

    const url = "https://api.spacexdata.com/v4/launches";
    const config = {

        auth: {

            username: '',
            password: ''

        }

    }

    var res = await axios(url, config).then(res => res.data);
    var resObjectCount = Object.keys(res).length;

    return resObjectCount;

}

async function getLaunchesTAmount(){

    const url = "https://api.spacexdata.com/v4/launches";
    const config = {

        auth: {

            username: '',
            password: ''

        }

    }

    await axios(url, config).then(res => {

        var resObjectsLenght = Object.keys(res).length;
        var resObjects = Object.keys(res);

        for(i = 0; i < resObjectsLenght; i++){

            console.log(resObjects[i]);

        }

    });

}

module.exports = { getLaunchesAmount, getLaunchesTAmount };