'use strict';

function Individual(parameters) {
  this.fitness = 0;
  this.parameters = parameters;
}

Individual.prototype.crossover = function(other) {
 let result = []
 for (let i = 0; i < this.parameters.length; i++) {
   let mixType = Math.random();
   if (mixType < 1/3) {
    result[i] = this.parameters[i];
   } else if (mixType < 2/3) {
    result[i] = other.parameters[i];
   } else {
    result[i] = (this.parameters[i]+other.parameters[i])/2;
   }
 }
  
  return new Individual(result);
}

Individual.prototype.mutate = function(mutationRate) {
  let result = [];
  for (let i = 0; i < this.parameters.length; i++) {
    let doMutate = Math.random();
    if (doMutate < 1 - mutationRate) {
      result[i] = this.parameters[i];
      continue;
    } else if (doMutate >= 1 - mutationRate && doMutate < 1 - mutationRate/3) {
      let randomIndex = getRandomInt(0, this.parameters.length - 1);
      result[i] = this.parameters[randomIndex];
      result[randomIndex] = this.parameters[i];
    } else {
      result[i] = Math.random();
    }
  }
  
  return new Individual(result);
}

function Genetic(populationSize) {
  this.populationSize = populationSize;
  this.mutationRate = 0.25;
  this.individuals = [];
}

Genetic.prototype.addIndividual = function(individual) {
  this.individuals.push(individual);
}

Genetic.prototype.evolve = function() {
  this.individuals.sort((a, b) => {
    return b.fitness - a.fitness;
  });
  let nextPopulation = [this.individuals[0], this.individuals[1]];
  
  for (let i = 0; i < this.populationSize - 2; i++) {
    let child1 = nextPopulation[0].mutate(this.mutationRate);
    let child2 = nextPopulation[1].mutate(this.mutationRate);

    let child = child1.crossover(child2);

    nextPopulation.push(child);

    // let len = nextPopulation.length;
    // let parent1Index = Math.floor(Math.random() * len);
    // let parent2Index = Math.floor(Math.random() * len);
    // while (parent2Index == parent1Index) {
    //   parent2Index = Math.floor(Math.random() * len);
    // }
    // let parent1 = nextPopulation[parent1Index];
    // let parent2 = nextPopulation[parent2Index];

    // let child = parent1.crossover(parent2);
    // child = child.mutate(this.mutateRate);
    // nextPopulation.push(child);
  }

  this.individuals = nextPopulation;
}
