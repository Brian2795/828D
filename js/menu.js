// This game menu is adapted from https://github.com/MattMcFarland/phaser-menu-system.
var menuState = {
	preload: function() {game.load.image('menu-bg', 'assets/images/menu-bg.jpg');
		this.optionCount = 1;
		this.optionStateEnum = {
			GRANTS: 1,
			MISSIONS: 2
		};
		this.currentOptionState = this.optionStateEnum.MISSIONS;
		game.projectsOngoing = this.genProjects(3);
		game.grantsAvailable = this.genGrants(3);
	},


	create: function() {
		this.initBackground();
		this.initLabOverview();
		this.initMissionList();
		// this.getLevelResult();
		this.initPopupState();


		// Should put implement this logic in init() as a trigger on the input value
		if (game.hasOwnProperty('levelResult')) {
			var performanceSummary = this.generatePerformanceSummary(game.levelResult);
			this.openPopupWindow(performanceSummary);
			delete game['levelResult'];
		}
		/*
		game.levelResult = {
            popMean: this.populationMean,
            popStDev: this.populationStdv,
            sampleMean: jStat.mean(this.measurementList),
            reputationChange: deltaReputation
        }*/
	},


	update: function() {
		game.date.setTime(game.date.getTime() + (game.time.elapsed * 60));
	},


	render: function() {
	    game.debug.text(game.date.toDateString(), 32, 32);
	    game.debug.text(game.date.toLocaleTimeString(), 32, 48);
	},






/** BEGIN EXPLICITLY CALLED FUNCTIONS HERE **/


/* INSTANTIATIONS */
	initBackground: function() {
		var backgroundImage = game.add.sprite(0, 0, 'menu-bg');
		backgroundImage.width = game.width;
		backgroundImage.height = game.height;
	},


	initLabOverview: function() {
		this.addTalkingHead();
		this.initQuote(150, 550);
		this.initStats();
	},


	initMissionList: function() {
		this.addMenuTitleAndOptions(this.optionStateEnum.MISSIONS);
		this.addGrantMissionToggleButton();
	},


	initPopupState: function() {
        this.popupState = {
            tween: null,
            popup: null,
            popupText: null,
            isPopupOpen: false,
            closePopupKey: null,
            style: null,
            spsp: null
        }
        
        this.popupState.popup = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'background');
        var popup = this.popupState.popup;
        popup.alpha = 0.8;
        popup.anchor.set(0.5);
        popup.inputEnabled = true;
        popup.input.enableDrag();
        popup.scale.set(0.0);
        this.popupState.closePopupKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.popupState.closePopupKey.onDown.add(this.closePopupWindow, this);
        this.style = { font: "25px Arial", fill: "#555555", wordWrap: true, wordWrapWidth: 500, align: "center", backgroundColor: "#ffff00" };
        this.popupState.popupText = game.add.text(0, 0, "You found a\nBLUE sample\nSize: 2mm\nPress ESC to continue", style);
        this.popupState.popupText.anchor.set(0.5);
        this.popupState.popupText.visible = false;

        //this.popupState.spsp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //this.popupState.spsp.onDown.add(this.progDialogue, this);
	},





