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




function Grant( population, environment, recommendedRep, maxFunding, providor='NASA', duration=30 ) {
	this.population = population;
	this.environment = environment;
	this.recommendedRep = recommendedRep;
	this.maxFunding = maxFunding;
	this.providor = providor;

	this.verb = game.titleVerbs[Math.floor(Math.random() * game.titleVerbs.length)];
	this.startDate = new Date(game.date.toLocaleDateString());
	this.propDeadline = this.genDeadline(duration);			// deadline to submit a proposal
	this.description = this.getDescription();
	console.log('New grant generated.\nStart date set to ' + this.startDate.toLocaleDateString() +
		'\nProposal deadline set to ' + this.propDeadline.toLocaleDateString());
}


Grant.prototype = {
	constructor: Grant,	

	genDeadline: function( duration ) {
		var deadline = new Date(this.startDate.toDateString());
		deadline.setTime(deadline.getTime() + (duration * 24 * 60 * 60 * 1000));
		return deadline;
	},

	genProject: function() {
	/* Generates a project with funding amount and a deadline. Funding generated 
	 * based on the recommended reputation of the project and the reputation of
	 * the player.
	 */

		return project;
	},

	getDescription: function() {
		var description = this.verb + ' ' + this.population.key + 's in the ' 
			+ this.environment.key + '.';
		return description;
	},
}




function Population( key, mean, stdv, units, processCost, sprite, prodPeriod=1) {
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




function Project( title, funding, population, environment, exposure=1, duration=30 ) {
	this.fundingAward = funding;
	this.population = population;
	this.environment = environment;
	this.exposure = exposure;
	this.title = title;
	
	// reputation award 
}


Project.prototype = {
	constructor: Project,

	calcReqFunding: function() {
	/* Calculates the minimum funding requirement based on expercted number of
	 * required samples for a positive reputation result and the cost to process 
	 * each sample.
	 */

	 	return
	}
}


