
if (!IN_ENGINE)
{
	window.util = {
		MotionSensorAvailable: function() { return false; }
	}
}

var gScope = null;
var GamemodeDetails = {}
var MapIndex = {}
var AnnSpeed=300;
var subscriptions = new Subscriptions();

setTimeout(function(){
	console.log( "#########################################################" );
	console.log( "############### Gmod Custom Menu Loaded ! ###############" );
	console.log( "##### https://github.com/Gaerisson/Gmod-Custom-Menu #####" );
	console.log( "##### Don,'t forget to check for update manuelly :) #####" );
	console.log( "#########################################################" );
}, 3500);


function ClearSoundsDecals(){
	lua.Run( "RawConsoleCommand( 'stopsound' );" );
	lua.Run( "RawConsoleCommand( 'r_cleardecals' );" );
	lua.Run( "RawConsoleCommand( 'echo Sounds stopped / Decals cleared !' );" );
}

function ServerPrev(id,sh){
	if($('#srv'+id+'-addr')[0]){
		if(sh==1){
			$('#srv-banner')[0].style="-webkit-transition: opacity 0.50s;opacity:0.8;"
			$('#srv-prev')[0].src=window['srv'+id+'banner'].src;
		}else if(sh==0){
			$('#srv-banner')[0].style="-webkit-transition: opacity 0.50s;opacity:0;"
		}
	}
}

function AddSmartFavServer( id, name, address, players ){
	if($('#srv'+id+'-name')[0] || $('#srv'+id+'-addr')[0]){
		$('#srv'+id+'-name')[0].innerText=name;
		$('#srv'+id+'-addr')[0].innerText=address;
		$('#srv'+id+'-play')[0].innerText=players;
		window['srv'+id+'banner']= new Image(400,75)
		window['srv'+id+'banner'].src = "http://vps.gaerisson-softs.fr/ServerSignature/"+$('#srv'+id+'-addr')[0].innerText+".png?gmodmenu"
	}
}

function FinishedLoadFavServer(){
	console.log("Finished loading Fav Server !");
}

function ConnectServer(id){
	if($('#srv'+id+'-addr')[0]){
		lua.Run( "JoinServer( %s );", String( $('#srv'+id+'-addr')[0].innerText ) );
		lua.Run( "print( 'connect %s' );", String( $('#srv'+id+'-addr')[0].innerText ) );
	}
}

