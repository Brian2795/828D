var tutorialState = {
	preload: function() {
		console.log("Running tutorial preload");
		game.load.image('samples', 'assets/images/samples.png');
		game.load.image('window', 'assets/images/window.png');
	},

	create: function(){
		console.log("Loading the tutorial");
		this.initBackground();
		this.addHeader("Your Objective", 100, 70);
		this.addTextBody("Gain reputation for your lab by\ncompleting missions!", 100, 110)

		this.addHeader("Grants", 500, 70);
		this.addTextBody("Apply to grants to gain access to more\nfunding and missions! Receive more grants\nwith higher reputation.", 500, 110)
		
		this.addHeader("Missions", 900, 70);
		this.addTextBody("Collect data to find truth!\nThe closer you are to the truth, the\nmore reputation you gain!", 900, 110)
		
		
		this.addImage("window", 200, 200, 0.35)
		this.addBackButton();
		//this.addTextBody("Lorem ipsum dolor sit amet, consectetur \nadipiscing elit. Vivamus ac scelerisque ligula, nec eleifend sapien. Integer nibh sem, condimentum ut nulla nec, sodales ullamcorper mauris. Donec odio purus, placerat sit amet sapien id, tincidunt dapibus enim. Nam vel dolor tincidunt felis hendrerit interdum vel at leo. Aenean auctor libero euismod neque faucibus, sit amet finibus lorem gravida. Sed libero metus, eleifend sit amet sagittis eu, commodo quis elit.", 400, 400);
	},

	initBackground: function() {
		var backgroundImage = game.add.sprite(0, 0, 'menu-bg');
		backgroundImage.width = game.width;
		backgroundImage.height = game.height;
	},

	addHeader: function(text, xPos, yPos) {
		game.add.text(xPos, yPos, text, style.navitem.default);
	},

	addImage: function(imagename, xPos, yPos, scale) {
		game.add.sprite(xPos, yPos, imagename).scale.setTo(scale,scale);
	},

	addTextBody: function(text, xPos, yPos) {
		game.add.text(xPos, yPos, text, style.smallbasiclabel.default);	
	},

	addBackButton: function() {
		var backText = game.add.text(20, 20, "Back", style.navitem.default);
		var callback = function() { game.state.start('menu'); };
		this.createTextButton(backText, "Back", "Back", callback);
	},

	createTextButton: function( text, originalString, hoverString, callback ) {
		text.inputEnabled = true;
		
		text.events.onInputOver.add(function (target) {
		  target.setStyle(style.navitem.hover);
		  target.setText(hoverString);
		});

		text.events.onInputOut.add(function (target) {
		  target.setStyle(style.navitem.default);
		  target.setText(originalString);
		});

		text.events.onInputUp.add(callback);
	},

};