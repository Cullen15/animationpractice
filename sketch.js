let sound;
let particles = [];
let phase = "birth";
let timer = 0;
let maxParticles = 200;
let credits = [
    "Director: Cullen Bertsch",
    "Visual Effects: Cullen Bertsch",
    "Music: From FreeSound.org",
    "Thank you for watching!"
];
let started = false;
let showFinalMessage = false;
let finalMessageTimer = 0;
let restartPromptShown = false;
let flowerRadius = 0;
let flowerPetals = 12;
let flowerRotation = 0;
let flowerClosing = false;
let creditsStartTime = 0;
let fadeOutStartTime = 0;
let colorSchemes;

function preload() {
    sound = loadSound('assets/music.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255);
    background(0);

    // Initialize color schemes in setup
    colorSchemes = {
        birth: [
            color(255, 100, 150),
            color(150, 100, 255),
            color(100, 200, 255)
        ],
        growth: [
            color(100, 255, 150),
            color(150, 255, 100),
            color(200, 255, 50)
        ],
        climax: [
            color(255, 50, 50),
            color(255, 150, 50),
            color(255, 255, 50)
        ],
        collapse: [
            color(150, 50, 255),
            color(100, 50, 200),
            color(50, 50, 150)
        ]
    };
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0, 20);

    if (!started) {
        drawStartScreen();
        return;
    }

    timer += deltaTime;

    switch(phase) {
        case "birth":
            drawBirth();
            if (timer > 4000) transitionTo("growth");
            break;
        case "growth":
            drawGrowth();
            if (timer > 12000) transitionTo("climax");
            break;
        case "climax":
            drawClimax();
            if (timer > 20000) transitionTo("collapse");
            break;
        case "collapse":
            drawCollapse();
            if (particles.length === 0) transitionTo("credits");
            break;
        case "credits":
            drawCredits();
            break;
    }

    if (showFinalMessage) {
        !flowerClosing ? bloomFlower() : closeFlower();
    }

    handleMusicFade();
}

class EnhancedParticle {
    constructor(x, y, currentPhase) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 2));
        this.alpha = 255;
        this.originalSize = random(5, 20);
        this.size = this.originalSize;
        this.rotationSpeed = random(-0.1, 0.1);
        this.rotation = random(TWO_PI);
        this.shape = floor(random(3));
        
        // Get color from schemes
        let schemeColors = colorSchemes[currentPhase];
        this.color = schemeColors[floor(random(schemeColors.length))];
    }

    update() {
        this.pos.add(this.vel);
        this.vel.mult(0.98);
        this.size = this.originalSize * (1 + sin(frameCount * 0.1) * 0.2);
    }

    explode() {
        this.update();
        this.vel.add(p5.Vector.random2D().mult(0.5));
        this.alpha -= 2;
    }

    fade() {
        this.vel.mult(0.95);
        this.alpha -= 2;
    }

    isDone() {
        return this.alpha <= 0;
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        noStroke();
        fill(this.color.levels[0], this.color.levels[1], 
             this.color.levels[2], this.alpha);

        switch(this.shape) {
            case 0: // Circle
                ellipse(0, 0, this.size);
                break;
            case 1: // Square
                rectMode(CENTER);
                rect(0, 0, this.size, this.size);
                break;
            case 2: // Triangle
                triangle(-this.size/2, this.size/2,
                        this.size/2, this.size/2,
                        0, -this.size/2);
                break;
        }
        pop();

        this.rotation += this.rotationSpeed;
    }
}

function drawStartScreen() {
    let pulseSize = 30 + sin(frameCount * 0.05) * 10;
    
    for (let i = 0; i < width; i += 50) {
        for (let j = 0; j < height; j += 50) {
            let d = dist(mouseX, mouseY, i, j);
            let size = map(d, 0, 500, 10, 2);
            fill(255, 50);
            noStroke();
            ellipse(i, j, size);
        }
    }

    push();
    textSize(50);
    let titleY = height/2 - 100 + sin(frameCount * 0.03) * 20;
    fill(255);
    text("Abstract Journey", width/2, titleY);
    
    textSize(24);
    fill(255, 200);
    text("An Interactive Animation", width/2, titleY + 60);
    
    textSize(20);
    fill(255, abs(sin(frameCount * 0.05)) * 255);
    text("Click anywhere to begin", width/2, height/2 + 100);
    pop();
}

function drawBirth() {
    let t = millis() * 0.001;
    
    push();
    translate(width/2, height/2);
    rotate(t);
    
    for (let i = 0; i < 5; i++) {
        let size = (50 + sin(t + i) * 20) * (5-i)/5;
        let alpha = map(i, 0, 4, 255, 50);
        fill(colorSchemes.birth[i % 3].levels[0],
             colorSchemes.birth[i % 3].levels[1],
             colorSchemes.birth[i % 3].levels[2],
             alpha);
        ellipse(0, 0, size, size);
    }
    
    noFill();
    stroke(255, 100);
    for (let i = 0; i < 360; i += 30) {
        let r = i * 0.3;
        let x = cos(t + i) * r;
        let y = sin(t + i) * r;
        line(0, 0, x, y);
    }
    pop();
}

