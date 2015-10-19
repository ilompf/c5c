var restify = require( 'restify' ),

    mongo = require( 'mongodb' ),
    mongoURI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/c5c',

    server = restify.createServer(),
    port = process.env.PORT || 5000,

    /**
     * Checks if table generation is allowed and either generates a new table
     * and writes new latest data to the db for the next table generation and
     * returns the table, or returns a msg that generation is not allowed yet.
     */
    onPost = function ( req, res, next ) {
        res.contentType = 'application/json';

        getLatest( function ( err, results ) {
            if ( err ) console.log( 'Error' );

            var lastChores = results[ 0 ].data,
                lastDate = new Date( results[ 0 ].date );

            if ( isGenerationAllowed( lastDate )) {
                var people = [ 'Joel', 'Noëmi', 'Sebu', 'Michèle', 'Janna', 'Selda', 'Timo', 'X' ],
                    schedule = generateSchedule( lastDate ),
                    randomizedChores = randomizeChores( lastChores ),
                    table = createTable( schedule, people, randomizedChores ),

                    scheduleParams = { 'date': formatDate( schedule[ 0 ] ), 'data': table },

                    //params to create the next table from
                    latestDate = new Date( schedule[ schedule.length - 1 ]),
                    latestChores = randomizedChores[ randomizedChores.length - 1 ],
                    latestParams = { 'date': formatDate( latestDate ), 'data': latestChores };

                writeToDb( 'schedules', scheduleParams );
                writeToDb( 'latest', latestParams );

                res.send( scheduleParams );
                return next();

            } else {
                return next( new restify.BadRequestError( 'Generation is not allowed yet!' ));
            }
        });
    },

    /**
     * Creates a new database entry in the given collection using the given
     * parameters.
     * @param  {String} cName - name of the collection in which to create the entry.
     * @param  {Object} params - dict of params for the new db entry.
     */
    writeToDb = function ( cName, params ) {
        mongo.Db.connect( mongoURI, function ( err, db ) {
            if ( err ) return console.log( err );

            db.collection( cName, function ( err, collection ) {
                if ( err ) return console.log( err );

                collection.save( params, function ( err, result ) {
                    if ( err ) return console.log( err );
                });
            });
        });
    },

    /**
     * Gets the last date and chores distribution from the previous plan.
     */
    getLatest = function ( callback ) {
        mongo.Db.connect( mongoURI, getCollection );

        function getCollection( err, db ) {
            if ( err ) return console.log( err );
            db.collection( 'latest', getItems );
        }

        function getItems( err, collection ) {
            if ( err ) return console.log( err );
            collection.find().sort({ '_id': -1 }).limit( 1 ).toArray( callback );
        }
    },

    /**
     * Helper to determine if it is allowed to generate the new chores table
     * already, i.e. if the old one expires in less than a week.
     * @param {Date} lastDate - date when the old chores plan expires.
     * @return {Boolean} - true if generation is allowed, else undefined.
     */
    isGenerationAllowed = function ( lastDate ) {
        var today = new Date();
            weekBefore = new Date( lastDate.valueOf() ),
            interval = lastDate.getDate() - 7;

        weekBefore.setDate( interval );

        if ( today > weekBefore ) {
            return true;
        }
    },

    /**
     * Creates the array with the next four datestrings based on the last date.
     * @param {Date} lastDate - the date the chores were done last time.
     * @return {Array} - contains the next four dates at weekly intervals.
     */
    generateSchedule = function ( lastDate ) {
        var newDate,
            next,
            schedule = [],
            i;

        for ( i = 1; i < 5; i++ ) {
            newDate = new Date( lastDate.valueOf() );
            next = lastDate.getDate() + ( i * 7 );
            newDate.setDate( next );
            schedule.push( newDate.toDateString() );
        }

        return schedule;
    },

    /**
     * Randomizes chores and pushes them to an array iff they are different
     * in every index relative to the previous chores distribution. Does this
     * until the array contains four entries (= weekly chores for one month).
     * @param  {Array} chores - chores in the order of their last distribution.
     * @return {Array} - a 2D array containing four randomized chore distributions.
     */
    randomizeChores = function ( chores ) {
        var randomizedChores = [],
            choresNew = chores.slice(),
            tmpChores = chores.slice(),
            randomize = function () {
                return 0.5 - Math.random();
            };

        while ( randomizedChores.length < 4 ) {
            choresNew.sort( randomize );

            if ( !isRepetitive( tmpChores, choresNew ) ) {
                tmpChores = choresNew.slice();
                randomizedChores.push( tmpChores );
            }
        }

        return randomizedChores;
    },

    /**
     * Helper to determine if there are any repetitive elements in two
     * chores arrays.
     * @param {Array} choresOld - old chores distribution.
     * @param {Array} choresNew - randomized chores distribution.
     * @return {Boolean} - true if there are repetitive elements, else undefined.
     */
    isRepetitive = function ( choresOld, choresNew ) {
        for ( var i = 0; i < choresOld.length; i++ ) {
            if ( choresOld[ i ] === choresNew[ i ] ) {
                return true;
            }
        }
    },

    /**
     * Creates an array containing the rows of a chores table as follows:
     * [date1, date2, ...]
     * [person1, chore1, chore2, ...]
     * [person2, chore1, chore2, ...]
     * @param  {Array} schedule - contains the four due dates.
     * @param  {Array} people - contains the names of the chore-doers.
     * @param  {Array} randomizedChores - contains the randomized chores arrays.
     * @return {Array} - 'table' sliced in arrays, where an array is a table row.
     */
    createTable = function ( schedule, people, randomizedChores ) {
        randomizedChores.unshift( people ); // prepend the randomized arrays by people
        var table = transpose( randomizedChores ); // now we have line by line person n, chores..
        table.unshift( schedule ); // the first line is the schedule
        return table;
    },

    /**
     * Transposes a 2D array.
     */
    transpose = function ( array ) {
    return Object.keys( array[ 0 ]).map(
        function ( column ) { return array.map( function ( row ) { return row[ column ]; }); }
        );
    },

    /**
     * Formats a date object as "yyyy-mm-dd".
     */
    formatDate = function ( date ) {
        if ( typeof date === "string" ) {
            date = new Date( date );
        }
        return date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate();
    },

    /**
     * Passes a GET request on to handle Request.
     */
    onGet = function ( req, res, next ) {
        handleRequest( req, res, next );
    },

    /**
     * Gets items from the collection given in request params. If date is given,
     * check for either the collection entry with the same date or, if date is "last",
     * fetch the last entry from the given collection and return it. If no date
     * is given, return all items from that collection.
     */
    // TODO: put into an object ie. RequestHandler :)
    handleRequest = function ( req, res, next ) {
        mongo.Db.connect( mongoURI, getCollection );

        function getCollection( err, db ) {
            if ( err ) return console.log( err );
            db.collection( 'schedules', getItems );
        }

        function getItems( err, collection ) {
            if ( err ) return console.log( err );
            if ( req.params.date ) {
                collection.findOne( { date: req.params.date }, returnItems );
            } else {
                collection.find().toArray( returnItems );
            }
        }

        function  returnItems( err, items ) {
            if ( err ) return console.log( err );

            res.contentType = 'application/json';
            res.send( items );
        }
    };

server.use( restify.acceptParser( server.acceptable ));
server.use( restify.bodyParser() );
server.use( restify.gzipResponse() );

// verbs
server.pre( function( req, res, next ) {
    res.header( 'Access-Control-Allow-Origin', '*' );
    res.header( 'Access-Control-Allow-Headers', 'X-Requested-With' );
    return next();
});

server.use(restify.CORS());
server.use(restify.fullResponse());
restify.CORS.ALLOW_HEADERS.push('authorization');

server.post( '/schedules', onPost );

server.get( '/schedules', onGet );
server.get( '/schedules/:date' , onGet );

server.get( /\/?.*/, restify.serveStatic( {
    directory: './public',
    default: 'index.html'
}));

// start the server
server.listen( parseInt( port, 10 ), '0.0.0.0', function () {
    console.log( '%s listening at %s!', server.name, server.url );
});
