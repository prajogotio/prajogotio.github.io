function getUnitVector(theta) {
    return {
        x : Math.cos(theta/180 * Math.PI), 
        y : Math.sin(theta/180 * Math.PI)
    };
}

function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function getAngleBetween(v1, v2) {
    return Math.acos( dotProduct(v1,v2)/(lengthOf(v1) * lengthOf(v2)) ) / Math.PI * 180;
}

function lengthOf(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function rotate90(v) {
    return {
        x : -v.y,
        y : v.x,
    };
}