function MenuController( $scope, $rootScope )
{
	$rootScope.ShowBack = true;
	$scope.Version = "0";

	subscriptions.Init( $scope );

	gScope = $scope;

	gScope.Gamemode = '';

	$scope.ToggleGamemodes = function()
	{
		$( '.popup:not(.gamemode_list)' ).hide(AnnSpeed)
		$( '.gamemode_list' ).toggle(AnnSpeed);
	}

	$scope.ToggleLanguage = function ()
	{
		$( '.popup:not(.language_list)' ).hide(AnnSpeed);
		$( '.language_list' ).toggle(AnnSpeed);
	}

	$scope.ToggleGames = function ()
	{
		$( '.popup:not(.games_list)' ).hide(AnnSpeed);
		$( '.games_list' ).toggle(AnnSpeed);
	}

	$scope.TogglePopup = function ( name )
	{
		$( '.popup:not('+name+')' ).hide(AnnSpeed);
		$( name ).toggle(AnnSpeed);
	}

	$scope.SelectGamemode = function( gm )
	{
		$scope.Gamemode = gm.name;
		$scope.GamemodeTitle = gm.title;
		lua.Run( "RunConsoleCommand( \"gamemode\", \""+gm.name+"\" )" )

		$( '.gamemode_list' ).hide();
	}

	$scope.SelectLanguage = function ( lang )
	{
		$rootScope.Language = lang;
		lua.Run( "RunConsoleCommand( \"gmod_language\", \"" + lang + "\" )" )

		$( '.language_list' ).hide();
	}

	$scope.MenuOption = function ( btn, v )
	{
		lua.Run( "RunGameUICommand( '" + v + "' )" )
	}

	$scope.IfElse = function( b, a, c )
	{
		if ( b ) return a;
		return c;
	}

	//
	// Map List
	//
	$rootScope.MapList = []
	lua.Run( "UpdateMapList()" );

	//
	// Languages
	//
	$rootScope.Languages = []
	$rootScope.Language = 'en';
	lua.Run( "UpdateLanguages()" );

	//
	// Game Mounts
	//
	$scope.GameMountChanged = function( mount )
	{
		lua.Run( "engine.SetMounted( "+mount.depot+", "+mount.mounted+" )" );
	}

	//
	// Controls
	//
	$scope.BackToGame = function()
	{
		lua.Run( "gui.HideGameUI()" );
	}

	$scope.AddServerToFavorites = function()
	{
		lua.Run( "serverlist.AddCurrentServerToFavorites()" );

		$('#fav-icon').addClass('fav-added');
		setTimeout(function(){
			$('#fav-icon').removeClass('fav-added');
		}, 3000);
	}

	$scope.Disconnect = function ()
	{
		lua.Run( "RunConsoleCommand( 'disconnect' )" );
	}

	$scope.OpenWorkshopFile = function ( id )
	{
		if ( !id ) return;

		lua.Run( "steamworks.ViewFile( %s )", String( id ) );
	}

	$scope.OpenFolder = function ( foldername )
	{
		lua.Run( "OpenFolder( %s )", String( foldername ) );
	}

	$scope.OpenWorkshop = function ()
	{
		lua.Run( "steamworks.OpenWorkshop()" );
	}

	$scope.ShowNews = function()
	{
		if ( gScope.Branch == "dev" )			return lua.Run( "gui.OpenURL( 'http://wiki.garrysmod.com/changelist/' )" );
		if ( gScope.Branch == "prerelease" )	return lua.Run( "gui.OpenURL( 'http://wiki.garrysmod.com/changelist/prerelease/' )" );

		lua.Run( "gui.OpenURL( 'http://gmod.facepunch.com/changes/' )" );
	}

	// Background
	ChangeBackground();

	// InGame
	$scope.InGame = false;
	$scope.ShowFavButton = false;

	// Kinect options
	$scope.kinect =
	{
		available: util.MotionSensorAvailable(),
		show_color: false,
		color_options: [ "topleft", "topright", "bottomleft", "bottomright" ],
		color: "bottomleft",
		size_options: [ "small", "medium", "large" ],
		color_size:	"medium",

		update: function()
		{
			// Start the kinect
			if ( $scope.kinect.show_color )
			{
				lua.Run( "motionsensor.Start()" );
			}

			if ( $scope.kinect.color == "topleft" )		{ lua.Run( "RunConsoleCommand( \"sensor_color_x\", \"32\" )" ); lua.Run( "RunConsoleCommand( \"sensor_color_y\", \"32\" )" ); }
			if ( $scope.kinect.color == "topright" )	{ lua.Run( "RunConsoleCommand( \"sensor_color_x\", \"-32\" )" ); lua.Run( "RunConsoleCommand( \"sensor_color_y\", \"32\" )" ); }
			if ( $scope.kinect.color == "bottomright" )	{ lua.Run( "RunConsoleCommand( \"sensor_color_x\", \"-32\" )" ); lua.Run( "RunConsoleCommand( \"sensor_color_y\", \"-32\" )" ); }
			if ( $scope.kinect.color == "bottomleft" )	{ lua.Run( "RunConsoleCommand( \"sensor_color_x\", \"32\" )" ); lua.Run( "RunConsoleCommand( \"sensor_color_y\", \"-32\" )" ); }

			if ( $scope.kinect.color_size == "small" ) { lua.Run( "RunConsoleCommand( \"sensor_color_scale\", \"0.4\" )" ); }
			if ( $scope.kinect.color_size == "medium" ) { lua.Run( "RunConsoleCommand( \"sensor_color_scale\", \"0.7\" )" ); }
			if ( $scope.kinect.color_size == "large" ) { lua.Run( "RunConsoleCommand( \"sensor_color_scale\", \"1.0\" )" ); }

			lua.Run( "RunConsoleCommand( \"sensor_color_show\", %s )", $scope.kinect.show_color ? "1" : "0" );
		}
	}

	util.MotionSensorAvailable( function( available ) {
		$scope.kinect.available = available;
	} );
}

function SetInGame( bool )
{
	gScope.InGame = bool;
	UpdateDigest( gScope, 50 );
}

function SetShowFavButton( bool )
{
	gScope.ShowFavButton = bool;
	UpdateDigest( gScope, 50 );
}

function ChangeBackground()
{
	setTimeout( function(){ ChangeBackground() }, 12000 )
}

