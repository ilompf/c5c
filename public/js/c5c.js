;(function ( document, window ) {

    var generator = document.getElementById( 'generator' ),
        container = document.getElementById( 'content' ),
        archive = document.getElementById( 'archive' ),
        URLPATH = 'http://c5c.herokuapp.com/',

        /**
         * Creates HTML table from row arrays.
         * First inserts dates as a header, then people and randomized chores.
         * @param {Array} data - array of arrays where each corresponds to a row.
         * @return {String} - table as a string to be inserted using innerHTML.
         */
        createTable = function ( data ) {
            var table = '<table>',
                i,
                j;

            // add the first row as a header
            table += '<tr>';
            table += '<th></th>'; // first cell of the table is empty
            for ( i = 0; i < data[ 0 ].length; i++ ) {
                table += '<th>' + data[ 0 ][ i ] + '</th>';
            }
            table += '</tr>';

            // add the people and chores
            for ( i = 1; i < data.length; i++ ) {
                table += '<tr>';
                for ( j = 0; j < data[ i ].length; j++ ) {
                    table += '<td>' + data[ i ][ j ] + '</td>';
                }
                table += '</tr>';
            }
            table += '</table>';

            return table;
        },

        /**
         * Handler for click on "Generate table" button.
         * POSTs to 'schedules' and either gets a new table or a "too early"-msg
         * in return. Either inserts the new table as inner HTML or alerts the
         * user using the msg.
         * @param  {Event} e - submit "Generate table" form.
         * @return false to prevent propagation.
         */
        processForm = function ( e ) {
            if (e.preventDefault) e.preventDefault();
            httpPost( URLPATH + 'schedules');
            return false;
        },

        /**
         * Processes a GET request to the given destination url.
         */
        httpGet = function ( url ) {
            var xhr = new XMLHttpRequest();
            xhr.open( 'GET', url, false );
            xhr.send();
            return xhr.responseText;
        },

        /**
         * Reloads the archive and inserts the new table / alert msg into the HTML file.
         */
        processResponse = function ( event )  {
            var xhrResponse = event.target,
                resp,
                data;

            if ( xhrResponse.readyState === 4 ) {
                if ( xhrResponse.status === 200 ) {
                    generateArchive( URLPATH + 'schedules' );
                    clickifyArchive();
                }

                resp = JSON.parse( xhrResponse.response );

                if ( resp.data ) {
                    data = createTable( resp.data );
                } else {
                    data = '<div class="error">' + resp.message + '</div>';
                }
                container.innerHTML = data;
                printify();
            }
        },

        /**
         * Processes a POST request asynchronously to the given destination url.
         * Uses processResponse to display the new data.
         * @param  {String} url - destination url for POST request.
         */
        httpPost = function ( url ) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = processResponse;
            xhr.open( 'POST', url, true );
            xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
            xhr.send();
        },

        /**
         * Fetches all dates of past chores plans and inserts them into the HTML
         * file as a list.
         * @param  {String} url - destination url for GET request.
         */
        generateArchive = function ( url ) {
            var responseArray = JSON.parse( httpGet( url )),
                list = '<h3>Check out the old plans</h3>';

            list += '<ul>';
            for ( i = 0; i < responseArray.length; i++ ) {
                list += '<li><a href="#">' + responseArray[ i ].date + '</a></li>';
            }
            list += '</li>';

            archive.innerHTML = list;
        },

        /**
         * Fetches the table corresponding to the date which was clicked on in
         * the archive and inserts it into the HTML file.
         * @param  {Event} e - click on a list item from the archive.
         */
        fetchTable = function ( e ) {
            if (e.preventDefault) e.preventDefault();
            var date = e.target.innerHTML,
                url = URLPATH + 'schedules/' + date;
            container.innerHTML = createTable( JSON.parse( httpGet( url )).data );
            printify();
            return false;
        },

        /**
         * Binds the archive items to a click event which will trigger the
         * fetchTable function.
         */
        clickifyArchive = function () {
            var listItems = document.getElementsByTagName( 'a' ),
                i;
            for ( i = 0; i < listItems.length; i++ ) {
                listItems[ i ].addEventListener( 'click', fetchTable );
            }
        },

        /**
         * Pops up the print window.
         */
        print = function ( e ) {
            if (e.preventDefault) e.preventDefault();
            window.print();
            return false;
        },

        /**
         * Adds a print button iff there is a table.
         */
        printify = function () {
            var printer;
            if ( document.getElementsByTagName( 'table' )[ 0 ] ) {
                container.insertAdjacentHTML('beforeend', '<form><input id="printer" type="button" value="Print"></form>' );
                printer = document.getElementById( 'printer' );
                printer.addEventListener( 'click', print );
            }
        };

    generateArchive( URLPATH + 'schedules' );
    clickifyArchive();
    generator.addEventListener( 'click', processForm );

}( document, window ));
