const strava = require('strava-v3')
const $rdf = require('rdflib')

const kb = $rdf.graph()
const fetcher = $rdf.fetcher(kb)

const STRAVA_NS = 'https://www.w3.org/ns/pim/strava#'
const STRAVA = $rdf.Namespace(STRAVA_NS)
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const XSD = $rdf.Namespace('http://www.w3.org/2001/XMLSchema#')

const typeMap = {
  primary: 'boolean',
  athlete: 'boolean',
  bikes: 'unordered',
  created_at: 'date',
  commute: 'boolean',
  flagged: 'boolean',
  from_accepted_tag: 'boolean',
  has_heartrate: 'boolean',
  has_kudoed: 'boolean',
  manual: 'boolean',
  map : 'boolean', //  Check not aboject??
  shoes: 'unordered',
  start_date: 'date',
  start_date_local: 'date',
  private: 'boolean',
  trainer: 'boolean',
  type: 'class',
  updated_at: 'date'
}

function logProperties (x) {
  console.log('_________')
  for (let p in x) {
    console.log('  ' + p + ': ' + x[p])
  }
}

function storeProperty (thing, p, v) {
  if (v === null) return
  let pred = kb.sym('https://www.w3.org/ns/pim/strava#' + p)
  switch (typeMap[p]) {
    case 'unordered':
      let uri = thing.dir().uri + p + '/'
      for (let i=0; i < v.length; i++){
        let y = v[i]
        let obj = kb.sym(uri + y.id + '#this')
        console.log('  object of  ' + p + ' # ' + i + ' is ' + obj)
        storeProperties(obj, y)
      }
      break
    case 'boolean':
      v = (v ==='true')
      break
    case 'date':
      v = new Date(v) // OK with ISO??
      break
    case 'class':
      v = STRAVA(v.replace(/ /g, ''))
      pred = RDF('type')
      break
  }
  kb.add(thing, pred, v, thing.doc())

}

function storeProperties (thing, x) {
  for (let p in x) {
    storeProperty(thing, p, x[p])
  }
}

function thingForActivity (x) {
  return $rdf.sym(base + 'activity/' +  x.start_date.slice(0,4) + '/' + x.id + '/index.ttl#this')
}

function thingForPerson (x) {
  return $rdf.sym(base + 'person/' + x.id + '/index.ttl#this')
}

function thingForMe (x) {
  if (!base) throw new Error('what no base?')
  return $rdf.sym(base + 'index.ttl#me')
}

function getActivities () {
  strava.athlete.listActivities({}, function (err, payload, limits) {
    if (!err) {
      // console.log('Activiies: ' + payload)
      console.log('Dismantling those...' + payload.length)
      for (let i=0; i< payload.length; i++) {
        let activity = thingForActivity(payload[i])
        kb.add(me, STRAVA('activity'), activity)
        // logProperties(payload[i])
        storeProperties(activity, payload[i])
      }
      console.log('_______________________________________')
      console.log($rdf.serialize(undefined, kb, base, 'text/turtle'))
      // logProperties(payload)
    } else {
      console.log('Error! ' + err)
    }
  })
}

function getAthlete () {
  strava.athlete.get({}, function (err, payload, limits) {
    if (!err) {
      console.log('Limits:' + limits)
      // logProperties(limits)
      console.log(payload)
      console.log('Dismantling that...')
      console.log('Hi ' + payload.firstname)
      storeProperties(me, payload)
      getActivities()
    } else {
      console.log('Error! ' + err)
    }
  })
}
console.log('----------')
// logProperties(strava.athlete)
// console.log('----------')

var base = 'file:///temp/strava-archive/'
var me = thingForMe()

getAthlete()
