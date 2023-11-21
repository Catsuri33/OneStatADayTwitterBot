const axios = require("axios");

async function getVehicleJourneyCount(since, until){

    const url = "https://api.sncf.com/v1/coverage/sncf/vehicle_journeys//?since=" + since + "&until=" + until + "&count=1&";
    const config = {

        auth: {

            username: process.env.SNCF_KEY,
            password: ''

        }

    }

    return (await axios(url, config).then(res => res.data.pagination.total_result));

}

async function getDisruptions(since, until){

    let items = 0;
    let page = 0;
    let disruptions = [];

    while(items === 1000 || page === 0){

        const url = "https://api.sncf.com/v1/coverage/sncf/disruptions//?since=" + since + "&until=" + until + "&count=1000&start_page=" + page + "&";
        const config = {

            auth: {
    
                username: process.env.SNCF_KEY,
                password: ''
    
            }
    
        }

        await axios(url, config).then(res => {

            items = res.data.pagination.items_on_page;

            disruptions = disruptions.concat(res.data.disruptions);

        });

        page++;

    }

    return disruptions;

}

async function getDisruptionsAmount(since, until){

    const disruptions = await getDisruptions(since, until);

    return disruptions.length;

}

async function getDelayedAmount(since, until){

    const vehicleJourneys = await getVehicleJourneyCount(since, until);
    const disruptions = await getDisruptions(since, until);
    const delayedDisruptions = disruptions.filter(el => {

        if(el.severity.effect === "SIGNIFICANT_DELAYS"){

            return el;

        }

        return null;

    });

    return delayedDisruptions.length;

}

async function getDelayedPercentage(since, until){

    const vehicleJourneys = await getVehicleJourneyCount(since, until);
    const disruptions = await getDisruptions(since, until);
    const delayedDisruptions = disruptions.filter(el => {

        if(el.severity.effect === "SIGNIFICANT_DELAYS"){

            return el;

        }

        return null;

    });

    return ((100 * delayedDisruptions.length) / vehicleJourneys);

}

async function getCancelledTripsAmount(since, until){

    const vehicleJourneys = await getVehicleJourneyCount(since, until);
    const disruptions = await getDisruptions(since, until);

    const cancelledTrips = disruptions.filter(el => {

        if(el.severity.effect === "NO_SERVICE"){

            if(el.severity.name === "trip canceled"){

                return el;

            }

        }

        return null;

    });
    
    return cancelledTrips.length;

}

async function getCancelledTripsPercentage(since, until){

    const vehicleJourneys = await getVehicleJourneyCount(since, until);
    const disruptions = await getDisruptions(since, until);
    const cancelledTrips = disruptions.filter(el => {

        if(el.severity.effect === "NO_SERVICE"){

            if(el.severity.name === "trip canceled"){

                return el;

            }

        }

        return null;

    });

    return ((100 * cancelledTrips.length) / vehicleJourneys);

}

module.exports = { getVehicleJourneyCount, getDisruptionsAmount, getDelayedAmount, getDelayedPercentage, getCancelledTripsAmount, getCancelledTripsPercentage };