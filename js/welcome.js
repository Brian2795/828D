var welcomeState = {
	preload: function() {
		game.add.text(80, 80, 'PI Simulator', {
			font: '50px Arial', 
			fill: '#ffffff',
			}
		);

		game.add.text(80, game.world.height - 80, 'Press W to continue.', {
			font: '25px Arial', 
			fill: '#ffffff',
			}
		);

		this.loadingLabel = game.add.text(160, 300, 'loading...',
			{font: '30px Courier', fill: '#ffffff'});
		this.loadScripts();
		this.loadFonts();
		this.loadStatic();
		this.loadButtons();
		this.loadCharacters();
		this.loadPopulations();
		this.loadEnvironments();
		this.loadTipQuotes();
	},

	loadTipQuotes: function() {
		game.tipQuotes = [
			"Apply to grants at stratigic times! Grants are more\ngenerous to high-reputation researchers.", 
			"High-exposure projects amplify your reputation change!",
			"You can gain bonus reputation by speaking to your\nadvisor and completing their quests!",
			"Large sample sizes are great, but watch your budget!\nProcessing each sample costs money.",
			"Use the statistics data at the bottom-right of your\nscreen to help you decide when to finish!"
		];
	},

	create: function() {
		this.loadingLabel.setText("Loaded!")
		var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		wkey.onDown.addOnce(this.start, this);
	},


	loadScripts: function() {
		game.load.script('style', 'js/lib/style.js');
		game.load.script('WebFont', 'js/lib/webfontloader.js');
		game.load.script('HealthBar', 'js/lib/HealthBar.standalone.js');
		game.load.script('jstat', 'js/lib/jstat.min.js');
		game.kineticScrolling = game.plugins.add(Phaser.Plugin.KineticScrolling);
		
		game.kineticScrolling.configure({
			kineticMovement: true,
			timeConstantScroll: 325, //really mimic iOS
			horizontalScroll: false,
			verticalScroll: true,
			horizontalWheel: false,
			verticalWheel: true,
			deltaWheel: 40
		});
	},


	loadFonts: function() {
		WebFontConfig = {
		  custom: {
			families: ['TheMinion', 'BigSnow', 'Blacksword', 'Coolvetica'],
			urls: ['assets/style/theminion.css', 'assets/style/bigsnow.css', 'assets/style/blacksword.css', 'assets/style/coolvetica.css']
		  }
		}
	},


	loadStatic: function() {
		game.load.spritesheet('talking-head', 'assets/sprites/talking-head.png', 255, 330);
		game.load.image('background', 'assets/images/empty_background.jpg');
		game.load.image('menu-bg', 'assets/images/menu-bg.jpg');
	},


	loadButtons: function() {
		// game.load.spritesheet('button', 'assets/sprites/button_sprite_sheet.png', 193, 71);
		game.load.spritesheet('grants-missions-toggle', 'assets/sprites/grants-missions-button.png', 193, 71);
		game.load.spritesheet('home-button', 'assets/buttons/home.png',0);
		game.load.spritesheet('settings-cog', 'assets/buttons/settings.png',0);
	},


	loadCharacters: function() {
		game.load.image('player', 'assets/sprites/ufo.png');
		game.load.image('supervisor', 'assets/all_sprites/asuna_by_vali233.png');
	},


	loadTilemaps: function() {
		game.load.tilemap('desert-tilemap', 'assets/tilemaps/maps/desert.json', 
			null, Phaser.Tilemap.TILED_JSON);
		game.load.tilemap('space-tilemap', 'assets/tilemaps/maps/space.json', 
			null, Phaser.Tilemap.TILED_JSON);
		game.load.tilemap('wasteland-tilemap', 'assets/tilemaps/maps/wasteland.json', 
			null, Phaser.Tilemap.TILED_JSON);
	},


	loadTileSprites: function() {
		game.load.image('desert-tiles', 'assets/tilemaps/tiles/desert.png');
		game.load.image('space-tiles', 'assets/tilemaps/tiles/space.png');
		game.load.image('wasteland-tiles', 'assets/tilemaps/tiles/wasteland.png');
	},


	loadEnvironments: function() {
		this.loadTilemaps();
		this.loadTileSprites();

		var desert = new Environment('desert', 'desert-tilemap', 'desert-tiles');
		var space = new Environment('space', 'space-tilemap', 'space-tiles');
		var wasteland = new Environment('wasteland', 'wasteland-tilemap', 'wasteland-tiles');
		
		game.environments['desert'] = desert;
		game.environments['space'] = space;
		game.environments['wasteland'] = wasteland;
	},


	loadSampleSprites: function() {
		game.load.image('car', 'assets/sprites/car.png');
		game.load.image('carrot', 'assets/sprites/carrot.png');
		game.load.image('diamond', 'assets/sprites/diamond.png');
		game.load.image('mushroom', 'assets/sprites/mushroom.png');
	},


	loadPopulations: function() {
		this.loadSampleSprites();

		var car = new Population('car', 3.5, 1, 'm', 2000, 'car');
		var carrot = new Population('carrot', 10, 6, 'cm', 15, 'carrot');
		var diamond = new Population('diamond', 10, 1, 'mm', 200, 'diamond');
		var mushroom = new Population('mushroom', 10, 2, 'cm', 50, 'mushroom');

		game.populations['car'] = car;
		game.populations['carrot'] = carrot;	
		game.populations['diamond'] = diamond;
		game.populations['mushroom'] = mushroom;
	},



	sleep: function(time) {
  		return new Promise((resolve) => setTimeout(resolve, time));
	},


	start: function() {
		game.state.start('menu');
	},


};