/* UPDATES & INTERACTIVE */
	addMenuTitleAndOptions: function (grantsOrMissions) {
		this.menuGroup = game.add.group();
		var titleText = game.add.text(
			game.width - 500,
			100,
			grantsOrMissions === this.optionStateEnum.MISSIONS ?
				"~Select a mission~" : "~Select a grant~",
			style.navitem.hover
		);
		if (grantsOrMissions === this.optionStateEnum.MISSIONS) {
			for (i = 0; i < game.projectsOngoing.length; i++) {
				this.addMenuOption(game.projectsOngoing[i]);
			}
		} else {
			for (i = 0; i < game.grantsAvailable.length; i++) {
				this.addMenuOption(game.grantsAvailable[i]);
			}
		}
		this.menuGroup.add(titleText);
		// We initialize the popup again so that the popups are drawn on top of
		// the menu options
		this.initPopupState();
	},


	openPopupWindow: function (newPopupTextString) {
        var popupState = this.popupState;
        if ((popupState.tween !== null && popupState.tween.isRunning) 
        || popupState.popup.scale.x === 1) {
            return;
        }
        popupState.popup.position.x = game.camera.x + (game.width / 2);
        popupState.popup.position.y = game.camera.y + (game.height / 2);

        var style = { font: "32px Arial", fill: "#555555", wordWrap: true, wordWrapWidth: 500, align: "center", backgroundColor: "#ffff00" };
        popupState.popupText = game.add.text(0, 0, newPopupTextString, style);
        popupState.popupText.x = Math.floor(popupState.popup.x + popupState.popup.width / 2);
        popupState.popupText.y = Math.floor(popupState.popup.y + popupState.popup.height / 2);
        popupState.popupText.anchor.set(0.5)
        
        popupState.popupText.visible = true;
        //  Create a tween that will pop-open the window, but only if it's not already tweening or open
        popupState.tween = game.add.tween(popupState.popup.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
        popupState.isPopupOpen = true;
    },


    closePopupWindow: function() {
        var popupState = this.popupState;
        if (popupState.tween && popupState.tween.isRunning || popupState.popup.scale.x === 0.1) {
            return;
        }
        popupState.popupText.visible = false;
        //  Create a tween that will close the window, but only if it's not already tweening or closed
        popupState.tween = game.add.tween(popupState.popup.scale).to({ x: 0.0, y: 0.0 }, 500, Phaser.Easing.Elastic.In, true);
        popupState.isPopupOpen = false;
    },


	generatePerformanceSummary: function(levelResult) {
		var popMean = levelResult.popMean;
		var sampleMean = levelResult.sampleMean;
		var popStDev = levelResult.popStDev;
		var repChange = levelResult.reputationChange;
		var summary = 
		"Mission complete! Here's how you did: The population mean was "+popMean.toFixed(2)+" with "+
		"a standard devation of "+popStDev.toFixed(2)+". The mean of your sample was "+
		sampleMean.toFixed(2)+". Based on your performance, you've received a reputation change"+
		" of "+(repChange < 0 ? "" : "+")+repChange.toFixed(2)+"%!\n"+
		"~Press ESC to close~";
		return summary;
	},


	toggleGrantsMissions: function() {
		if (this.currentOptionState === this.optionStateEnum.GRANTS) {
			this.currentOptionState = this.optionStateEnum.MISSIONS;
			this.grantsMissionsButton.setFrames(2,2,2);
			this.menuGroup.removeAll(/* Destroy */true, /* Silent */false, /* destroyTexture */false);
			this.optionCount = 1;
			this.addMenuTitleAndOptions(this.optionStateEnum.MISSIONS);
			console.log(this.grantsMissionsButton);
			console.log("Toggled to missions");
			//this.openPopupWindow("sadfsd");
		} else {
			this.currentOptionState = this.optionStateEnum.GRANTS;
			this.grantsMissionsButton.setFrames(1,1,1);
			console.log("Toggled to grants");
			this.menuGroup.removeAll(/* Destroy */true, /* Silent */false, /* destroyTexture */false);
			this.optionCount = 1;
			this.addMenuTitleAndOptions(this.optionStateEnum.GRANTS);
			console.log("Called removeall");
		}
	},


/* TERTIARY HELPERS */
	addMenuOption: function( project ) {
		this.showMenuOption(project.title, project.description + "\nFunding: " 
			+ project.fundingAward + "\nRecommended Reputation: " + project.recommendedRep,
			function () { game.state.start('play', false, false, project); }
		);
	},


	showMenuOption: function(title, details, callback) {
		var titleSubtitleVSpace = 50;
		var menuOptionVSpace = 150;
		var headPadding = 50;

		var bigText = game.add.text(game.width - 500, (this.optionCount * menuOptionVSpace)+headPadding, title, style.navitem.default);
		bigText.inputEnabled = true;
		bigText.events.onInputUp.add(callback);
		bigText.events.onInputOver.add(function (target) {
		  target.setStyle(style.navitem.hover);
		});
		bigText.events.onInputOut.add(function (target) {
		  target.setStyle(style.navitem.default);
		});

		var smallText = game.add.text(game.width - 500, (this.optionCount * menuOptionVSpace + titleSubtitleVSpace)+headPadding, details, style.navitem.subtitle);
		this.optionCount ++;
		this.menuGroup.add(bigText);
		this.menuGroup.add(smallText);
	},

	initQuote: function(quoteX, quoteY) {
		var quoteText = game.add.text(
			quoteX,
			quoteY,
			"\"Keep it up! Collect high quality data to improve\nour reputation.\"", 
			style.quote.default);
	},

	initStats: function() {
		var repPercent = 100 * game.totalReputation / game.maxReputation;
		this.addHealthBar(150, 500, "Reputation", repPercent);
		var fundingPercent = 100 * game.totalFunding / game.maxFunding;
		this.addHealthBar(450, 500, "Funding", fundingPercent);
	},


	addHealthBar: function(barX, barY, barLabel, barPercent) {
		var barWidth = 250;
		var reputationBarX = barX + barWidth/2;
		var barY = barY;
		var barConfig = {
			x: reputationBarX, y: barY,
			width: barWidth,
			bar: {
				color: '#42f498'
			},
		};
		this.reputationHealthBar = new HealthBar(this.game, barConfig);
		this.reputationHealthBar.setPercent(barPercent);

		// console.log(this.reputationHealthBar.width);
		var reputationLabel = game.add.text(
			barX, 
			barY - 50, 
			barLabel, 
			style.basiclabel.default);
	},


	addTalkingHead: function() {
		talkingHead = this.game.add.sprite(300, 80, 'talking-head');
		talkingHead.frame = 3;
		talkingHead.animations.add('animate', Array.from({length: 83}, (v, k) => k), 10, true);
		talkingHead.animations.play('animate');
	},


	addGrantMissionToggleButton: function() {
		this.grantsMissionsButton = game.add.button(800, 30, 'grants-missions-toggle', this.toggleGrantsMissions, this, 2, 2, 2);
		this.currentOptionState = this.optionStateEnum.MISSIONS;
	},





	genProjects: function(numProjects) {
		// Population( name, mean, stdv, prodPeriod, processCost, sprite )
		var pop1 = new Population('diamond', 10, 1, 'mm', 10, 200, 'assets/sprites/diamond.png');
		var pop2 = new Population('mushroom', 10, 2, 'cm', 15, 50, 'assets/sprites/mushroom.png');
		var pop3 = new Population('car', 3.5, 1, 'm', 15, 2000, 'assets/sprites/car.png');
		
		var env1 = new Environment('Desert', 'assets/tilemaps/maps/desert.json', 
			'assets/tilemaps/tiles/tmw_desert_spacing.png');

		// var desc1 = 'Find the average weight of diamonds in the mine!';
		// var desc2 = 'Find the average wingspan of birds in the forest!';
 		// var desc3 = 'Find the average thickness of the arctic ice sheets!';

		// Project( name, funding, population, recommendedRep )
		var p1 =new Project('Diamond Mine', 10000, pop1, env1, 20);
		var p2 = new Project('Tropics', 20000, pop2, env1, 60);
		var p3 = new Project('Arctic', 50000, pop3, env1, 100);


		projects = [p1,p2,p3];
		return projects;
	},


	genGrants: function(numGrants) {
		// Population( name, mean, stdv, prodPeriod, processCost, sprite )
		var pop1 = new Population('diamond', 10, 1, 'mm', 10, 200, 'assets/sprites/diamond.png');
		var pop2 = new Population('mushroom', 10, 2, 'cm', 15, 50, 'assets/sprites/mushroom.png');
		var pop3 = new Population('car', 3.5, 1, 'm', 15, 2000, 'assets/sprites/car.png');
		
		var env1 = new Environment('Desert', 'assets/tilemaps/maps/desert.json', 
			'assets/tilemaps/tiles/tmw_desert_spacing.png');

		// var desc1 = 'Find the average weight of diamonds in the mine!';
		// var desc2 = 'Find the average wingspan of birds in the forest!';
 		// var desc3 = 'Find the average thickness of the arctic ice sheets!';

		// Project( name, funding, population, recommendedRep )
		var p1 = new Project('Diamond Mine', 10000, pop1, env1, 20);
		var p2 = new Project('Tropics', 20000, pop2, env1, 60);
		var p3 = new Project('Arctic', 50000, pop3, env1, 100);


		projects = [p1,p2,p3];
		return projects;
	},



};