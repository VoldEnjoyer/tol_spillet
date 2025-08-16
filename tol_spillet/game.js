// Sigma Banan Mafia Quest - Det ultimate spillet
class SoundSystem {
    constructor() {
        this.sounds = {};
        this.muted = false;
    }
    
    playSound(frequency, duration, type = 'square') {
        if (this.muted) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    playBallKick() {
        // Epic ball kick sound
        this.playSound(800, 0.1, 'sawtooth');
        setTimeout(() => this.playSound(400, 0.15, 'square'), 100);
        setTimeout(() => this.playSound(200, 0.2, 'sine'), 200);
    }
    
    playPunch() {
        this.playSound(300, 0.1, 'square');
    }
    
    playQuestComplete() {
        this.playSound(523, 0.2, 'sine'); // C5
        setTimeout(() => this.playSound(659, 0.2, 'sine'), 100); // E5
        setTimeout(() => this.playSound(784, 0.3, 'sine'), 200); // G5
    }
    
    playBossAwaken() {
        this.playSound(100, 0.5, 'sawtooth');
        setTimeout(() => this.playSound(150, 0.5, 'sawtooth'), 250);
        setTimeout(() => this.playSound(200, 0.5, 'sawtooth'), 500);
    }
    
    playVictory() {
        const notes = [523, 659, 784, 1047]; // C-E-G-C
        notes.forEach((note, i) => {
            setTimeout(() => this.playSound(note, 0.3, 'sine'), i * 150);
        });
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.ui = document.getElementById('ui');
        this.instructions = document.getElementById('instructions');
        
        this.gameState = 'loading';
        this.loadingTime = 0;
        this.lastTime = 0;
        this.gameWon = false;
        
        this.keys = {};
        this.setupEventListeners();
        
        // Sound system
        this.soundSystem = new SoundSystem();
        
        // Game state
        this.camera = { x: 0, y: 0 };
        this.world = { width: 1600, height: 1200 };
        
        // Initialize game objects
        this.player = new Player(400, 300);
        this.npcs = [];
        this.enemies = [];
        this.quests = [];
        this.particles = [];
        this.funnyMessages = [
            "Sigma ballekick! 🦶💥",
            "Critical hit på ballene! 😵",
            "Aua mine baller! 😭",
            "Sigma move! 😎",
            "Ballekick master! 🥋",
            "Ouch my sigma balls! 🤕",
            "BALLEKICK DELUXE! 💯",
            "Sigma grindset aktivert! 🔥",
            "Chad move bro! 💪",
            "RIP ballene 😭💀",
            "DESTRUCTION 100! 🎯",
            "Ultimate sigma technique! ⚡"
        ];
        
        this.sigmaQuotes = [
            "I am the banana of your nightmares! 🍌😈",
            "Sigma grindset never stops! 💪",
            "You cannot defeat the ultimate fruit! 🍌👑",
            "My banana power is over 9000! ⚡",
            "Prepare for sigma destruction! 💥",
            "I am inevitable... like a banana! 🍌♾️"
        ];
        
        this.randomEventTimer = 0;
        
        this.initializeWorld();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    initializeWorld() {
        // Create quest NPCs
        this.npcs.push(new QuestNPC(200, 200, "Bamse Benny", "Hei! Jeg trenger hjelp med å finne min tapte banan! Belønning: +5 styrke"));
        this.npcs.push(new QuestNPC(600, 150, "Tante Trine", "En mafia-skurk stjal katten min! Slå han i ballene! Belønning: Ballekick Level 2"));
        this.npcs.push(new QuestNPC(100, 500, "Onkel Ole", "Lær deg ultimate ballekick-teknikken! Belønning: Ballekick Level 3"));
        
        // Create mafia enemies
        this.enemies.push(new MafiaGoon(300, 400, "Lille Luigi", 50, 1));
        this.enemies.push(new MafiaGoon(500, 300, "Store Stein", 80, 2));
        this.enemies.push(new MafiaGoon(700, 500, "Slemme Sam", 100, 3));
        this.enemies.push(new MafiaGoon(250, 600, "Farlige Frank", 120, 4));
        
        // Create the ultimate boss
        this.sigmaBoss = new SigmaBananBoss(800, 300);
        this.enemies.push(this.sigmaBoss);
        
        // Initialize quests
        this.initializeQuests();
    }
    
    initializeQuests() {
        this.quests.push(new Quest("find_banana", "Finn Bamse Benny sin banan", false, () => this.player.strength += 5));
        this.quests.push(new Quest("save_cat", "Redde Tante Trine sin katt", false, () => this.player.ballKickLevel = 2));
        this.quests.push(new Quest("learn_ultimate", "Lær ultimate ballekick", false, () => this.player.ballKickLevel = 3));
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameState === 'loading') {
            this.updateLoading(deltaTime);
        } else if (this.gameState === 'playing') {
            this.update(deltaTime);
            this.render();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    updateLoading(deltaTime) {
        this.loadingTime += deltaTime;
        
        // Vis loading screen i 3 sekunder
        if (this.loadingTime > 3000) {
            this.gameState = 'playing';
            this.loadingScreen.style.display = 'none';
            this.ui.style.display = 'block';
            this.instructions.style.display = 'block';
        }
    }
    
    update(deltaTime) {
        this.handleInput();
        this.player.update(deltaTime);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            if (enemy.isAlive()) {
                enemy.update(deltaTime, this.player);
            }
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
        
        // Update camera
        this.updateCamera();
        
        // Update UI
        this.updateUI();
        
        // Check for interactions
        this.checkInteractions();
        
        // Random events
        this.updateRandomEvents(deltaTime);
    }
    
    handleInput() {
        const speed = 200;
        
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.y -= speed * 0.016;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.y += speed * 0.016;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.x -= speed * 0.016;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.x += speed * 0.016;
        }
        
        if (this.keys[' ']) {
            this.player.attack(this.enemies, this.soundSystem);
            this.keys[' '] = false; // Prevent spam
        }
        
        if (this.keys['k']) {
            this.player.ballKick(this.enemies, this.particles, this.soundSystem, this.funnyMessages);
            this.keys['k'] = false; // Prevent spam
        }
        
        if (this.keys['e']) {
            this.handleNPCInteraction();
            this.keys['e'] = false; // Prevent spam
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.world.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.world.height, this.player.y));
    }
    
    handleNPCInteraction() {
        this.npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - npc.x, 2) + 
                Math.pow(this.player.y - npc.y, 2)
            );
            
