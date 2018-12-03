function Environment( key, tilemap, tiles, moveMultiplier=1, prodMultiplier=1 ) {
	this.key = key;							// keyword of the tilemap used by the environment
	this.tilemap = tilemap;					// name of the tilemap file used by this environment 	
	this.tiles = tiles;						// name of the tilemap image file used by this map
	this.moveMultiplier = moveMultiplier;	// multiplier to the movement speed of the player
	this.prodMultiplier = prodMultiplier;	// multiplier to production rate of samples
}


Environment.prototype = {
    constructor: Environment,
}




function Grant( population, environment, recommendedRep, maxFunding ) {
	this.population = population;
	this.environment = environment;
	this.recommendedRep = recommendedRep;
	this.maxFunding = maxFunding;
	this.minFunding = maxFunding / 2;

	this.verb = game.titleVerbs[Math.floor(Math.random() * game.titleVerbs.length)];
	this.providor = game.grantProvidors[Math.floor(Math.random() * game.grantProvidors.length)];
	this.startDate = new Date(game.date.toLocaleDateString());
	this.propDeadline = this.genDeadline();			// deadline to submit a proposal
	this.description = this.getDescription();

	game.grantsAvailable.push(this)
	console.log('New grant generated.\nStart date set to ' + this.startDate.toLocaleDateString() 
		+ '\nProposal deadline set to ' + this.propDeadline.toLocaleDateString());
}


Grant.prototype = {
	constructor: Grant,	

	calcProjectFunding: function( noise=.2 ) {
	/* Calculates funding offered for the grant based on max/min funding,
	 * recommended rep, and the player's rep - linearly w some noise added.
	 */
		var ratio = playerRep / game.totalReputation;
		var fundingRange = this.maxFunding - this.minFunding;
		var funding = this.fundingRange * ratio + this.minFunding;
		funding += fundingRange * noise * (Math.random() - 0.5);
		return min(funding, this.maxFunding)
	},

	genDeadline: function( duration=-1 ) {
		if (duration == -1) {
			duration = Math.random() * 15 + 15;
		}
		var deadline = new Date(this.startDate.toDateString());
		deadline.setTime(deadline.getTime() + (duration * 24 * 60 * 60 * 1000));
		return deadline;
	},

	genProject: function() {
	/* Generates a project with funding amount and a deadline. Funding generated 
	 * based on the recommended reputation of the project and the reputation of
	 * the player.
	 */
	 	var funding = this.calcProjectFunding()
	 	// var project = new Project(this.)
	 	// Project( title, funding, population, environment)
		return project;
	},

	getDescription: function() {
		var description = this.verb + ' ' + this.population.key + 's in the ' 
			+ this.environment.key;
		return description;
	},
}




function Population( key, mean, stdv, units, processCost, sprite, prodPeriod=1 ) {
	this.key = key;
	this.mean = mean;
	this.units = units; 
	this.stdv = stdv;
	this.prodPeriod = prodPeriod; 		// the average expected time to generate a single sample on the map
	this.processCost = processCost; 	// cost to process a single sample from this population
	this.sprite = sprite;
}


Population.prototype = {
    constructor: Population,
}




function Project( title, description, population, environment, funding, exposure=1, duration=30 ) {
	this.title = 'Project #' + String(this.getTotalProjectCount());
	this.description = description;
	this.population = population;			
	this.environment = environment;
	this.funding = funding;					// amount of funding awarded for project
	this.exposure = exposure;				// multiplies the influence project results have on reputation 
	
	game.projectsOngoing.push(this);
}


Project.prototype = {
	constructor: Project,

	calcReqFunding: function() {
	/* Calculates the minimum funding requirement based on expercted number of
	 * required samples for a positive reputation result and the cost to process 
	 * each sample.
	 */
	 	// use 
	 	return
	},

	getTotalProjectCount: function() {
		return game.projectsOngoing.length + game.projectsCompleted.length 
			+ game.projectsRejected.length + 1;
	}
}


