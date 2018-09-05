'use strict';

function randomParameters(numberOfParameters) {
  let params = new Array(numberOfParameters);
  for(let i = 0; i < numberOfParameters; i++) {
    params[i] = Math.random();
  }
  params = paramsScale(params, 0.05);
  return params;
}

function paramsScale(params, scaleFactor) {
  let result = [];
  for (let i = 0; i < params.length; i++) {
    result.push((params[i] - 0.5) * scaleFactor);
  }

  return result;
}

function movement2(tank, parameters) {
  let sensorsData = [
    tank.sensors.frontLeft.hitDistance,
    tank.sensors.frontRight.hitDistance,
    tank.sensors.leftSide.hitDistance,
    tank.sensors.rightSide.hitDistance,
  ];

  // Check for invalid values from sensors
  for (let i = 0; i < sensorsData.length; i++) {
    if (!sensorsData[i] || sensorsData[i] == Number.POSITIVE_INFINITY) {
      return;
    }
  }


  let w1 = parameters[0]*sensorsData[0]*sensorsData[0] + parameters[1]*sensorsData[0] +
           parameters[2]*sensorsData[1]*sensorsData[1] + parameters[3]*sensorsData[1] + 
           parameters[4]*sensorsData[2]*sensorsData[2] + parameters[5]*sensorsData[2] +
           parameters[6]*sensorsData[3]*sensorsData[3] + parameters[7]*sensorsData[3];

  let w2 = parameters[8]*sensorsData[0]*sensorsData[0] + parameters[9]*sensorsData[0] +
           parameters[10]*sensorsData[1]*sensorsData[1] + parameters[11]*sensorsData[1] +
           parameters[12]*sensorsData[2]*sensorsData[2] + parameters[13]*sensorsData[2] +
           parameters[14]*sensorsData[3]*sensorsData[3] + parameters[15]*sensorsData[3];

  w1 *= 0.003;
  w2 *= 0.003;

  if (w1 > 2) {
    w1 = 2;
  }
  if (w1 < -2) {
    w1 = -2;
  }

  if (w2 > 2) {
    w2 = 2;
  }
  if (w2 < -2) {
    w2 = -2;
  }

  let t = (w1-w2)*tank.wheelRadius;
  let angleTheta = Math.atan(t/tank.width);
  let distToTravel = (w1 + w2) / 2;

  tank.rotation += angleTheta;
  let moveVector = Vector.fromAngles(tank.rotation).multiply(distToTravel);
  tank.recentMovements.push(moveVector);
  tank.position = tank.position.add(moveVector);
}

function moveLimit(tank) {
  let numberOfPositions = tank.allPositions.length;
  let point1 = tank.allPositions[numberOfPositions - 1];
  let point2 = tank.allPositions[numberOfPositions - 60];
  
  if (!point1 || !point2) {
    return;
  }

  if (point1.subtract(point2).length() < 30 ) {
    tank.stopped = true;
  }
}