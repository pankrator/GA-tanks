'use strict';

let world = {
    AI: false,
    geneticModel: new Genetic(1),
    tanks: [],
    tank: new Tank(new Vector()),
    mouse: new Vector(0, 0),

    polygons: [[new Vector(10, 10), new Vector(10, 680), new Vector(980, 680), new Vector(980, 10), new Vector(10, 10)]],
    checkpoints: [],
    points: [],

    lastResetTime: null,
    timeBetweenSimulations: 1000 * 30,
};

let input = new Array(255);

window.onload = () => {
    let canvas = document.getElementById("area");
    let context = canvas.getContext("2d");

    canvas.addEventListener("mousemove", (event) => {
        world.mouse.x = event.clientX;
        world.mouse.y = event.clientY;
    });
    canvas.addEventListener("mouseup", (event) => {
        world.points.push(new Vector(world.mouse.x, world.mouse.y));
    });

    window.addEventListener("keydown", (event) => {
        input[event.keyCode] = true;
    }, 1);
    window.addEventListener("keyup", (event) => {
        input[event.keyCode] = false;
    }, 1);
    window.addEventListener("keypress", (event) => {
        if (event.keyCode == enums.keyboard.KEY_L + 32) {
            world.polygons.push(world.points);
            world.points = [];
        }

        if (event.keyCode == enums.keyboard.KEY_C + 32) {
            world.checkpoints.push(new Checkpoint(new Vector(world.mouse.x, world.mouse.y)));
        }
    }, 1);

    let resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => {
        init();
    });

    init();
    update(context);
};

function init() {
    world.geneticModel = new Genetic(30);
    reset();

    for (let i = 0; i < world.geneticModel.populationSize; i++) {
        let params = randomParameters(16);
        world.geneticModel.addIndividual(new Individual(params));
    }
}

function reset() {
    const elitism = parseInt(document.getElementById("elitism").value);
    world.geneticModel.elitism = elitism;

    const mutationRate = parseFloat(document.getElementById("mutation-rate").value);
    world.geneticModel.mutationRate = mutationRate;

    world.tanks = [];
    for (let i = 0; i < world.geneticModel.populationSize; i++) {
        let tank = new Tank(new Vector(200, 150));
        
        for (let j = 0; j < world.checkpoints.length; j++) {
            let checkpoint = world.checkpoints[j];
            tank.checkpoints.push(new Checkpoint(checkpoint.position));
        }

        world.tanks.push(tank);
    }
    world.lastResetTime = Date.now();
}

function updateSensor(tank, sensor) {
    sensor.position = new Vector(tank.position.x + sensor.offsetPos.x, tank.position.y + sensor.offsetPos.y);
    sensor.position = sensor.position.subtract(tank.center);
    sensor.position = sensor.position.rotate(tank.rotation);
    sensor.position = sensor.position.add(tank.center);

    sensor.direction = Vector.fromAngles(tank.rotation);
    if (sensor.offsetAngle) {
        sensor.direction = Vector.fromAngles(tank.rotation + sensor.offsetAngle);
    }

    let scaledDir = sensor.direction.multiply(sensor.length);
    let sensorTo = new Vector(sensor.position.x, sensor.position.y).add(scaledDir);

    sensor.hitDistance = Number.POSITIVE_INFINITY;
    sensor.hit = false;

    for (let k = 0; k < world.polygons.length; k++) {
        let polygon = world.polygons[k];

        let distanceToCollision = linePolygonTest({
            x1: sensor.position.x, y1: sensor.position.y,
            x2: sensorTo.x, y2: sensorTo.y
        }, polygon);

        if (distanceToCollision !== false && sensor.hitDistance > distanceToCollision) {
            sensor.hit = true;
            sensor.hitDistance = distanceToCollision;
        }
    }
}

function updateInput() {
    if (input[enums.keyboard.SPACE]) {
        world.AI = !world.AI;
    }

    // if (input[enums.keyboard.])

    if (input[enums.keyboard.LEFT_ARROW]) {
        world.tanks[0].rotation -= degreesToRadians(world.tanks[0].rotationSpeed);
    }
    if (input[enums.keyboard.RIGHT_ARROW]) {
        world.tanks[0].rotation += degreesToRadians(world.tanks[0].rotationSpeed);
    }

    if (input[enums.keyboard.UP_ARROW]) {
        let direction = Vector.fromAngles(world.tanks[0].rotation).multiply(world.tanks[0].moveSpeed);
        world.tanks[0].position = world.tanks[0].position.add(direction);
    }
}

