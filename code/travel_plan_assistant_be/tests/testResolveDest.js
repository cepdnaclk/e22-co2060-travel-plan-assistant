const { resolveDestination } = require("../services/distanceService");
require('dotenv').config();

async function runTests() {

    console.log("TEST 1: existing place");

    const a = await resolveDestination("Peradeniya");

    console.log(a);


    console.log("TEST 2: new place Colombo");

    const b = await resolveDestination("Jaffna");

    console.log(b);
}

runTests();