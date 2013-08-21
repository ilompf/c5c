;(function ( document, window ) {

    // arrays for people and chores. there have to be as many people as chores.
    var people = [ "Joel", "Carola", "Sebu", "Michèle", "Paolo", "Lisa", "Timo", "Ilona" ],
        chores = [ "Zimmer", "Joker*", "Küche", "1. Stock", "Kühlschrank", "Diverses", "Entsorgung", "Boden" ],
        schedule = [],
        // last chores: 0: "Zimmer" "Diverses" "1. Stock" "Küche" "Kühlschrank" "Joker*" "Boden" "Entsorgung"

        // Set the startdate manually for now. This is the 25th of august 2013 (mth index starts at zero).
        // Create the array with all four dates based on the startdate

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

        randomizeChores = function ( chores ) {
            var randomizedChores = [],
                choresNew = chores.slice(),
                tmpChores = chores.slice(),
                randomize = function () {
                    return 0.5 - Math.random();
                };

            while ( randomizedChores.length < 4 ) {
                choresNew.sort( randomize );

                if ( !isConsecutive( tmpChores, choresNew ) ) {
                    tmpChores = choresNew.slice();
                    randomizedChores.push( tmpChores );
                }
            }

            return randomizedChores;
        },

        /**
         * Helper to determine if there are any consecutive elements in two
         * arrays, i.e. if two arrays have the same value for the same index
         * at least once.
         * @return {Boolean} - true if there are consecutive elements else undefined.
         */
        isConsecutive = function ( array1, array2 ) {
            for ( var i = 0; i < array1.length; i++ ) {
                if ( array1[ i ] === array2[ i ] ) {
                    return true;
                }
            }
        },

        /**
         * Create HTML table from data - first insert dates horizontally,
         * then people and randomized_chores vertically (either that or unify
         * to one table upfront and then insert all vertically)
         * use innerHTML as it is faster than pure DOM.
         * @param {Array} array2D - contains arrays as entries.
         */
        createTable = function ( array2D ) {
            var table = "<table border=1>",
                column,
                i;

            for ( i = 0; i < array2D[0].length; i++ ) {
                table += "<tr>";
                for ( column in array2D ) {
                    table += "<td>" + array2D[ column ][ i ] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";

            return table;
        };


    // // randomize chores so that no one will have the same chore twice in a row.
    // // c1 c2
    // // c2 c3
    // // c3 c1
    // // 1st column [-, names], 2nd-nth column [date, chores],

    // //randomize arrays and append to randomized_chores array iff not consecutive

    //dump last chores order to file to reuse as first one next time
    // create printing functionality


    // Warp 5, ENGAGE!
    var startDate = new Date( '2013-07-25' );

    schedule = generateSchedule( startDate );
    randomizedChores = randomizeChores( chores );
    table = createTable( randomizedChores, schedule );

    var container = document.getElementById( 'container' );
    container.innerHTML = table;

    // debug
    console.log( schedule );
    console.log( randomizedChores );
    console.log( table );

}( document, window ));