function update(ctx) {
    updateHTML();
    updateInput();

    let areAllStopped = world.tanks.every((tank) => {
        return tank.stopped;
    });
    
    if (world.AI && (world.lastResetTime !== null || areAllStopped)) {
        if (Date.now() - world.lastResetTime >= world.timeBetweenSimulations || areAllStopped) {
            for (let i = 0; i < world.geneticModel.populationSize; i++) {
                console.log("TANK" + i, "=", world.geneticModel.individuals[i].fitness);
            }
            console.log(">>>>>>>RESET<<<<<<<<")
            world.geneticModel.evolve();
            reset();
        }
    }

    for (let i = 0; i < world.geneticModel.populationSize; i++) {
        let tank = world.tanks[i];

        world.geneticModel.individuals[i].fitness = tank.totalDistance;
        for (let j = 0; j < tank.checkpoints.length; j++) {
            if (tank.checkpoints[j].checked) {
                world.geneticModel.individuals[i].fitness += (j + 1) * 500;
            }
        }

        if (tank.stopped) {
            continue;
        }

        tank.center = new Vector(tank.position.x + tank.width/2, tank.position.y + tank.height/2);
        updateSensor(tank, tank.sensors.frontLeft);
        updateSensor(tank, tank.sensors.frontRight);
        updateSensor(tank, tank.sensors.leftSide);
        updateSensor(tank, tank.sensors.rightSide);

        if (world.AI) {
            movement2(tank, world.geneticModel.individuals[i].parameters);
        }

        if (tankToPolygonCollision(tank)) {
            tank.stopped = true;
            continue;
        }
        
        tank.allPositions.push(tank.position.clone());
        let recentlyTravelled = tank.recentMovements.reduce((prev, curr) => {
            return prev.add(curr);
        }, new Vector(0, 0)).length();

        if (Math.abs(recentlyTravelled) > 50) {
            tank.totalDistance += recentlyTravelled;
            tank.recentMovements = [];
            world.geneticModel.individuals[i].fitness = tank.totalDistance;
            // console.log("totalDistance=", tank.totalDistance);
        }

        if (world.AI) {
            moveLimit(tank);
            checkpointCheck(tank);
        }
    }

    draw(ctx);

    setTimeout(function() {
        update(ctx);
    }, 1000/60);
}

function tankToPolygonCollision(tank) {
    for (let i = 0; i < world.polygons.length; i++) {
        let polygon = world.polygons[i];
        for (let j = 0; j < polygon.length - 1; j++) {
            let point1 = polygon[j];
            let point2 = polygon[j+1];
            point1 = point1.subtract(tank.center);
            point1 = point1.rotate(-tank.rotation);
            point2 = point2.subtract(tank.center);
            point2 = point2.rotate(-tank.rotation);

            let rect = {x1: -tank.width/2, y1: -tank.height/2,
                        x2: tank.width/2, y2: -tank.height/2,
                        x3: -tank.width/2, y3: tank.height/2,
                        x4: tank.width/2, y4: tank.height/2};
            
            let c1 = segmentToSegmentTest(point1.x, point1.y, point2.x, point2.y,
                                rect.x1, rect.y1, rect.x2, rect.y2);

            let c2 = segmentToSegmentTest(point1.x, point1.y, point2.x, point2.y,
                            rect.x1, rect.y1, rect.x3, rect.y3);

            let c3 = segmentToSegmentTest(point1.x, point1.y, point2.x, point2.y,
                rect.x2, rect.y2, rect.x4, rect.y4);
            
            let c4 = segmentToSegmentTest(point1.x, point1.y, point2.x, point2.y,
                rect.x3, rect.y3, rect.x4, rect.y4);
            
            if (c1 || c2 || c3 || c4) {
                return true;
            }
        }
    }
}

function updateHTML() {
    let content = document.getElementById("simulation-time");
    content.innerHTML = `SIMULATION TIME LEFT: ${(world.timeBetweenSimulations - (Date.now() - world.lastResetTime)) / 1000}`;

    let info = document.getElementById("info-content");
    info.innerHTML = "";
    for (let i = 0; i < world.geneticModel.populationSize; i++) {
        let individual = world.geneticModel.individuals[i];
        info.innerHTML += `<div>TANK ${i}: ${Math.ceil(individual.fitness)}</div>`;
    }
}