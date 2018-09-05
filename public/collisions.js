'use strict';


function lineLineTest(line1, line2) {
    let uA = ((line2.x2 - line2.x1)*(line1.y1 - line2.y1) - (line2.y2 - line2.y1)*(line1.x1 - line2.x1)) / ((line2.y2 - line2.y1)*(line1.x2 - line1.x1) - (line2.x2 - line2.x1)*(line1.y2 - line1.y1));
    let uB = ((line1.x2 - line1.x1)*(line1.y1 - line2.y1) - (line1.y2 - line1.y1)*(line1.x1 - line2.x1)) / ((line2.y2 - line2.y1)*(line1.x2-line1.x1) - (line2.x2-line2.x1)*(line1.y2 - line1.y1));

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return true;
    }
    return false;
}

function linePolygonTest(line, polygon) {
    let minDistance = Number.POSITIVE_INFINITY;
    let hitResult = null;
    for (let i = 0; i < polygon.length - 1; i++) {
        let pVertex = polygon[i];
        let next = i + 1;
        // if (next == polygon.length) {
        //     next = 0;
        // }
        let pVertexNext = polygon[next];

        let hitPlace = segmentToSegmentTest(line.x1, line.y1, line.x2, line.y2,
                                       pVertex.x, pVertex.y, pVertexNext.x, pVertexNext.y)
        
        if (hitPlace) {
            let currDistance = new Vector(hitPlace.x, hitPlace.y).subtract(new Vector(line.x1, line.y1)).length();
            if (currDistance < minDistance) {
                hitResult = hitPlace;
                minDistance = currDistance;
            }
        }
    }
    
    if (hitResult !== null) {
        return minDistance;
    }

    return false;
}

var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}
function segmentToSegmentTest(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return {x: x, y: y};
}