            if (distance < 60 && !npc.questGiven) {
                npc.giveQuest(this.player);
                this.createTextParticle(npc.x, npc.y - 30, "Quest Complete!", "#ffd700");
                this.soundSystem.playQuestComplete();
            }
        });
    }
    
    updateCamera() {
        // Follow player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        // Keep camera in bounds
        this.camera.x = Math.max(0, Math.min(this.world.width - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.world.height - this.canvas.height, this.camera.y));
    }
    
    updateUI() {
        document.getElementById('playerHP').textContent = this.player.hp;
        document.getElementById('playerStrength').textContent = this.player.strength;
        document.getElementById('ballKickLevel').textContent = this.player.ballKickLevel;
        document.getElementById('questCount').textContent = this.player.questsCompleted;
    }
    
    createTextParticle(x, y, text, color) {
        this.particles.push(new TextParticle(x, y, text, color));
    }
    
    checkInteractions() {
        // Check if player can fight Sigma Boss
        if (this.player.questsCompleted >= 3 && this.sigmaBoss.isAlive()) {
            const distance = Math.sqrt(
                Math.pow(this.player.x - this.sigmaBoss.x, 2) + 
                Math.pow(this.player.y - this.sigmaBoss.y, 2)
            );
            
            if (distance < 100 && !this.sigmaBoss.isAwake) {
                this.sigmaBoss.isAwake = true;
                this.soundSystem.playBossAwaken();
                this.createTextParticle(this.sigmaBoss.x, this.sigmaBoss.y - 100, "SIGMA BOSS AWAKENS! 👑", "#ff0000");
            }
        }
        
        // Check for victory
        if (!this.sigmaBoss.isAlive() && !this.gameWon) {
            this.gameWon = true;
            this.soundSystem.playVictory();
            this.createTextParticle(this.player.x, this.player.y - 50, "🎉 SIGMA VICTORY! 🎉", "#ffd700");
            // Create victory particles
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    this.particles.push(new VictoryParticle(
                        this.player.x + (Math.random() - 0.5) * 200,
                        this.player.y + (Math.random() - 0.5) * 200
                    ));
                }, i * 100);
            }
        }
    }
    
    updateRandomEvents(deltaTime) {
        this.randomEventTimer += deltaTime;
        
        // Random sigma quotes from boss when awake
        if (this.sigmaBoss.isAwake && this.randomEventTimer > 8000) {
            const randomQuote = this.sigmaQuotes[Math.floor(Math.random() * this.sigmaQuotes.length)];
            this.createTextParticle(this.sigmaBoss.x, this.sigmaBoss.y - 120, randomQuote, "#ff6600");
            this.randomEventTimer = 0;
        }
        
        // Random banana spawns (visual only)
        if (Math.random() < 0.0005 && this.particles.length < 50) {
            this.particles.push(new FloatingBanana(
                Math.random() * this.world.width,
                Math.random() * this.world.height
            ));
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw world background
        this.drawWorld();
        
        // Draw NPCs
        this.npcs.forEach(npc => npc.render(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            if (enemy.isAlive()) {
                enemy.render(this.ctx);
            }
        });
        
        // Draw player
        this.player.render(this.ctx);
        
        // Draw particles
        this.particles.forEach(particle => particle.render(this.ctx));
        
        this.ctx.restore();
        
        // Draw UI elements
        this.drawUI();
        
        // Draw victory screen
        if (this.gameWon) {
            this.drawVictoryScreen();
        }
    }
    
    drawWorld() {
        // Draw village background
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, 0, this.world.width, this.world.height);
        
        // Draw some buildings
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(50, 100, 100, 80);
        this.ctx.fillRect(500, 80, 120, 100);
        this.ctx.fillRect(700, 400, 150, 120);
        
        // Draw mafia headquarters (boss area)
        this.ctx.fillStyle = '#2F4F2F';
        this.ctx.fillRect(750, 250, 200, 150);
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '20px Courier';
        this.ctx.fillText('🏴‍☠️ MAFIA HQ 🏴‍☠️', 760, 280);
    }
    
    drawUI() {
        // Draw mini map
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(this.canvas.width - 160, 10, 150, 100);
        
        // Player dot on minimap
        const mapX = (this.player.x / this.world.width) * 150;
        const mapY = (this.player.y / this.world.height) * 100;
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.canvas.width - 160 + mapX, 10 + mapY, 3, 3);
        
        // Boss dot on minimap if awakened
        if (this.sigmaBoss.isAwake) {
            const bossMapX = (this.sigmaBoss.x / this.world.width) * 150;
            const bossMapY = (this.sigmaBoss.y / this.world.height) * 100;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(this.canvas.width - 160 + bossMapX, 10 + bossMapY, 5, 5);
        }
    }
    
    drawVictoryScreen() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Victory text
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px Courier';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎉 SIGMA VICTORY! 🎉', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Courier';
        this.ctx.fillText('Du slo Sigma Banan Boss!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.fillText('Ballekick Master! 🥋', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '20px Courier';
        this.ctx.fillText('🍌 SIGMA LEVEL: MAXIMUM 🍌', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Courier';
        this.ctx.fillText('Trykk F5 for å spille igjen!', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        // Reset text align
        this.ctx.textAlign = 'left';
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 100;
        this.maxHP = 100;
        this.strength = 10;
        this.ballKickLevel = 1;
        this.questsCompleted = 0;
        this.size = 20;
        this.attackCooldown = 0;
        this.kickCooldown = 0;
    }
    
    update(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        if (this.kickCooldown > 0) {
            this.kickCooldown -= deltaTime;
        }
    }
    
    attack(enemies, soundSystem) {
        if (this.attackCooldown > 0) return;
        
        let hitSomething = false;
        enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(this.x - enemy.x, 2) + 
                Math.pow(this.y - enemy.y, 2)
            );
            
            if (distance < 50 && enemy.isAlive()) {
                enemy.takeDamage(this.strength);
                this.attackCooldown = 500;
                hitSomething = true;
            }
        });
        
        if (hitSomething && soundSystem) {
            soundSystem.playPunch();
        }
    }
    
    ballKick(enemies, particles, soundSystem, funnyMessages) {
        if (this.kickCooldown > 0) return;
        
        let hitSomething = false;
        enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(this.x - enemy.x, 2) + 
                Math.pow(this.y - enemy.y, 2)
            );
            
            if (distance < 60 && enemy.isAlive()) {
                const damage = this.strength * this.ballKickLevel;
                enemy.takeBallDamage(damage);
                enemy.stun(2000); // 2 seconds stun
                
                // Create epic particle effect
                for (let i = 0; i < 10; i++) {
                    particles.push(new ExplosionParticle(enemy.x, enemy.y));
                }
                
                // Random funny message
                const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
                particles.push(new TextParticle(enemy.x, enemy.y - 30, randomMessage, "#ff0000"));
                
                this.kickCooldown = 1000;
                hitSomething = true;
            }
        });
        
        if (hitSomething && soundSystem) {
            soundSystem.playBallKick();
        }
    }
    
    render(ctx) {
        // Draw player as a cool character
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Draw face
        ctx.fillStyle = '#FFE4B5';
        ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 6, this.y - 4, 2, 2);
        ctx.fillRect(this.x + 4, this.y - 4, 2, 2);
        
        // Draw mouth
        ctx.fillRect(this.x - 3, this.y + 2, 6, 1);
        
        // Draw health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 15, this.y - 25, 30, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 15, this.y - 25, (this.hp / this.maxHP) * 30, 4);
    }
}

