'use strict';

function Tank(position) {
  this.position = position;
  this.velocity = new Vector(1, 0);
  this.rotation = degreesToRadians(90);

  let alpha = Math.random() + 0.2;
  let r = getRandomInt(0, 255);
  let g = getRandomInt(0, 255);
  let b = getRandomInt(0, 255);

  this.color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  this.width = 50;
  this.height = 20;
  this.center = new Vector(this.position.x + this.width/2, this.position.y + this.height/2);

  this.wheelRadius = 5;

  this.rotationSpeed = 5;
  this.moveSpeed = 5;

  this.nearestDistToCheckpoint = Number.POSITIVE_INFINITY;
  this.checkpointIndex = 0;
  this.checkpoints = [];

  this.allPositions = [];
  this.recentMovements = [];
  this.totalDistance = 0

  this.stopped = false;

  this.sensors = {
      frontLeft: {
          offsetPos: new Vector(this.width, 0),
          position: new Vector(this.width, 15),
          direction: Vector.zero,
          length: 1000,
          hitDistance: Number.POSITIVE_INFINITY
      },
      frontRight : {
          offsetPos: new Vector(this.width, this.height),
          position: new Vector(this.width, this.height - 15),
          direction: Vector.zero,
          length: 1000,
          hitDistance: Number.POSITIVE_INFINITY
      },
      leftSide : {
          offsetPos: new Vector(this.width - 15, 15),
          offsetAngle: degreesToRadians(-90),
          position: new Vector(this.width - 15, 0),
          direction: Vector.zero,
          length: 1000,
          hitDistance: Number.POSITIVE_INFINITY
      },
      rightSide: {
          offsetPos: new Vector(this.width - 15, this.height - 15),
          position: new Vector(this.width - 15, this.height),
          offsetAngle: degreesToRadians(90),
          direction: Vector.zero,
          length: 1000,
          hitDistance: Number.POSITIVE_INFINITY
      }
  };
}

function Checkpoint(position) {
  this.radius = 50;
  this.position = position;

  this.checked = false;
}