function UpdateGamemodes( gm )
{
	gScope.Gamemodes = [];
	for ( k in gm )
	{
		var gi = GetGamemodeInfo( gm[k].name );
		gi.title = gm[k].title
		gi.name = gm[k].name

		gScope.Gamemodes.push( gm[k] );
	}

	UpdateDigest( gScope, 50 );
}

function UpdateCurrentGamemode( gm )
{
	if ( gScope.Gamemode == gm ) return;

	gScope.Gamemode = gm;

	for ( k in gScope.Gamemodes )
	{
		if ( gScope.Gamemodes[k].name == gm )
			gScope.GamemodeTitle = gScope.Gamemodes[k].title;
	}

	UpdateDigest( gScope, 50 );
}

function GetGamemodeInfo( name )
{
	name = name.toLowerCase();
	if ( !GamemodeDetails[name] ) GamemodeDetails[name] = {}

	return GamemodeDetails[name];
}

function GetHighestKey( obj )
{
	var h = 0;
	var v = "";

	for ( k in obj )
	{
		if ( obj[k] > h )
		{
			h = obj[k];
			v = k;
		}
	}

	return v;
}

//
// Updates information about gamemodes we don't have using server info
//
function UpdateGamemodeInfo( server )
{
	gi = GetGamemodeInfo( server.gamemode )

	//
	// Use the most common title
	//
	if ( !gi.titles ) gi.titles = {}
	if ( !gi.titles[ server.desc ] ) { gi.titles[ server.desc ] = 1; } else {gi.titles[ server.desc ]++;}
	gi.title = GetHighestKey( gi.titles );

	//
	// Use the most common workshop id
	//
	//if ( server.workshopid != "" )
	{
		if ( !gi.wsid ) gi.wsid = {}
		if ( !gi.wsid[server.workshopid] ) { gi.wsid[server.workshopid] = 1; } else { gi.wsid[server.workshopid]++; }
		gi.workshopid = GetHighestKey( gi.wsid );
	}
}

function UpdateMaps( inmaps )
{
	var mapList = []

	for ( k in inmaps )
	{
		var order = k;
		if ( k == 'Sandbox' ) order = '2';
		if ( k == 'Favourites' ) order = '1';

		var maps = []
		for ( v in inmaps[k] )
		{
			maps.push( inmaps[k][v] );
			MapIndex[ inmaps[k][v].toLowerCase() ] = true;
		}

		mapList.push(
		{
			order: order,
			category: k,
			maps: maps
		} )
	}

	gScope.MapList = mapList;
	UpdateDigest( gScope, 50 );
}

function DoWeHaveMap( map )
{
	return MapIndex[map.toLowerCase()] || false;
}

function UpdateLanguages( lang )
{
	gScope.Languages = [];

	for ( k in lang )
	{
		gScope.Languages.push( lang[k].substr( 0, lang[k].length - 4 ) )
	}
}

function UpdateLanguage( lang )
{
	gScope.Language = lang;
	gScope.$broadcast( "languagechanged" );
	UpdateDigest( gScope, 50 );
}

function UpdateGames( games )
{
	gScope.Games = [];

	for ( k in games )
	{
		games[k].mounted	= games[k].mounted == 1;
		games[k].installed	= games[k].installed == 1;
		games[k].owned		= games[k].owned == 1;

		gScope.Games.push( games[k] )
	}

	UpdateDigest( gScope, 50 );
}

function UpdateVersion( version, branch )
{
	gScope.Version 	= 	version;
	gScope.Branch 	= 	branch;

	UpdateDigest( gScope, 100 );
}

//
// Setup sounds..
//
$(document).on( "mouseenter", ".options a",			function () { lua.PlaySound( "garrysmod/ui_hover.wav" ); } );
$(document).on( "click", ".options a",				function () { lua.PlaySound( "garrysmod/ui_click.wav" ); } );
$(document).on( "mouseenter", ".noisy",				function () { lua.PlaySound( "garrysmod/ui_hover.wav" ); } );
$(document).on( "click", ".noisy",					function () { lua.PlaySound( "garrysmod/ui_click.wav" ); } );
$(document).on( "mouseenter", ".ui_sound_return",	function () { lua.PlaySound( "garrysmod/ui_hover.wav" ); } );
$(document).on( "click", ".ui_sound_return",		function () { lua.PlaySound( "garrysmod/ui_return.wav" ); } );