class MafiaGoon {
    constructor(x, y, name, hp, level) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.hp = hp;
        this.maxHP = hp;
        this.level = level;
        this.size = 18;
        this.isStunned = false;
        this.stunTime = 0;
        this.moveSpeed = 30;
        this.lastMove = 0;
        this.moveDirection = Math.random() * Math.PI * 2;
    }
    
    isAlive() {
        return this.hp > 0;
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }
    
    takeBallDamage(damage) {
        this.hp -= damage * 2; // Ball kicks do double damage!
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }
    
    stun(duration) {
        this.isStunned = true;
        this.stunTime = duration;
    }
    
    update(deltaTime, player) {
        if (this.stunTime > 0) {
            this.stunTime -= deltaTime;
            if (this.stunTime <= 0) {
                this.isStunned = false;
            }
        }
        
        if (!this.isStunned && this.isAlive()) {
            // Simple AI - move around randomly
            this.lastMove += deltaTime;
            if (this.lastMove > 2000) {
                this.moveDirection = Math.random() * Math.PI * 2;
                this.lastMove = 0;
            }
            
            this.x += Math.cos(this.moveDirection) * this.moveSpeed * (deltaTime / 1000);
            this.y += Math.sin(this.moveDirection) * this.moveSpeed * (deltaTime / 1000);
        }
    }
    
    render(ctx) {
        if (!this.isAlive()) return;
        
        // Draw mafia goon
        ctx.fillStyle = this.isStunned ? '#ffff00' : '#2F4F2F';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Draw face
        ctx.fillStyle = '#FFE4B5';
        ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        
        // Draw sunglasses (mafia style)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 8, this.y - 6, 16, 4);
        
        // Draw health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 15, this.y - 25, 30, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 15, this.y - 25, (this.hp / this.maxHP) * 30, 4);
        
        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = '10px Courier';
        ctx.fillText(this.name, this.x - 25, this.y - 30);
        
        // Draw stun stars if stunned
        if (this.isStunned) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '16px Courier';
            ctx.fillText('⭐', this.x - 20, this.y - 35);
            ctx.fillText('⭐', this.x + 10, this.y - 35);
        }
    }
}