function drawGrowth() {
    if (particles.length < maxParticles) {
        let angle = random(TWO_PI);
        let radius = random(50, 150);
        let x = width/2 + cos(angle) * radius;
        let y = height/2 + sin(angle) * radius;
        particles.push(new EnhancedParticle(x, y, phase));
    }

    for (let p of particles) {
        p.update();
        p.display();
    }

    stroke(255, 30);
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let d = dist(particles[i].pos.x, particles[i].pos.y,
                        particles[j].pos.x, particles[j].pos.y);
            if (d < 100) {
                line(particles[i].pos.x, particles[i].pos.y,
                     particles[j].pos.x, particles[j].pos.y);
            }
        }
    }
}

function drawClimax() {
    if (frameCount % 5 === 0) {
        let burstCenter = createVector(random(width), random(height));
        for (let i = 0; i < 10; i++) {
            particles.push(new EnhancedParticle(burstCenter.x, burstCenter.y, phase));
        }
    }

    for (let p of particles) {
        p.explode();
        p.display();
    }

    translate(random(-5, 5), random(-5, 5));
}

function drawCollapse() {
    let center = createVector(width/2, height/2);
    
    for (let p of particles) {
        let direction = p5.Vector.sub(center, p.pos);
        direction.normalize();
        direction.mult(0.5);
        p.vel.add(direction);
        p.fade();
        p.display();
    }

    particles = particles.filter(p => !p.isDone());
}

function drawCredits() {
    if (creditsStartTime === 0) {
        creditsStartTime = millis();
    }

    background(0);
    fill(255);
    let elapsed = millis() - creditsStartTime;
    let scrollY = height - elapsed * 0.3;

    for (let i = 0; i < credits.length; i++) {
        text(credits[i], width/2, scrollY + i * 40);
    }

    if (scrollY + credits.length * 40 < 0 && !showFinalMessage) {
        showFinalMessage = true;
        finalMessageTimer = millis();
    }

    if (showFinalMessage) {
        drawEndMessage();
    }
}

function drawEndMessage() {
    let fade = map(millis() - finalMessageTimer, 0, 2000, 0, 255);
    fill(255, fade);
    textSize(32);
    text("The End", width/2, height/2);

    if (millis() - finalMessageTimer > 6000) {
        fill(200, fade);
        textSize(20);
        text("Click to replay", width/2, height/2 + 40);
        restartPromptShown = true;
    }
}

function bloomFlower() {
    flowerRadius += 2;
    if (flowerRadius >= 100) {
        flowerClosing = true;
    }
    drawFlower();
}

function closeFlower() {
    flowerRadius -= 1;
    if (flowerRadius <= 0) {
        flowerRadius = 0;
        showFinalMessage = false;
    }
    drawFlower();
}

function drawFlower() {
    push();
    translate(width/2, height/2);
    rotate(flowerRotation);
    
    for (let i = 0; i < flowerPetals; i++) {
        let angle = TWO_PI / flowerPetals * i;
        let petalX = cos(angle) * flowerRadius;
        let petalY = sin(angle) * flowerRadius;
        
        push();
        translate(petalX, petalY);
        rotate(angle + PI/2);
        
        beginShape();
        vertex(0, -flowerRadius/2);
        bezierVertex(flowerRadius/4, -flowerRadius/4,
                    flowerRadius/4, flowerRadius/4,
                    0, flowerRadius/2);
        bezierVertex(-flowerRadius/4, flowerRadius/4,
                    -flowerRadius/4, -flowerRadius/4,
                    0, -flowerRadius/2);
        endShape(CLOSE);
        pop();
    }
    
    fill(255, 200, 0);
    ellipse(0, 0, flowerRadius * 0.5);
    pop();
    
    flowerRotation += 0.01;
}

function handleMusicFade() {
    if (flowerClosing && fadeOutStartTime === 0) {
        fadeOutStartTime = millis();
    }
    
    if (fadeOutStartTime > 0) {
        let fadeDuration = 3000;
        let elapsed = millis() - fadeOutStartTime;
        let fadeVolume = map(elapsed, 0, fadeDuration, 1, 0);
        fadeVolume = constrain(fadeVolume, 0, 1);
        sound.setVolume(fadeVolume);
    }
}

function mousePressed() {
    if (!started) {
        started = true;
        sound.play();
        timer = 0;
    } else if (restartPromptShown) {
        resetAnimation();
    }
}

function resetAnimation() {
    timer = 0;
    particles = [];
    phase = "birth";
    showFinalMessage = false;
    restartPromptShown = false;
    flowerRadius = 0;
    flowerClosing = false;
    creditsStartTime = 0;
    fadeOutStartTime = 0;
    sound.stop();
    sound.play();
}

function transitionTo(newPhase) {
    phase = newPhase;
    timer = 0;
    if (newPhase !== "credits") {
        creditsStartTime = 0;
    }
} 