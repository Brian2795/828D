// This game menu is adapted from https://github.com/MattMcFarland/phaser-menu-system.
var menuState = {
	preload: function() {game.load.image('menu-bg', 'assets/images/menu-bg.jpg');
		this.optionCount = 1;
		this.optionStateEnum = {
			GRANTS: 1,
			MISSIONS: 2
		};
		this.currentOptionState = this.optionStateEnum.MISSIONS;
		this.EmotionEnum = {
			HAPPY: 1,
			OKAY: 2,
			ANGRY: 3,
		};
		this.currentEmotion = this.computeEmotion(game.totalReputation, game.totalFunding);

		if(!game.started) { 
			this.genProjects();
			this.genGrants();
			game.started = true;

		}	
	},


	computeEmotion: function(reputation, funding) {
		if (funding < 10000) {
			return this.EmotionEnum.ANGRY;
		} else {
			if (reputation <= 30) {
				return this.EmotionEnum.ANGRY;
			} else if (reputation > 30 && reputation <= 60) {
				return this.EmotionEnum.OKAY;
			} else {
				return this.EmotionEnum.HAPPY;
			}
		}
	},


	create: function() {
		this.initBackground();
		this.initLabOverview();
		this.initMissionList();
		// this.getLevelResult();
		this.initPopupState();
		this.addTutorialLink();
		


		// Should put implement this logic in init() as a trigger on the input value
		if (game.hasOwnProperty('levelResult')) {
			var performanceSummary = this.genPerformanceSummary(game.levelResult);
			this.openPopupWindow(performanceSummary);
			delete game['levelResult'];
		}
		game.kineticScrolling.start();
		

		/*
		game.levelResult = {
            popMean: this.populationMean,
            popStDev: this.populationStdv,
            sampleMean: jStat.mean(this.measurementList),
            reputationChange: deltaReputation
        }*/
	},

	roundToXDigits: function(value, digits) {
        if(!digits){
            digits = 2;
        }
        value = value * Math.pow(10, digits);
        value = Math.round(value);
        value = value / Math.pow(10, digits);
        return value;
    },
    initNumDisplay: function(){
        // date
        
        this.objTextBase = game.add.text(530, 503, game.totalFunding, {
            font: '30px Arial',
            fill: '000000',
            align: 'left',
        });
        this.objTextBase.stroke = "#ffffff";
        this.objTextBase.strokeThickness = 3;
        this.objTextBase.anchor.setTo(0, 0.5);
        //this.objTextBase.fixedToCamera = true;

        console.log(this.roundToXDigits( game.totalReputation, 2))
        this.objText = game.add.text(255 , 503, this.roundToXDigits( game.totalReputation, 2), {
            font: '30px Arial',
            fill: '000000',
            align: 'left',
        });
        this.objText.stroke = "#ffffff";
        this.objText.strokeThickness = 3;
        this.objText.anchor.setTo(0, 0.5);
        //this.objText.fixedToCamera = true;
    },


	update: function() {
		game.date.setTime(game.date.getTime() + (game.time.elapsed * 60));
	},


	render: function() {
	    var date = game.date.toDateString();
	    var time = game.date.toLocaleTimeString();
	    var timeMin = time.slice(0, time.length-6) + time.slice(time.length-2);

	    game.debug.text(date, 32, 32);
	    game.debug.text(timeMin, 32, 48);
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
		this.initNumDisplay();
	},


	initMissionList: function() {
		this.menuGroup = game.add.group();
		this.addGrantMissionToggleButton();
		this.addProjectList();
		
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
        this.popupState.popupText = game.add.text(0, 0, "", style);
        this.popupState.popupText.anchor.set(0.5);
        this.popupState.popupText.visible = false;

        //this.popupState.spsp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //this.popupState.spsp.onDown.add(this.progDialogue, this);
	},




/* UPDATES & INTERACTIVE */
	toggleGrantsMissions: function() {
		console.log(this.currentOptionState);
		this.menuGroup.removeAll(/* Destroy */true, /* Silent */false, /* destroyTexture */false);

		this.optionCount = 1;
		if (this.currentOptionState === this.optionStateEnum.GRANTS) {
			this.addProjectList();
		} else {
			this.addGrantList();
		}
		
		this.initPopupState(); 	// reinitialize popups for visual depth priority
		// console.log(this.grantsMissionsButton);
		//this.initNumDisplay();
	},


	addGrantList: function( titleText='Available Grants' ) {
		var title = game.add.text(game.width-500, 100, titleText, style.navitem.hover);
		this.currentOptionState = this.optionStateEnum.GRANTS;
		this.grantsMissionsButton.setFrames(1,1,1);
		this.menuGroup.add(title);
		
		for (i = 0; i < game.grantsAvailable.length; i++) {
			this.addGrantCard(game.grantsAvailable[i]);
		}
		// Adjust game world bounds for kinetic scroll
		game.world.setBounds(0, 0, this.game.width, 200+150 * game.grantsAvailable.length);
		console.log("Toggled to grants.");
		console.log(game.grantsAvailable);
	},


	addProjectList: function( titleText='Ongoing Projects' ) {
		var title = game.add.text(game.width-500, 100, titleText, style.navitem.hover);
		this.currentOptionState = this.optionStateEnum.MISSIONS;
		this.grantsMissionsButton.setFrames(2,2,2);
		this.menuGroup.add(title);

		for (i = 0; i < game.projectsOngoing.length; i++) {
			this.addProjectCard(game.projectsOngoing[i]);
		}
		// Adjust game world bounds for kinetic scroll
		game.world.setBounds(0, 0, this.game.width, 200+150*game.projectsOngoing.length);
		console.log("Toggled to projects.");
		console.log(game.projectsOngoing);
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


	genPerformanceSummary: function(levelResult) {
		var popMean = levelResult.popMean;
		var sampleMean = levelResult.sampleMean;
		var popStDev = levelResult.popStDev;
		var repChange = levelResult.reputationChangeWithMultiplier;
		var hasCollectedAtLeastOneSample = levelResult.hasCollectedAtLeastOneSample;
		var summary;
		if (hasCollectedAtLeastOneSample) {
			summary = "Mission complete! \""+levelResult.grade+"\" performance."+"The population mean was "
			+ popMean.toFixed(2)+" with " + "a standard devation of "+popStDev.toFixed(2)
			+ ". The mean of your sample was " + sampleMean.toFixed(2) 
			+ ". Based on your performance, you've received a reputation change of " 
			+ (repChange < 0 ? "" : "+") + repChange.toFixed(2)+"%!\n" + "~Press ESC to close~";
		} else {
			summary = "You didn't collect any samples! No reputation gained.\n~Press ESC to close~"
		}
		return summary;
	},

	addTutorialLink: function() {
		var tutorialText = game.add.text(50, game.world.height - 5, "Tutorial", style.navitem.default);
		var callback = function() { game.state.start('tutorial'); };
		this.createTextButton(tutorialText, "Tutorial", 'Tutorial', callback);
	},


/* TERTIARY HELPERS */
	addGrantCard: function( grant, totalHeight=150, titleHeight=50, padding=50) {
		var xLoc = game.width - 500; 
		var yLocTitle = (this.optionCount*totalHeight) + padding;
		var yLocDetails = yLocTitle + titleHeight;
		var details = grant.description + '\nDifficulty: ' + grant.recommendedRep
			+ '\nAvailable Funding: ' + grant.maxFunding 
			+ '\nProposal Deadline: ' + grant.propDeadline.toDateString();
		

		var titleText = game.add.text(xLoc, yLocTitle, grant.provider, style.navitem.default);
		var detailText = game.add.text(xLoc, yLocDetails, details, style.navitem.subtitle);
		
		var callback = function () {
			if (titleText.text != "Grant Obtained!") {
				grant.apply();
			}
			titleText.setText("Grant Obtained!");
		};

		this.createTextButton(titleText, grant.provider, 'Submit Proposal', callback);

		this.optionCount ++;
		this.menuGroup.add(titleText);
		this.menuGroup.add(detailText);
		
	},


	addProjectCard: function( project, totalHeight=150, titleHeight=50, padding=50) {
		var xLoc = game.width - 500; 
		var yLocTitle = (this.optionCount*totalHeight) + padding;
		var yLocDetails = yLocTitle + titleHeight;
		var details = project.description + "\nExposure: " + project.exposure 
			+ '\nPaper Deadline: ' + project.deadline.toDateString();
		var callback = function () { game.state.start('play', false, false, project); };

		var titleText = game.add.text(xLoc, yLocTitle, project.title, style.navitem.default);
		var detailText = game.add.text(xLoc, yLocDetails, details, style.navitem.subtitle);
		this.createTextButton(titleText, project.title, 'Collect Data', callback);

		this.optionCount ++;
		this.menuGroup.add(titleText);
		this.menuGroup.add(detailText);
		game.world.setBounds(0, 0, this.game.width, this.game.height + 1000);

	},


	createTextButton: function( text, originalString, hoverString, callback ) {
		text.inputEnabled = true;
		
		text.events.onInputOver.add(function (target) {
			if (target.text != "Grant Obtained!") {
				target.setStyle(style.navitem.hover);
				target.setText(hoverString);
			}
		});

		text.events.onInputOut.add(function (target) {
			if (target.text != "Grant Obtained!") {
				target.setStyle(style.navitem.default);
				target.setText(originalString);
			}
		});

		text.events.onInputUp.add(callback);
	},


	initQuote: function(quoteX, quoteY) {
		var quoteText = game.add.text(
			quoteX,
			quoteY,
			"\""+game.tipQuotes[Math.floor(Math.random()*game.tipQuotes.length)]+"\"", 
			style.quote.default);
	},


	initStats: function() {
		var repPercent = 100 * game.totalReputation / game.maxReputation;
		this.addHealthBar(150, 500, "Reputation", repPercent);
		var fundingPercent = 100 * game.totalFunding / game.maxFunding;
		this.addHealthBar(450, 500, "Funding", fundingPercent);
	},


	addHealthBar: function(barX, barY, barLabel, barPercent, barWidth=250) {
		var barConfig = {
			x: barX + barWidth/2, 
			y: barY,
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
		this.currentEmotion = this.computeEmotion(game.totalReputation, game.totalFunding);
		talkingHead = this.game.add.sprite(300, 80, 'talking-head');
		talkingHead.frame = 3;
		talkingHead.animations.add('animateHappy', Array.from({length: 25}, (v, k) => k+5), 10, true);
		talkingHead.animations.add('animateOkay', Array.from({length: 20}, (v, k) => k+40), 10, true);
		talkingHead.animations.add('animateAngry', Array.from({length: 23}, (v, k) => k+60), 10, true);
		if (this.currentEmotion === this.EmotionEnum.HAPPY) {
			talkingHead.animations.play('animateHappy');
		} else if (this.currentEmotion === this.EmotionEnum.OKAY) {
			talkingHead.animations.play('animateOkay');
		} else if (this.currentEmotion === this.EmotionEnum.ANGRY) {
			talkingHead.animations.play('animateAngry');
		}
		
	},


	addGrantMissionToggleButton: function() {
		this.grantsMissionsButton = game.add.button(800, 30, 'grants-missions-toggle', this.toggleGrantsMissions, this, 2, 2, 2);
		this.currentOptionState = this.optionStateEnum.MISSIONS;
	},




	genProjects: function( numProjects=3 ) {
		var env1 = game.environments['desert'];
		var env2 = game.environments['space'];
		var env3 = game.environments['wasteland'];

		var pop1 = game.populations['diamond'];
		var pop2 = game.populations['mushroom'];
		var pop3 = game.populations['carrot'];

		// Project( name, funding, population, recommendedRep )
		var p1 = new Project(null,'', pop1, env1, 10000, 20);
		var p2 = new Project(null,'', pop2, env1, 20000, 60);
		var p3 = new Project(null,'', pop3, env1, 50000, 100);

		projects = [p1,p2,p3];
		return projects;
	},


	genGrants: function( numGrants=3 ) {
		var grants = [];

		for (var i=0; i<numGrants; i++) {
			grants.push(this.genGrant());
		}
		return grants;
	},


	genGrant: function( population=null, environment=null, verb=null ) {
	/* Generates a grant based on specified parameters or randomly for any
	 * unspecified parameters.
	 */
		if (!population) {
			var popKeys = Object.keys(game.populations);
			var key = popKeys[Math.floor(Math.random() * popKeys.length)];
			population = game.populations[key];
		};

		if (!environment) {
			var envKeys = Object.keys(game.environments);
			var key = envKeys[Math.floor(Math.random() * envKeys.length)];
			environment = game.environments[key];
		};
		
		var grant = new Grant(population, environment, 30, 10000);
		console.log(grant.getDescription());

		// Grant( population, environment, recommendedRep, maxFunding, duration=30 )
		return grant;
	},



};