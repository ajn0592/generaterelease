/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */

const googleapis = require('googleapis');
var request = require('request');

exports.generaterelease = function generaterelease(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  if (req.query.letter === undefined) {
    // This is an error case, as "message" is required.
    console.warn(req.query.letter, 'not found');
    res.status(400).send('No letter defined!');
  } else {
    // Everything is okay.

    console.log(req.query.letter);

    var numReleases = 1;
    if (req.query.numReleases != undefined) {
      console.log("numReleases", req.query.numReleases, typeof(req.query.numReleases));
      if (req.query.numReleases > 1 && req.query.numReleases < 50) {
        numReleases = req.query.numReleases;
      }
    }

    var chosenAnimal = ""
    var chosenAdjective = ""

    request.get('https://storage.googleapis.com/adjectives-by-letter/'+req.query.letter.toUpperCase(), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var adjectiveList = body;
            console.log({"adjectives": adjectiveList})
            // Continue with your processing here.
            var adjectives = adjectiveList.split('\t');
            console.log(adjectives)

            request.get('https://storage.googleapis.com/animals-by-letter/'+req.query.letter.toUpperCase(), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var animalList = body;
                    console.log({"animals": animalList})
                    // Continue with your processing here.
                    var animals = animalList.split('\t');
                    console.log(animals)
                    var releases = []
                    for ( var i = 0; i < numReleases; i++ ) {
                        // This will loop numReleases times
                        chosenAdjective = adjectives[Math.floor(Math.random()*adjectives.length)];
                        chosenAnimal = animals[Math.floor(Math.random()*animals.length)];
                        var releaseName = chosenAdjective + ' ' + chosenAnimal;
                        if (releases.indexOf(releaseName) === -1) {
                          releases.push(releaseName)
                        }
                    }
                    console.log(releases);

                    res.status(200).send(releases);
                } else {
                  console.error('Problem getting animal file from storage bucket');
                  res.status(500).send('error getting animal file');
                }
            });
        } else {
          console.error('Problem getting adjective file from storage bucket');
          res.status(500).send('error getting adjective file');
        }
    });
  }
};
