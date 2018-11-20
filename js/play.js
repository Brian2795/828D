var playState = {
    init: function( population ) {
        this.sampleSprite = population.sprite;
        this.populationMean = population.mean;
        this.populationStdv = population.stdv;
        this.processCost = population.processCost;
        this.prodPeriod = population.prodPeriod;
    },


    preload: function() {
        game.load.tilemap('desert', 'assets/tilemaps/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tilemaps/tiles/tmw_desert_spacing.png');
        game.load.image('ufo', 'assets/sprites/ufo.png');
        game.load.image('diamond', this.sampleSprite);
        game.load.image('supervisor', 'assets/all_sprites/asuna_by_vali233.png'); // our supervisor
    },


	create: function() {
        this.phase = 0; // dialogue var

        this.map = game.add.tilemap('desert');
        this.map.addTilesetImage('Desert', 'tiles');
        layer = this.map.createLayer('Ground');
        layer.resizeWorld();

        this.createPlayer();
        //

        //this.score = 0;
        this.scoreText = 'Score: ' //+ this.score;

        this.diamonds = game.add.group(); // now all diamonds share attributes
        this.diamonds.enableBody = true; // extension of the above

        this.npcs = game.add.group(); // add MPCs
        this.npcs.enableBody = true; 
        sup = this.npcs.create(400, 400, 'supervisor'); // our first supervisor! 

        this.initializePopupState();
        this.initializedialogueState();


        //this.generateDiamonds(12)


        // statistics
        this.sizeList = [];

        //this.generateDiamonds(12);
        this.initializeReturnButton();



        this.texts = [];
        dials1 = ["Hi, welcome to PI simulator. I am your PI", "We are, right now, studying the distribution of diamonds.", "Can you go collect some diamonds for me?", "Collect enough diamonds so that you can know your mean for sure!", ""];

        dials2 = ["Your current mean is: ", "The actual mean is: ", "As you can see there is a disparity in two values.", "In order to assess the mean of the data, you have to \ncollect a fair number of data to be confident of mean.", 
             "I want to assess the mean again. Collect more diamonds for me!", ""];

        dials3 = ["Your current mean is: ", "The actual mean is: ", "You get points: ", "Now, I want to assess the uncertainty: "]

        this.dials = [dials1, dials2, dials3];


    },

    initializeReturnButton: function() {
        this.returnButton = game.add.button(20, game.height-100, 'button', this.onClickReturnButton, this, 0, 0, 0);
        this.returnButton.fixedToCamera = true;
    },

    update: function() {
        //game.physics.arcade.collide(player, layer);
        // this.player.body.angularVelocity = 0;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        
        if (!this.popupState.isPopupOpen) {
            if (this.cursors.left.isDown) {
                this.player.body.velocity.x = -this.playerSpeed;
            } else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = this.playerSpeed;
            } else if (this.cursors.up.isDown) {
                this.player.body.velocity.y = -this.playerSpeed;
            } else if (this.cursors.down.isDown) {
                this.player.body.velocity.y = this.playerSpeed;
            }
        }

        game.physics.arcade.overlap(this.player, this.diamonds, this.collectDiamond, null, this);
        game.physics.arcade.overlap(this.player, this.npcs, this.progDialogue, null, this);
        //game.physics.arcade.overlap(this.player, this.diamonds, this.collectDiamond, null, this);
    },

    onClickReturnButton: function() {
        console.log("Return button was clicked");
    },

    initializedialogueState: function() {
        this.dialogueState = 
        {
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
            
            dialogueState.popupText.visible = true;
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





    processDialogue: function(){
        this.closePopupDialogue();

        this.dialogueState.popupText.visible = false;
        newTxt = this.texts.shift();
        newTxt = newTxt == undefined ? null: newTxt +  "\nspace -- next dialogue";


        this.dialogueState.popupText = game.add.text(game.camera.width / 2, game.camera.height / 2, newTxt,this.dialogueState.style);
        this.dialogueState.popupText.x = Math.floor(this.dialogueState.popup.x + this.dialogueState.popup.width / 2);
        this.dialogueState.popupText.y = Math.floor(this.dialogueState.popup.y + this.dialogueState.popup.height / 2);
        this.dialogueState.popupText.anchor.set(0.5)

        this.openPopupDialogue();
    },

    progDialogue: function (player, diamond){
        if (this.phase == 0) {
            this.texts = this.dials.shift();  // NEED TO FIX; change to load dialogue
            this.phase = this.phase + 1;

        }
        if (this.phase == 1) {
            game.paused = true;
            this.processDialogue();
        
            if (this.texts.length == 0) {
                game.paused = false;
                this.generateDiamonds(20);
                this.phase = this.phase + 1;
                this.texts = this.dials.shift(); // NEED TO FIX
            }
        }
        if (this.phase == 2){
            this.closePopupDialogue();
            if(this.sizeList.length >= 5){

                // preprocess the dialogues
                //tx0 = "asd";
                tx0 = this.texts[0] + jStat.mean(this.sizeList).toString();
                this.texts[0] = tx0;
                //tx1 = "asdsaasda";
                tx1 = this.texts[1] + this.populationMean.toString();
                this.texts[1] = tx1;
                this.phase = this.phase + 1 
            }
            
        }

        if (this.phase == 3) {
            this.closePopupDialogue();
            if(this.sizeList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.texts =this.dials.shift();// NEED TO FIX

                }
            }
        }

        if (this.phase == 4){
            this.closePopupDialogue();
            if(this.sizeList.length >= 5){

                // preprocess the dialogues
                //tx0 = "asd";
                tx0 = this.texts[0] + jStat.mean(this.sizeList).toString();
                this.texts[0] = tx0;
                //tx1 = "asdsaasda";
                tx1 = this.texts[1] + this.populationMean.toString();
                this.texts[1] = tx1;
                this.phase = this.phase + 1 
                this.sizeList = []
            }
            
        }

        if (this.phase == 5) {
            this.closePopupDialogue();
            if(this.sizeList.length >= 5){

                game.paused = true;
                this.processDialogue();

                if(this.texts.length == 0){
                    game.paused = false;
                    this.phase = this.phase + 1;
                    this.texts =this.dials.shift();// NEED TO FIX

                }
            }
        }

        if (this.phase == 6){
            this.closePopupDialogue();
        }

    },


    initializePopupState: function() {
        this.popupState = 
        {
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
        this.style = { font: "32px Arial", fill: "#555555", wordWrap: true, wordWrapWidth: 500, align: "center", backgroundColor: "#ffff00" };
        this.popupState.popupText = game.add.text(0, 0, "You found a\nBLUE DIAMOND\nSize: 2mm\nPress ESC to continue", style);
        this.popupState.popupText.anchor.set(0.5);
        this.popupState.popupText.visible = false;


        this.popupState.spsp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.popupState.spsp.onDown.add(this.progDialogue, this);
    },

    generatePopupText: function(dataValue) {
        return "You found a\nBLUE DIAMOND\nSize: "+dataValue+"mm\nPress ESC to continue"
    },

    generateDataValueFromDistr: function() {
        return this.round(jStat.normal.sample(this.populationMean,this.populationStdv),2);
    },

    round: function (value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
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



    render: function() {
        game.debug.text('Collect All the Diamonds!', 32, 32, 'rgb(0,0,0)');
        game.debug.text(this.scoreText, 32, 90, 'rgb(0,0,0)');
    },


    createPlayer: function() {
        this.player = game.add.sprite(450, 80, 'ufo');
        this.cursors = game.input.keyboard.createCursorKeys();

        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.playerSpeed = 250;

        game.camera.follow(this.player);
        this.player.body.collideWorldBounds = true;
    },


    generateDiamonds: function(totDiamonds) {
        // create diamonds.
        for (var i = 0; i < totDiamonds; i++) {
            locX = this.map.tileWidth * this.map.width * Math.random();
            locY = this.map.tileHeight * this.map.height * Math.random();
            var diamond = this.diamonds.create(locX , locY, 'diamond');
        }
    },

    collectDiamond: function (player, diamond) {
        diamond.kill();
        //this.score += 10;

        diamondValue = this.generateDataValueFromDistr();

        this.sizeList.push(diamondValue)
        this.scoreText = 'Score: ' + this.sizeList.toString();
        this.openPopupWindow(this.generatePopupText(diamondValue));
        this.generateDiamonds(1); // replenishing diamonds. 
    },




    
};
