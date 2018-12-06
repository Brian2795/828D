var playState = {
    init: function( project ) {
        this.environment = project.environment;
        this.population = project.population;
        this.projectTitle = project.title;
        this.projectExposure = project.exposure;

        this.envKey = this.environment.key;
        this.envTilemap = this.environment.tilemap;
        this.envTiles = this.environment.tiles;

        this.sampleKey = this.population.key;
        this.sampleUnits = this.population.units;
        this.sampleSprite = this.population.sprite;
        this.populationMean = this.population.mean;
        this.populationStdv = this.population.stdv;
        this.processCost = this.population.processCost;
        this.prodPeriod = this.population.prodPeriod;
    },


    preload: function() {
    },


	create: function() {
        this.initWorld();
        this.initMeta();
        this.createPlayer();
        this.initDialogueState();
        

        this.phase = 0;
        this.texts = [];
        console.log(game.quest);
        this.quest = game.quest;//Math.floor(Math.random() * 5);


        this.dials = {0: {0: ["Hi, welcome to PI simulator. I am your PI", "We are, right now, studying the distribution of samples.", "Can you go collect some samples for me?", "Collect enough samples so that you can know your mean for sure!", ""], 
                        2:["Your current mean is: ", "The actual mean is: ", "As you can see there is a disparity in two values.", "In order to assess the mean of the data, you have to \ncollect a fair number of data to be confident of mean.", 
                            "I want to assess the mean again. Collect more samples for me!", "I would like to collect as accurate mean as possible!", ""], 
                        4: ["Your current mean is: ", "The actual mean is: ", "Now, go back to the lab! ", ""]  },

                    1:{0:["Hmm. I just discovered that the values \nof samples are different from each other.", "In order to publich a paper,\nwe have to note this uncertainty numerically.", 
                            "I would like you to collect some \nsamples to measure this uncertainty", ""],
                        2:["The uncertainty from your sample is:", "It is said that 65% of samples \nare within 1 uncertainty range.", "Now collect more samples that this \nvalue can be in 1 uncetainty range: ",
                         "this may be not achievable, so feel free to go back to the lab! ",""],
                        4:["Thank you!", "Now, go back to the lab!", ""]},
                    
                    2:{0:["Ok. We know what an uncertainty and a mean of sample are.", "However, how certain are we about the mean?","I mean, that mean changes as we collect more sample.",
                        "Therefore, we need a measure to evaluate the uncertainty of the mean.", "Now, collect some samples to evaluate that",""],
                        2:["Your sample uncertainty is:", "Your mean (population) uncertainty is:", "The population uncertainty is sample uncertainty/sqrt(n)", "Now, collect more samples so that your sample uncertainty \n is 3 times larger than your population uncertainty",""],
                        4:["Thanks!", "Now, go back to the lab!", ""]},
                    
                    3:{0:["One of my colleague asked me how confident \n I am about the mean of samples I collected.", "Hmmm. I do we answer that?", "Can you collect some samples to examine confidence intervals?", ""],
                        2:["You must have observed that \nthe confidence interval actually shrinks.", "95% confidence interval tells you that you are \n95% confident that your actual mean belongs to the interval given.",
                        "As you collect more samples, you have more clues where \nthe actual mean is, so the confidence interval shrinks! ","Now, collect enough samples that the confidence interval width \nis smaller than the sample stdev.", ""],
                        4:["Good job!", "Now, go back to the lab!", ""]},
                    
                    4:{0:["Wow! We gained a lot of insights about the sample!", "Now, we need to conclude that our samples \nare different from previously collected samples.", 
                        "In order to conclude statistical signficance, we need \nto show that the difference of two values is larger \nthan sqrt of sum of squares of uncertainty",
                        "if one value has very small uncertainty, the difference \nof two values must be bigger than the uncertainty.", 
                        "For our case, if a value is outside the confidence interval,\nthe difference of two values are statistically significant!",
                        "Now, collect some samples that we \ncan conclude the statistical significance.", "The previously study showed the samples has the mean of :", 
                        "I want to show that our samples has statistically \nsignificantly different mean from the previous study!", ""],
                        2:["Hmmm you proved the statistical significance!","We can finally publish the paper!", ""]
                    }};

        this.objectives = {0: {2: "collect 5 samples to compute a trial mean.\ncome back to me when you have enough samples.", 4: "collect enough samples to compute an accurate mean.\ncome back to me when you have enough samples."},
                            1: {2:"collect 5 samples to compute a trial uncertainty.\ncome back to me when you have enough samples.", 4:"collect enough samples so that {0} can be within 1 uncertainty.\ncome back to me when you have enough samples."},
                            2: {2:"collect 5 samples to compute a population mean.\ncome back to me when you have enough samples.", 4:"collect enough samples so that your sample uncertainty is\n3 times greater than your population uncertainty.\ncome back to me when you have enough samples."} ,
                            3: {2:"collect 5 samples to examine the behavior of confidence internval.\ncome back to me when you have enough samples." , 4:"collect enough samples so that C.I intervals < sample stdev.\ncome back to me when you have enough samples."},
                            4: {2:"collect enough samples so that {0} value is \nsignificantly different from the population mean.\ncome back to me when you have enough samples."} }
    },


    update: function () {
        //game.physics.arcade.collide(player, layer);
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

        if (this.leftKey.isDown || this.aKey.isDown) {
            this.player.body.velocity.x -= this.playerSpeed;
        }
        if (this.rightKey.isDown || this.dKey.isDown) {
            this.player.body.velocity.x += this.playerSpeed;
        }
        if (this.upKey.isDown || this.wKey.isDown) {
            this.player.body.velocity.y -= this.playerSpeed;
        }
        if (this.downKey.isDown || this.sKey.isDown) {
            this.player.body.velocity.y += this.playerSpeed;
        }

        game.physics.arcade.overlap(this.player, this.samples, this.collectSample, null, this);
        game.physics.arcade.overlap(this.player, this.npcs, this.progDialogue, null, this);
        
        this.confInterval.numberLine.x = this.confInterval.xLocNl + game.camera.x;
        this.confInterval.numberLine.y = this.confInterval.yLocNl + game.camera.y;
        
        this.confInterval.interval.x = this.confInterval.xLocInterval + game.camera.x;
        this.confInterval.interval.y = this.confInterval.yLocInterval + game.camera.y;

    },


    render: function() {
        this.fundingText.setText('$' + String(game.totalFunding));
        this.spendingText.setText('($' + String(this.roundSpend) + ')');
        this.numSamplesText.setText(this.measurementList.length + ' samples');
        this.samplesText.setText(this.genSamplesText());
        game.debug.geom(this.confInterval.numberLine, this.confInterval.numberLineColor);
        game.debug.geom(this.confInterval.interval, this.confInterval.intervalColor);
    },







/** BEGIN EXPLICITLY CALLED FUNCTIONS HERE **/

/* PRIMARY INSTANTIATIONS */
    initWorld: function() {
        this.initMap();
        this.initNpcs();
        this.initSamples();
        this.initKeyMapping();
    },


    initMeta: function() {
        this.initMenu();
        this.initProjectDetailsDisplay();
        this.initObjectiveDisplay();
        this.initFundingDisplay();
        this.initSampleDataDisplay();
        this.initStatsDisplay();

        this.roundSpend = 0;
    },


    createPlayer: function() {
        this.player = game.add.sprite(450, 80, 'player');
        this.cursors = game.input.keyboard.createCursorKeys();

        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.playerSpeed = 250;

        game.camera.follow(this.player);
        this.player.body.collideWorldBounds = true;
    },




/* SECONDARY INSTANTIATIONS */
    initMap: function() {
        this.map = game.add.tilemap(this.envTilemap);
        console.log(this.envTilemap);
        console.log(this.envTiles);

        this.map.addTilesetImage(this.envTiles);
        layer = this.map.createLayer('Ground');
        layer.resizeWorld();
    },


    initNpcs: function() {
        this.npcs = game.add.group(); // add MPCs
        this.npcs.enableBody = true; 
        this.npcs.create(400, 400, 'supervisor'); // our first supervisor! 
    },


    initSamples: function() {
        this.samples = game.add.group(); 
        this.samples.enableBody = true; 
        this.measurementList = [];
    },


    initKeyMapping: function() {
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    },


    initMenu: function() {
        this.menuBar = new Phaser.Rectangle(0, 0, game.width, 64);
        this.settingsButton = game.add.button(game.width-50, 24, 'settings-cog', this.clickSettingsButton, this, 0, 0, 0);
        this.returnButton = game.add.button(game.width-100, 24, 'home-button', this.clickReturnButton, this, 0, 0, 0);
        
        this.settingsButton.fixedToCamera = true;
        this.returnButton.fixedToCamera = true;
    },


    initProjectDetailsDisplay: function( xLoc=10, yLoc=48 ) {
        var envText = String(this.envKey);
        envText = envText.charAt(0).toUpperCase() + envText.slice(1);

        this.createText(xLoc,yLoc,this.projectTitle,32,'left',0);               // project title
        this.createText(xLoc+8,yLoc+36,envText,24,'left',0);                    // environment
        this.createText(xLoc+8,yLoc+66,game.date.toDateString(),20,'left',0);   // date
    },


    initObjectiveDisplay: function(){
        // date
        this.objTextBase = game.add.text(18, 180, "objective: ", {
            font: '20px Arial',
            fill: '000000',
            align: 'left',
        });
        this.objTextBase.stroke = "#ffffff";
        this.objTextBase.strokeThickness = 3;
        this.objTextBase.anchor.setTo(0, 0.5);
        this.objTextBase.fixedToCamera = true;


        this.objText = game.add.text(110, 180, "Walk to the supervisor", {
            font: '20px Arial',
            fill: '000000',
            align: 'left',
        });
        this.objText.stroke = "#ffffff";
        this.objText.strokeThickness = 3;
        this.objText.anchor.setTo(0, 0.5);
        this.objText.fixedToCamera = true;

    },


    initFundingDisplay: function( xLoc=game.world.centerX, yLoc=48 ) {
        this.fundingText = this.createText(xLoc,yLoc,'',48,'center');
        this.spendingText = this.createText(xLoc,yLoc+44,'',24,'center');
    },


    initSampleDataDisplay: function( xLoc=game.width-18, yLoc=72 ) {
        this.numSamplesText = this.createText(xLoc,yLoc,'',24,'right',1,0);
        this.samplesText = this.createText(xLoc,yLoc+36,'',18,'right',1,0);
    },


    initStatsDisplay: function( xLoc=1150, yLoc=600 ) {
        this.createText(xLoc, yLoc, '95% Confidence Interval');
        this.intervalText = this.createText(xLoc, yLoc+25, '[n/a, n/a]');
        this.confInterval = new ConfidenceInterval(this.population, xLoc, yLoc+45);
        
        // this.confidenceIntervalText = this.createText(xLoc, yLoc+25, "[Not yet available]");
        this.meanText = this.createText(xLoc, yLoc+70, 'Sample µ - n/a');
        this.stDevText = this.createText(xLoc, yLoc+95, 'Sample σ - n/a');
        
    },


    createText: function(xLoc, yLoc, content, fontSize=20, alignment='right', anchorX=0.5, anchorY=0.5, 
        fontStyle='Arial', color='000000', borderColor='#ffffff', borderWidth=3 ) {
        var font = String(fontSize) + 'px ' + fontStyle;
        var text = game.add.text(xLoc, yLoc, content, {
            font: font,
            fill: color,
            align: alignment,
            stroke: borderColor,
            strokeThickness: borderWidth,
        });

        text.anchor.setTo(anchorX, anchorY);
        text.fixedToCamera = true
        return text;
    },





/* UPDATES & INTERACTIVE */
    genSamplesText: function( maxShown=5 ) {
        var listLen = this.measurementList.length;
        var numShown = Math.min(maxShown, listLen);
        var samplesText = '';
        for (var i = 0; i < numShown; i++) {
            samplesText += String(this.measurementList[listLen-i-1]) + this.sampleUnits + '\n';
        }
        return samplesText
    },


    genSamples: function(totSamples) {
        // create samples
        for (var i = 0; i < totSamples; i++) {
            locX = game.width * Math.random();
            locY = game.height * Math.random();
            var sample = this.samples.create(locX , locY, this.sampleSprite);
        }
    },


    collectSample: function (player, sample) {
        if (game.totalFunding > this.processCost) {
            game.totalFunding -= this.processCost;
            this.roundSpend += this.processCost;
            sample.kill();
            sampleValue = this.genDataValue();
            this.measurementList.push(sampleValue);
            this.scoreText = 'Score: ' + this.measurementList.toString();

            if (this.measurementList.length >= 3) {
                var interval = this.confInterval.computeInterval(this.measurementList);
                this.intervalText.setText('[' + interval[0] + ', ' + interval[1] + ']');
                this.confInterval.setInterval(this.measurementList);
                var stDev = jStat.stdev(this.measurementList,true);
                this.stDevText.setText("Sample σ: "+stDev.toFixed(2));
                

            }
            if (this.measurementList.length >= 1) { // fixed
                var mean = jStat.mean(this.measurementList);
                this.meanText.setText("Sample µ: "+mean.toFixed(2));
                this.confInterval.setNlVals(sampleValue);
            } 
            
            this.genSamples(1); // replenishing samples. 

        } else {
            console.log('Insufficient funding!');
        }
    },


    genDataValue: function() {
        var val = jStat.normal.sample(this.populationMean,this.populationStdv);
        return this.roundToXDigits(val,2);
    },


    clickReturnButton: function() {
        var deltaReputation = 0;
        var deltaReputationWithExposure = 0;
        // (0->0.2), (100->3)
        var exposureMultiplier = this.projectExposure*0.028+0.2;
        if (this.measurementList.length > 0){
            deltaReputation = 2 - Math.min(4, Math.abs(  (jStat.mean(this.measurementList) - this.populationMean)/this.populationStdv));
            deltaReputationWithExposure = exposureMultiplier * deltaReputation;
            game.totalReputation = Math.min(game.maxReputation, game.totalReputation + deltaReputationWithExposure)
        }

        var performance="N/A";
        if (deltaReputation <= 0.5) {
            performance = "F";
        } else if (deltaReputation > 0.5 && deltaReputation <= 1.0) {
            performance = "C";
        } else if (deltaReputation > 1.0 && deltaReputation <= 1.5) {
            performance = "B";
        } else if (deltaReputation > 1.5) {
            performance = "A";
        }
        
        console.log("reputation gained: " +  deltaReputation)
        
        game.levelResult = {
            popMean: this.populationMean,
            popStDev: this.populationStdv,
            sampleMean: jStat.mean(this.measurementList),
            reputationChange: deltaReputation,
            reputationChangeWithMultiplier: deltaReputation*exposureMultiplier,
            grade: performance,
            hasCollectedAtLeastOneSample: this.measurementList.length > 0
        }
        game.state.start('menu');
        console.log("Return button was clicked");
    },


    clickSettingsButton: function() {
        console.log("Settings button was clicked");
    },


    computeConfidenceInterval: function() {
        var mean = jStat.mean(this.measurementList);
        var confInt = jStat.tci(mean, 0.05, this.measurementList);
        confInt[0] = this.roundToXDigits(this.confInt[0], 2);
        confInt[1] = this.roundToXDigits(this.confInt[1], 2);
        return confInt;
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






/** BEGIN DIALOGUE CODE HERE **/

    initDialogueState: function() {
        this.dialogueState = {
            tween: null,
            popup: null,
            popupText: null,
            isPopupOpen: false,
            //closePopupKey: null,
            style: null,
            spsp: null
        }
        
        this.dialogueState.popup = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'background');
        var popup = this.dialogueState.popup;
        popup.alpha = 0.8;
        popup.anchor.set(0.5);
        popup.inputEnabled = true;
        popup.input.enableDrag();
        popup.scale.set(0.0);
        //this.dialogueState.closePopupKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        //this.dialogueState.closePopupKey.onDown.add(this.closePopupDialogue, this);
        this.style = { font: "32px Arial", fill: "#555555", wordWrap: true, wordWrapWidth: 500, align: "center", backgroundColor: "#ffff00" };
        this.dialogueState.popupText = game.add.text(0, 0, "DEFAULT", style);
        this.dialogueState.popupText.anchor.set(0.5);
        this.dialogueState.popupText.visible = false;
        this.dialogueState.popupText.fixedToCamera = true;
        this.dialogueState.popupText.stroke = "#ffffff";
        this.dialogueState.popupText.strokeThickness = 3;


        this.dialogueState.spsp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.dialogueState.spsp.onDown.add(this.progDialogue, this);
    },


    openPopupDialogue: function (newPopupTextString) {
        
        var dialogueState = this.dialogueState;
        if ((dialogueState.tween !== null && dialogueState.tween.isRunning) 
        || dialogueState.popup.scale.x === 1) {
            return;
        }
        
        dialogueState.popup.position.x = game.camera.x + (game.width / 2);
        dialogueState.popup.position.y = game.camera.y + (game.height / 2);

        var style = { font: "32px Arial", fill: "#555555", wordWrap: true, wordWrapWidth: 500, align: "center", backgroundColor: "#ffff00" };
        dialogueState.popupText = game.add.text(0, 0, newPopupTextString, style);
        dialogueState.popupText.x = Math.floor(dialogueState.popup.x + dialogueState.popup.width / 2);
        dialogueState.popupText.y = Math.floor(dialogueState.popup.y + dialogueState.popup.height / 2);
        dialogueState.popupText.anchor.set(0.5)
        dialogueState.popupText.fixedToCamera = true;
        dialogueState.popupText.visible = true;
        dialogueState.popupText.stroke = "#ffffff";
        dialogueState.popupText.strokeThickness = 3;
        //  Create a tween that will pop-open the Dialogue, but only if it's not already tweening or open
        dialogueState.tween = game.add.tween(dialogueState.popup.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
        dialogueState.isPopupOpen = true; 
        
    },


    closePopupDialogue: function() {
        var dialogueState = this.dialogueState;
        if (dialogueState.tween && dialogueState.tween.isRunning || dialogueState.popup.scale.x === 0.1) {
            return;
        }
        dialogueState.popupText.visible = false;
        //  Create a tween that will close the Dialogue, but only if it's not already tweening or closed
        dialogueState.tween = game.add.tween(dialogueState.popup.scale).to({ x: 0.0, y: 0.0 }, 500, Phaser.Easing.Elastic.In, true);
        dialogueState.isPopupOpen = false;
    },


    loadDialogue: function(questNum, phaseNum){
        this.texts = this.dials[questNum][phaseNum]        
    },


    genPopupText: function(dataValue) {
        return "You found a\nBLUE " + this.sampleKey + "\nSize: "+dataValue+"mm\nPress ESC to continue"
    },


    processDialogue: function(){
        this.closePopupDialogue();

        this.dialogueState.popupText.visible = false;
        newTxt = this.texts.shift();
        newTxt = newTxt == undefined ? null: newTxt +  "\nspace -- next dialogue";


        this.dialogueState.popupText = game.add.text(game.camera.width / 2, game.camera.height / 2, newTxt,this.dialogueState.style);
        //this.dialogueState.popupText.fixedToCamera = true;

        this.dialogueState.popupText.x = Math.floor(this.dialogueState.popup.x );
        this.dialogueState.popupText.y = Math.floor(this.dialogueState.popup.y * 1.8);
        this.dialogueState.popupText.anchor.set(0.5)
        this.dialogueState.popupText.stroke = "#ffffff";
        this.dialogueState.popupText.strokeThickness = 3;

        //this.openPopupDialogue();
    },



    format: function( original_string, arguments ){

        for (var k = 0; k < arguments.length; k++) {
            original_string = original_string.replace("{" + k + "}", arguments[k])
        }
        return original_string
    },

    updateGameQuestNum: function(){
        game.quest = (game.quest + 1)%5;
    }, 

    progDialogue: function (player, sample){
        // Provide me with a questNum!
        
        questNum = this.quest
        //console.log(questNum)
        if (questNum == 0){
            this.quest0()
        }

        if (questNum == 1){
            this.quest1()
        }

        if (questNum == 2){
            this.quest2()
        }

        if (questNum == 3){
            this.quest3()
        }
        if (questNum == 4){
            this.quest4()

        }
    },

    quest0: function(){

        questNum = this.quest;

        if (this.phase == 0) {
            this.loadDialogue(questNum, this.phase)        
            this.phase = this.phase + 1;

        }
        if (this.phase == 1) {
            game.paused = true;
            this.processDialogue();
        
            if (this.texts.length == 0) {
                game.paused = false;
                this.genSamples(20);
                this.phase = this.phase + 1;
                this.loadDialogue(questNum, this.phase) 
                this.objText.setText( this.objectives[questNum][this.phase]  )
            }
        }
        if (this.phase == 2){
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                // preprocess the dialogues
                console.log(this.texts)
                tx0 = this.texts[0] + jStat.mean(this.measurementList).toFixed(2).toString();
                this.texts[0] = tx0;
                tx1 = this.texts[1] + this.populationMean.toString();
                this.texts[1] = tx1;
                this.phase = this.phase + 1 
            }
            
        }

        if (this.phase == 3) {
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.loadDialogue(questNum, this.phase) 
                    this.objText.setText( this.objectives[questNum][this.phase]  )
                    this.measurementList = []
                }
            }
        }

        if (this.phase == 4){
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){
                // preprocess the dialogues
                tx0 = this.texts[0] +  this.roundToXDigits(jStat.mean(this.measurementList), 2).toString();
                this.texts[0] = tx0;
                //tx1 = "asdsaasda";
                tx1 = this.texts[1] + this.populationMean.toString();
                this.texts[1] = tx1;
                this.phase = this.phase + 1 
                
            }
            
        }

        if (this.phase == 5) {
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.updateGameQuestNum();

                }
            }
        }

        if (this.phase == 6){
            this.closePopupDialogue();
        }
    },

    quest1: function(){
        questNum = this.quest;
        if (this.phase == 0) {
            this.loadDialogue(questNum, this.phase)        
            this.phase = this.phase + 1;

        }
        if (this.phase == 1) {
            game.paused = true;
            this.processDialogue();
        
            if (this.texts.length == 0) {
                game.paused = false;
                this.genSamples(20);
                this.phase = this.phase + 1;
                this.loadDialogue(questNum, this.phase) 
                this.objText.setText( this.objectives[questNum][this.phase]  )
            }
        }
        if (this.phase == 2){
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                // preprocess the dialogues
                console.log(this.texts)
                tx0 = this.texts[0] + this.roundToXDigits(jStat.stdev(this.measurementList, true),2).toString();
                this.texts[0] = tx0;
                this.questVar = this.populationMean + this.populationStdv * 3 / 4
                tx1 = this.texts[2] + (this.roundToXDigits(this.questVar, 2)).toString();
                this.texts[2] = tx1;
                this.phase = this.phase + 1 
            }
            
        }

        if (this.phase == 3) {
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.loadDialogue(questNum, this.phase) 
                    this.objText.setText(  this.format(  this.objectives[questNum][this.phase], [this.roundToXDigits(this.questVar, 2).toString()]      )   )

                    //this.objText.setText( (this.objectives[questNum][this.phase]).format( (this.roundToXDigits(this.questVar),2).toString() ))  
                    this.measurementList = []
                }
            }
        }

        if (this.phase == 4){
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){


                deltaReputation = 2
                game.totalReputation = Math.min(game.maxReputation, game.totalReputation + deltaReputation)
                console.log("reputation gained: " +  deltaReputation)

                this.phase = this.phase + 1 
                
            }
            
        }

        if (this.phase == 5  ) {
            this.closePopupDialogue();

            mmean = jStat.mean(this.measurementList)
            sstd = jStat.stdev(this.measurementList, true)

            if((this.measurementList.length >= 5) &&  (mmean - sstd < this.questVar) &&  (mmean + sstd > this.questVar)){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.updateGameQuestNum();

                }
            }
        }

        if (this.phase == 6){
            this.closePopupDialogue();
        } 
    },

    quest2: function(){
        questNum = this.quest;
        if (this.phase == 0) {
            this.loadDialogue(questNum, this.phase)        
            this.phase = this.phase + 1;

        }
        if (this.phase == 1) {
            game.paused = true;
            this.processDialogue();
        
            if (this.texts.length == 0) {
                game.paused = false;
                this.genSamples(20);
                this.phase = this.phase + 1;
                this.loadDialogue(questNum, this.phase) 
                this.objText.setText( this.objectives[questNum][this.phase]  )
            }
        }
        if (this.phase == 2){
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                // preprocess the dialogues
                console.log(this.texts)

                sstd = jStat.stdev(this.measurementList, true);

                tx0 = this.texts[0] + this.roundToXDigits(sstd,2).toString();
                this.texts[0] = tx0;
                tx1 = this.texts[1] + this.roundToXDigits((sstd/Math.sqrt(this.measurementList.length)),2).toString();
                this.texts[1] = tx1;
                this.phase = this.phase + 1 
            }
            
        }

        if (this.phase == 3) {
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.loadDialogue(questNum, this.phase) 
                    this.objText.setText( this.objectives[questNum][this.phase]  )
                    this.measurementList = []
                }
            }
        }

        if (this.phase == 4){
            this.closePopupDialogue();
            if(this.measurementList.length >= 9){


                deltaReputation = 2 
                game.totalReputation = Math.min(game.maxReputation, game.totalReputation + deltaReputation)
                console.log("reputation gained: " +  deltaReputation)

                this.phase = this.phase + 1 
                
            }
            
        }

        if (this.phase == 5) {
            this.closePopupDialogue();



            if(this.measurementList.length >= 9  ){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.updateGameQuestNum();

                }
            }
        }

        if (this.phase == 6){
            this.closePopupDialogue();
        }
    },

    quest3: function(){
        questNum = this.quest;
        if (this.phase == 0) {
            this.loadDialogue(questNum, this.phase)        
            this.phase = this.phase + 1;

        }
        if (this.phase == 1) {
            game.paused = true;
            this.processDialogue();
        
            if (this.texts.length == 0) {
                game.paused = false;
                this.genSamples(20);
                this.phase = this.phase + 1;
                this.loadDialogue(questNum, this.phase) 
                this.objText.setText( this.objectives[questNum][this.phase]  )
            }
        }
        if (this.phase == 2){
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                // preprocess the dialogues
                console.log(this.texts)

                this.phase = this.phase + 1 
            }
            
        }

        if (this.phase == 3) {
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.loadDialogue(questNum, this.phase) 
                    this.objText.setText( this.objectives[questNum][this.phase]  )
                    this.measurementList = []
                }
            }
        }

        if (this.phase == 4){
            this.closePopupDialogue();
            confInt = this.computeConfidenceInterval();
            width = confInt[1] - confInt[0];
            sstd = jStat.stdev(this.measurementList, true);
            if((this.measurementList.length >= 5) && (sstd > width)  ){

                // preprocess the dialogues


                deltaReputation = 2
                game.totalReputation = Math.min(game.maxReputation, game.totalReputation + deltaReputation)
                console.log("reputation gained: " +  deltaReputation)

                this.phase = this.phase + 1 
                
            }
            
        }

        if (this.phase == 5) {
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.updateGameQuestNum();

                }
            }
        }

        if (this.phase == 6){
            this.closePopupDialogue();
        } 
    },

    quest4: function(){
        questNum = this.quest;
        if (this.phase == 0) {
            this.loadDialogue(questNum, this.phase)    

            this.questVar = this.populationMean + this.populationStdv * 0.5
            //
            tx6 = this.texts[6] + this.questVar.toString();
            this.texts[6] = tx6;


            this.phase = this.phase + 1;

        }
        if (this.phase == 1) {
            game.paused = true;
            this.processDialogue();
        
            if (this.texts.length == 0) {
                game.paused = false;
                this.genSamples(20);
                this.phase = this.phase + 1;
                this.loadDialogue(questNum, this.phase) 
                this.objText.setText(   this.format(   this.objectives[questNum][this.phase], [this.questVar] )  )
            }
        }
        if (this.phase == 2){
            this.closePopupDialogue();

            confInt = this.computeConfidenceInterval();
            width = confInt[1] - confInt[0];
            mmean = jStat.mean(this.measurementList);

            if(this.measurementList.length >= 5 && (  (mmean + width/2) < this.questVar)){

                // preprocess the dialogues//
                console.log(this.texts)
                this.phase = this.phase + 1 
                deltaReputation = 2
                game.totalReputation = Math.min(game.maxReputation, game.totalReputation + deltaReputation)
            }
            
        }

        if (this.phase == 3) {
            this.closePopupDialogue();
            if(this.measurementList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.updateGameQuestNum();
                }
            }
        }

        if (this.phase == 4){
            this.closePopupDialogue();
        } 
    }

};