class SigmaBananBoss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 500;
        this.maxHP = 500;
        this.size = 40;
        this.isAwake = false;
        this.isStunned = false;
        this.stunTime = 0;
        this.attackCooldown = 0;
        this.phase = 1;
        this.bananaRotation = 0;
    }
    
    isAlive() {
        return this.hp > 0;
    }
    
    takeDamage(damage) {
        if (!this.isAwake) return;
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }
    
    takeBallDamage(damage) {
        if (!this.isAwake) return;
        this.hp -= damage * 1.5; // Less vulnerable than normal enemies
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }
    
    stun(duration) {
        this.isStunned = true;
        this.stunTime = duration;
    }
    
    update(deltaTime, player) {
        this.bananaRotation += deltaTime * 0.002;
        
        if (this.stunTime > 0) {
            this.stunTime -= deltaTime;
            if (this.stunTime <= 0) {
                this.isStunned = false;
            }
        }
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        if (this.isAwake && this.isAlive() && !this.isStunned) {
            // Boss AI - attack player
            const distance = Math.sqrt(
                Math.pow(this.x - player.x, 2) + 
                Math.pow(this.y - player.y, 2)
            );
            
            if (distance < 100 && this.attackCooldown <= 0) {
                // Boss attack
                player.hp -= 20;
                this.attackCooldown = 2000;
            }
        }
    }
    
    render(ctx) {
        if (!this.isAlive()) {
            // Draw defeated boss
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.PI);
            ctx.fillStyle = '#8B4513';
            ctx.font = '40px Courier';
            ctx.fillText('🍌', -20, 20);
            ctx.restore();
            
            ctx.fillStyle = '#ff0000';
            ctx.font = '20px Courier';
            ctx.fillText('SIGMA BOSS DEFEATED!', this.x - 80, this.y - 60);
            return;
        }
        
        if (!this.isAwake) {
            // Draw sleeping boss
            ctx.fillStyle = '#8B4513';
            ctx.font = '40px Courier';
            ctx.fillText('😴🍌', this.x - 40, this.y + 10);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier';
            ctx.fillText('Sigma Banan Boss (Sleeping)', this.x - 60, this.y - 50);
            ctx.fillText('Complete 3 quests to wake him!', this.x - 70, this.y - 35);
            return;
        }
        
        // Draw awake boss
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.bananaRotation);
        
        // Draw sigma banana
        ctx.fillStyle = this.isStunned ? '#ffff00' : '#FFD700';
        ctx.font = '60px Courier';
        ctx.fillText('🍌', -30, 30);
        
        ctx.restore();
        
        // Draw boss effects
        ctx.fillStyle = '#ff0000';
        ctx.font = '20px Courier';
        ctx.fillText('👑 SIGMA BANAN BOSS 👑', this.x - 100, this.y - 60);
        
        // Draw health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 50, this.y - 80, 100, 8);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 50, this.y - 80, (this.hp / this.maxHP) * 100, 8);
        
        // Draw HP text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier';
        ctx.fillText(`${this.hp}/${this.maxHP}`, this.x - 20, this.y - 85);
        
        // Draw stun stars if stunned
        if (this.isStunned) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '20px Courier';
            ctx.fillText('⭐', this.x - 30, this.y - 90);
            ctx.fillText('⭐', this.x + 20, this.y - 90);
            ctx.fillText('⭐', this.x - 5, this.y - 100);
        }
    }
}

