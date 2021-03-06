	let TOO = {};

	const b = '<br>';



	TOO.initUser = function( usr ) {

		user = usr;

		if ( window.self !== window.top ) { container.style.left = '-325px'; }

		window.addEventListener( 'resize', TOO.setContentsWidth, false );

		TOO.setContentsWidth();

		window.addEventListener ( 'hashchange', TOO.onHashChange, false );


		if ( location.hash.includes( '@@@' ) ) { // read local files ~ used by readme.html to help you view local files while you edit them

			TOO.urlGHPages = './';
			location.hash = location.hash.replace( '@@@', '' );

		} else if ( user.rawgit ) {

			TOO.urlGHPages = 'https://rawgit.com/' + user.user + '/' + user.repo + '/' + user.branch + '/' ;

		} else if ( user.repo === user.user + '.github.io' ) {

			TOO.urlGHPages = 'https://' + user.user + '.github.io/' + user.folder + '/';

		} else {

			TOO.urlGHPages = 'https://' + user.user + '.github.io/' + user.repo + '/';

		}

		if ( MNU.tableOfContents ) { TOO.getFiles(); }

		MNU.init();

		TOO.setMenu = MNU.tableOfContents !== undefined ? TOO.setMenuContents : TOO.setMenuDefault;
		TOO.setMenu( user.folder );

	}



	TOO.setMenuDefault = function ( path ) {

		let url;

		TOO.path = path;

		url = 'https://api.github.com/repos/' + user.user + '/' + user.repo + '/contents/' + ( path ? path : '' );

		menuTitle.innerHTML = 'All Files';
		TOO.setBreadcrumbs( path );

		TOO.requestFile( url, TOO.callbackFolderContents );

	}


	TOO.callbackFolderContents = function( xhr ) {

		let response, items, item, count;

		response = xhr.target.response;
		items = JSON.parse( response );

		TOO.files = [];
		count = 0;
		menuItems.innerHTML = '';

		for ( let i = 0; i < items.length; i++ ) {

			item = items[ i ];

			if ( item.type === 'dir' ) {

				menuItems.innerHTML +=
					'<a href=JavaScript:location.hash="";TOO.setMenuDefault("' + item.path  + '"); style=width:100%;  > 🗀 ' + item.name  + '</a>' + b +
//					'<a href=JavaScript:TOO.setMenuDefault("' + item.path  + '"); style=width:100%;  > 🗀 ' + item.name  + '</a>' + b +

				'';

			}

		}

		for ( i = 0; i < items.length; i++ ) {

			item = items[ i ];

			if ( item.type === 'file' ) {

				menuItems.innerHTML +=
					'<a id=file' + count++ + ' href=#' + item.path + ' style=width:100%;  > ' + item.name + '</a>' + b +
				'';

				TOO.files.push( item.path );

			}

		}


// move to TOO.setDefaultContents

		if ( location.hash !== '' && ( location.hash.includes( '/' ) || location.hash.includes( '.' ) ) )  {

			CON.getFileSetContents( location.hash.slice( 1 ) );

		} else if ( user.defaultFile !== undefined && user.folder === TOO.path ) {

			CON.getFileSetContents( user.defaultFile );

		} else {

			TOO.setDefaultContents();

		}

	}


	TOO.setMenuContents = function() { // we have a table of contents / TOO.tableOfContents somewhere

		var text, fNames, fName;
		var index, ReadMe;

		TOO.files = [];

		showdown.setFlavor( 'github' );

		TOO.converter = new showdown.Converter();

		text = CON.massageText( MNU.tableOfContents );

		menuItems.innerHTML = text;

		fNames = MNU.tableOfContents.replace( / /g, '' ).replace( /(.*)\((.*)\)(.*)/gi, '$2' ).split( '\n' );

		for ( var i = 1; i < fNames.length - 1; i++ ) {

			fName = fNames[ i ];
			if ( fName.includes( '###' ) || fName === '' || fName.length < 5 ) { continue; }

			TOO.files.push( fName.slice( 1 ) );

		}

		index = TOO.files.indexOf( 'readme.md');
		readMe = index > -1 ? TOO.files[ index ] : '';
		index = TOO.files.indexOf( 'README.md');
		readMe = index > -1 ? TOO.files[ index ] : readMe;
console.log( 'readMe',  readMe);
		menuTitle.innerHTML = 'Table of Contents';
		breadcrumbs.innerHTML = '';


// move to TOO.setDefaultContents

		if ( location.hash.length > 1 ) {

			CON.getFileSetContents( location.hash.slice( 1 )  );

//		} else if ( user.defaultFile !== undefined && user.folder === TOO.path ) {
		} else if ( user.defaultFile !== undefined ) {

			CON.getFileSetContents( user.defaultFile );

		} else {

			CON.getFileSetContents( readMe ); ///

		}

	}


	TOO.setDefaultContents = function() {

		let txt, start, path, p;


// change to: TOO.files.includes( 'readme.md' )

		for ( var i = 0; i < TOO.files.length; i++ ) {

			path = TOO.files[ i ];
			p = path.toLowerCase();

// uppercase README gets selected before lower case index

			if ( p.endsWith( 'readme.md' ) ) { CON.getFileSetContents( path ); return; }
			if ( p.endsWith( 'index.html' ) || p.endsWith( 'index.htm') ) { CON.getFileSetContents( path ); return; }

		}

		path = TOO.files[ 0 ];
		CON.getFileSetContents( path  );

	}


	TOO.setBreadcrumbs = function( path ) {

		let name, txt, folders, str;

		name = user.repo;

		name = user.folder ? user.folder : user.repo;

		txt = '<h3><a href=JavaScript:TOO.setMenuDefault(); >' + name + '</a> &raquo; </h3>';

		folders = path ? path.split( '/' ) : [] ;

		str = '';

		for ( let i = 0; i < folders.length; i++ ) {

			str += folders[ i ] + '/';

			txt += '<h3><a href=JavaScript:TOO.setMenuDefault("' + str.slice( 0, -1 ) + '"); >' + folders[ i ] + '</a> &raquo; </h3>';

		}

		breadcrumbs.innerHTML = txt;

	}


	TOO.onHashChange = function() {

		if ( location.hash.slice( 1,2 ) === '!' ) {

			CON.createPageOfImages( location.hash.slice( 2 ) );

		} else {

			CON.getFileSetContents( location.hash.slice( 1 ) );

		}

		if ( TOO.files ) {

			links = document.getElementsByTagName( 'li' );

			for ( let i = 0; i < links.length; i++ ) {

				link = links[ i ];
				text = link.firstChild.hash;

				if ( text === location.hash ) {

					link.style.backgroundColor = 'lightgreen';

				} else {

					link.style.backgroundColor = '';

				}

			}

		}

	}



	TOO.setContentsWidth = function() {

		contents.style.width = ( window.innerWidth - 325 ) + 'px';

	}


	TOO.getFiles = function() {

		TOO.files = MNU.tableOfContents.replace( / /g, '' ).replace( /(.*)\((.*)\)(.*)/gi, '$2' ).split( '\n' );

	};

	TOO.requestFile = function ( fileName, callback ) {

		var fileName, text, lines;

		xhr = new XMLHttpRequest();
		xhr.crossOrigin = 'anonymous';
		xhr.open( 'GET', fileName, true );
		xhr.onerror = function( xhr ) { console.log( 'error', xhr  ); };
		xhr.onload = callback;
		xhr.send( null );

	}

