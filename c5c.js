;(function ( document, window ) {

    // arrays for people and chores. there have to be as many people as chores.
    var people = [ "Joel", "Carola", "Sebu", "Michèle", "Paolo", "Lisa", "Timo", "Ilona" ],
        chores = [ "Zimmer", "Joker*", "Küche", "1. Stock", "Kühlschrank", "Diverses", "Entsorgung", "Boden" ],
        schedule = [],
        startDate = new Date( '2013-07-25' ),
        container = document.getElementById( 'container' ),
        // last chores: 0: "Zimmer" "Diverses" "1. Stock" "Küche" "Kühlschrank" "Joker*" "Boden" "Entsorgung"

        /**
         * Create the array with all four dates based on the startdate.
         * @param {Date} startDate - the next date the chores should be done.
         * @return {Array} - contains the next four dates at weekly intervals.
         */
        generateSchedule = function ( startDate ) {
            var newDate,
                next,
                schedule = [],
                i;

            for ( i = 0; i < 4; i++ ) {
                // TODO:
                // making a copy would be nicer. is Object.create(starDate) an option?
                // so said it's not a 'deep' copy. do i care? try it. deep copy object.
                newDate = new Date( startDate.toString() );
                next = startDate.getDate() + ( i * 7 );
                newDate.setDate( next );
                schedule.push( newDate.toDateString() );
            }

            return schedule;
        },

        /**
         * Randomize chores and push them to an array iff they are different
         * in every index relative to the old chores distribution. Do this until
         * the array contains four entries (= weekly chores for one month).
         * Note: The condition only applies to consecutive chores distributions -
         * it is fine if two nonconsecutive chores distributions have the
         * same value for the same index.
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
         * chores arrays, i.e. if they have the same value for the same
         * index at least once.
         * @param {Array} choresOld - old chore distribution.
         * @param {Array} choresNew - randomized chore distribution.
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
         * Create HTML table from data - first insert dates horizontally,
         * then people and randomizedChores vertically.
         * Use innerHTML as it is faster than pure DOM.
         * @param {Array} schedule - chore deadline dates for the table header.
         * @param {Array} people - names of chore-doers for the first column.
         * @param {Array} randomizedChores - contains the chores arrays.
         * @return {String} - table as a string to be inserted using innerHTML.
         */
        createTable = function ( schedule, people, radomizedChores ) {
            var table = "<table>",
                column,
                i;

            // add the schedule as a header
            table += "<tr>";
            table += "<th></th>"; // first cell of the table is empty
            for ( i = 0; i < schedule.length; i++ ) {
                table += "<th>" + schedule[ i ] + "</th>";
            }
            table += "</tr>";

            // add the people and chores
            randomizedChores.unshift( people ); // prepend chores array by people
            for ( i = 0; i < randomizedChores[0].length; i++ ) {
                table += "<tr>";
                for ( j = 0; j < randomizedChores.length; j++ ) {
                    column = randomizedChores [ j ];
                    table += "<td>" + column[ i ] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";

            return table;
        };


    schedule = generateSchedule( startDate );
    randomizedChores = randomizeChores( chores );
    table = createTable( schedule, people, randomizedChores );
    container.innerHTML = table;

    // debug
    console.log( schedule );
    console.log( randomizedChores );
    console.log( table );

    // TODO: beautify the table generator function
    // TODO: add input fields for date, names, chores and 'generate' button.
    // TODO : dump last chores order to file to reuse as first one next time
    // TODO: create printing functionality


}( document, window ));
