var strava = require('strava-v3');

function logProperties (x) {
    for (let p in x){
        console.log( '  ' + p + ': ' + x[p])
    }
}

function getActivities (params) {
  strava.activities.get({},function(err,payload,limits) {
    if(!err) {
        console.log('Activiies: ' + payload);
        console.log('Dismantling those...')
        logProperties(payload)
    }
    else {
        console.log('Error! ' + err);
    }
  });
}


function getAthlete () {
  strava.athlete.get({},function(err,payload,limits) {
    if(!err) {
        console.log(payload);
        console.log('Dismantling that...')
        console.log('Hi ' + payload.firstname)
        console.log('Limits:' + limits)
        logProperties(limits)
        var id = payload.id
        var params = { id }
        getActivities(params)

    }
    else {
        console.log('Error! ' + err);
    }
  });
}


getAthlete()
