class Rocket {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = random(0, TWO_PI);
        this.lastColor = randomColor();
        this.newColor = this.lastColor;
        this.blendFactor = 1;
        this.speed = random(2, 4);
        this.setDirectionModifier();
        this.size = 30;
        this.lastCollider = null;
    }

    draw() {
        let color = this.getCurrentColor();

        if (this.blendFactor < 1) {
            this.blendFactor += 0.0025;
        }

        push();
        stroke(color);
        strokeWeight(2);
        fill(0);
        translate(this.x, this.y);
        rotate(this.direction - HALF_PI);
        triangle(-this.size / 3, 0, 0, this.size, this.size / 3, 0);
        pop();

        drawCanvas.stroke(color);
        drawCanvas.strokeWeight(5);
        drawCanvas.line(this.lastX, this.lastY, this.x, this.y);

        if (frameCount % this.curveTime === 0) {
            this.setDirectionModifier();
        }
        this.direction += this.directionModifier;

        if (this.x > width + this.size) {
            this.x = -this.size;
        }
        if (this.y > height + this.size) {
            this.y = -this.size;
        }
        if (this.x < -this.size) {
            this.x = width + this.size;
        }
        if (this.y < -this.size) {
            this.y = height + this.size;
        }

        this.lastX = this.x;
        this.lastY = this.y;
        this.x += cos(this.direction) * this.speed;
        this.y += sin(this.direction) * this.speed;
    }

    getCurrentColor() {
        return lerpColor(this.lastColor, this.newColor, this.blendFactor);
    }

    setDirectionModifier() {
        this.directionModifier = random(-0.01, 0.01) * this.speed;
        this.curveTime = floor(random(60, 200));
    }

    collides(other) {
        if (this.lastCollider !== null && this.lastCollider === other) {
            return false;
        } else {
            return dist(this.x, this.y, other.x, other.y) <= (this.size + other.size) / 3;
        }
    }

    collideWith(other, newColor) {
        this.lastColor = this.getCurrentColor();
        this.newColor = newColor;
        this.blendFactor = 0;
        this.lastCollider = other;

        for (let i = random(5, 15); i > 0; i--) {
            particles.push(new Particle(this.x, this.y, this.lastColor));
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.motionX = random(-1.5, 1.5);
        this.motionY = random(-1.5, 1.5);
        this.lifetime = random(20, 60);
        this.size = random(2, 8);
    }

    draw() {
        this.lifetime--;

        this.x += this.motionX;
        this.y += this.motionY;

        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}

const rockets = new Array();
const particles = new Array();
let drawCanvas;

function setup() {
    colorMode(HSB, 255);
    pixelDensity(1);
    createCanvas(1280, 720);
    drawCanvas = createGraphics(width, height);

    for (let i = 0; i < 15; i++) {
        rockets.push(new Rocket(random(0, width), random(0, height)));
    }
}

function draw() {
    background(0);
    image(drawCanvas, 0, 0, width, height);

    for (rocket of rockets) {
        rocket.draw();

        for (other of rockets) {
            if (other !== rocket && rocket.collides(other)) {
                rocket.collideWith(other, randomColor());
                other.collideWith(rocket, randomColor());
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let particle = particles[i];
        particle.draw();

        if (particle.lifetime <= 0) {
            particles.splice(i, 1);
        }
    }
}

function randomColor() {
    return color(floor(random(0, 255)), 255, 255);
}