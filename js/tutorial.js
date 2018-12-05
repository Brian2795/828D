var tutorialState = {

	create: function(){
		console.log("Loading the tutorial");
		this.initBackground();
	},

	initBackground: function() {
		var backgroundImage = game.add.sprite(0, 0, 'menu-bg');
		backgroundImage.width = game.width;
		backgroundImage.height = game.height;
	}
};