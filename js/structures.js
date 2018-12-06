function ConfidenceInterval( population, xLoc, yLoc, lineWidth=240, lineHeight=4, intervalHeight=6, nlColor='rgba(0,0,0,1)', intervalColor='rgba(200,0,200,1)' ) {
	this.population = population;
	
	this.xLocNl = xLoc - lineWidth/2;		// relative loc to camera 
	this.yLocNl = yLoc - lineHeight/2;		// ..assuming anchor.setTo(.5,.5)
	this.xLocInterval = this.xLocNl;
	this.yLocInterval = yLoc - intervalHeight/2;

	this.numberLine = new Phaser.Rectangle(this.xLocNl,this.yLocNl,lineWidth,lineHeight);
	this.numberLineColor = nlColor;
	this.interval = new Phaser.Rectangle(this.xLocInterval,this.yLocInterval,0,intervalHeight);
	this.intervalColor = intervalColor;
}

ConfidenceInterval.prototype = {
	constructor: ConfidenceInterval,

	computeInterval: function( values, decimals=2 ) {
        var mean = jStat.mean(values);
        var interval = jStat.tci(mean, 0.05, values);
        interval[0] = Math.round(interval[0] * 100) / 100;
        interval[1] = Math.round(interval[1] * 100) / 100;
        return interval;
    },


   	getLocOfValue: function( val ) {
   	/* Gets the physical x locations of a value on the numberLine given the 
   	 * NL's bounding locations and min/max values 
   	 */ 
   	 	var boundLower = this.xLocNl;
   	 	var boundUpper = this.xLocNl + this.numberLine.width;
   	 	var width = boundUpper - boundLower;
   	 	var ratio = (val-this.minVal) / (this.maxVal-this.minVal);
   	 	var valLoc = boundLower + ratio*width;
   		return valLoc;
   	},

	getNlLocs: function() {
	/* Returns the relative x locations of either side of the numberline
	 */
		return [xLocRel, xLocRel+numberLine.width];
	},

	setNlVals: function( midVal, stdvs=3 ) {
		this.minVal = midVal - this.population.stdv*stdvs;
		this.maxVal = midVal + this.population.stdv*stdvs;
		console.log(this.minVal)
		console.log(this.maxVal)
	},

   	setInterval: function( values ) {
   		// get the location and values of either side
   		var interval = this.computeInterval(values);
   		var locLower = this.getLocOfValue(interval[0]);
   		var locUpper = this.getLocOfValue(interval[1]);
   		this.xLocInterval = locLower;
   		this.interval.width = locUpper - locLower;; 
   		this.setIntervalColor();
   	},


   	setIntervalColor: function( negColor=[255,0,0], posColor=[100,255,100] ) {
   		var ratio = Math.min(this.interval.width / this.numberLine.width, 1);
   		var newColor = [];
   		var colorVal = 0;
   		for(let i=0; i<3; i++) {
   			colorVal = Math.round(ratio*(negColor[i]) + ((1-ratio) * posColor[i]));
   			newColor.push(colorVal);
   		}
   		
   		this.intervalColor = 'rgba(' + newColor[0] + ',' + newColor[1] + ',' 
   			+ newColor[2] + ',1)';
   	},
}



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
	this.provider = game.grantProviders[Math.floor(Math.random() * game.grantProviders.length)];
	this.startDate = new Date(game.date.toLocaleDateString());
	this.propDeadline = this.genDeadline();			// deadline to submit a proposal
	this.description = this.getDescription();

	game.grantsAvailable.push(this)
	console.log(this);
}


Grant.prototype = {
	constructor: Grant,	

	apply: function () {
	/* Generates a project with funding amount and a deadline. Funding generated 
	 * based on the recommended reputation of the project and the reputation of
	 * the player. Removes the current grant from the global list: grantsAvailable
	 */
		var funding = this.calcProjectFunding();
		var project = new Project(this.provider, this.description, this.population, this.environment, funding);
		var grantIndex = game.grantsAvailable.indexOf(this);
		game.grantsAvailable.splice(grantIndex, 1);
		return project;
	},

	calcProjectFunding: function( noise=.2 ) {
	/* Calculates funding offered for the grant based on max/min funding,
	 * recommended rep, and the player's rep - linearly w some noise added.
	 */
		var fundingRange = this.maxFunding - this.minFunding;
		var repRatio = game.totalReputation / this.recommendedRep;
		var funding = fundingRange * repRatio + this.minFunding;
		funding += fundingRange * noise * (Math.random() - 0.5);
		funding = Math.min(funding, this.maxFunding);
		funding = Math.round(funding * 100) / 100;
		return funding;
	},

	genDeadline: function( duration=-1 ) {
		if (duration == -1) {
			duration = Math.random() * 15 + 15;
		}
		var deadline = new Date(this.startDate.toDateString());
		deadline.setTime(deadline.getTime() + (duration * 24 * 60 * 60 * 1000));
		return deadline;
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




function Project(title, description, population, environment, funding, exposure=1, duration=-1 ) {
	this.population = population;			
	this.environment = environment;
	this.funding = funding;					// amount of funding awarded for project
	this.exposure = exposure;				// multiplies the influence project results have on reputation 
	

	this.description = description;
	console.log("Title is");
	console.log(title);
	if (title === null) {
		this.title = 'Project #' + String(this.getTotalProjectCount());
	} else {
		this.title = title;
	}
	
	this.startDate = new Date(game.date.toLocaleDateString());
	this.deadline = this.genDeadline(duration);

	game.projectsOngoing.push(this);
	console.log(this);
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

	genDeadline: function( duration=-1 ) {
		if (duration == -1) {
			duration = Math.random() * 15 + 15;
		}
		var deadline = new Date(this.startDate.toDateString());
		deadline.setTime(deadline.getTime() + (duration * 24 * 60 * 60 * 1000));
		return deadline;
	},

	getTotalProjectCount: function() {
		return game.projectsOngoing.length + game.projectsCompleted.length 
			+ game.projectsRejected.length + 1;
	},
}





