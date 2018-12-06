var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'gameDiv');

game.state.add('boot', bootState);
game.state.add('welcome', welcomeState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('tutorial', tutorialState);

game.totalFunding = 1000;
game.maxFunding = 1000000;
game.totalReputation = 30;
game.maxReputation = 100;
game.date = new Date(2000,0,1,0,0,0);

game.quest = 0;

game.projectsOngoing = [];
game.projectsCompleted = [];
game.projectsRejected = [];
game.grantsAvailable = [];

// predeclaring 


game.titleVerbs = ['Processing', 'Studying', 'Observing', 'Evaluating', 'Investigating'];
game.grantProviders = [
	'NIH', 
	'DARPA', 
	'EPA', 
	'NSF', 
	'NASA'
];
game.environments = {};
game.populations = {};
game.started = false;
game.state.start('boot');