class QuestNPC {
    constructor(x, y, name, questText) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.questText = questText;
        this.questGiven = false;
        this.size = 16;
    }
    
    giveQuest(player) {
        if (this.questGiven) return;
        
        this.questGiven = true;
        player.questsCompleted++;
        
        // Apply quest rewards
        if (this.name === "Bamse Benny") {
            player.strength += 5;
        } else if (this.name === "Tante Trine") {
            player.ballKickLevel = 2;
        } else if (this.name === "Onkel Ole") {
            player.ballKickLevel = 3;
        }
    }
    
    render(ctx) {
        // Draw NPC
        ctx.fillStyle = this.questGiven ? '#90EE90' : '#FFA500';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Draw face
        ctx.fillStyle = '#FFE4B5';
        ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        
        // Draw quest indicator
        if (!this.questGiven) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '16px Courier';
            ctx.fillText('!', this.x - 4, this.y - 20);
        } else {
            ctx.fillStyle = '#00ff00';
            ctx.font = '16px Courier';
            ctx.fillText('✓', this.x - 4, this.y - 20);
        }
        
        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = '10px Courier';
        ctx.fillText(this.name, this.x - 25, this.y - 25);
    }
}

class Quest {
    constructor(id, description, completed, reward) {
        this.id = id;
        this.description = description;
        this.completed = completed;
        this.reward = reward;
    }
}

class TextParticle {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 2000;
        this.maxLife = 2000;
        this.velY = -50;
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        this.y += this.velY * (deltaTime / 1000);
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.font = '14px Courier';
        ctx.fillText(this.text, this.x - 30, this.y);
        ctx.globalAlpha = 1;
    }
}

class ExplosionParticle {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 40;
        this.y = y + (Math.random() - 0.5) * 40;
        this.velX = (Math.random() - 0.5) * 100;
        this.velY = (Math.random() - 0.5) * 100;
        this.life = 1000;
        this.maxLife = 1000;
        this.size = Math.random() * 4 + 2;
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.velX * (deltaTime / 1000);
        this.y += this.velY * (deltaTime / 1000);
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, ${Math.floor(255 * alpha)}, 0, ${alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class VictoryParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = (Math.random() - 0.5) * 150;
        this.velY = -Math.random() * 100 - 50;
        this.life = 3000;
        this.maxLife = 3000;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.emoji = ['🎉', '🎊', '🏆', '👑', '🍌', '⭐'][Math.floor(Math.random() * 6)];
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.velX * (deltaTime / 1000);
        this.y += this.velY * (deltaTime / 1000);
        this.velY += 50 * (deltaTime / 1000); // gravity
        this.rotation += this.rotationSpeed;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        ctx.font = '24px Courier';
        ctx.fillText(this.emoji, -12, 12);
        ctx.restore();
    }
}

class FloatingBanana {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = (Math.random() - 0.5) * 30;
        this.velY = (Math.random() - 0.5) * 30;
        this.life = 5000;
        this.maxLife = 5000;
        this.rotation = 0;
        this.rotationSpeed = 0.002;
        this.size = Math.random() * 10 + 15;
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.velX * (deltaTime / 1000);
        this.y += this.velY * (deltaTime / 1000);
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Float in sine wave
        this.y += Math.sin(this.rotation) * 0.5;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha * 0.7;
        ctx.font = `${this.size}px Courier`;
        ctx.fillText('🍌', -this.size/2, this.size/2);
        ctx.restore();
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});