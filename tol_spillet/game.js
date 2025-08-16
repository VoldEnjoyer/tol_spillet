// Sigma Banan Mafia Quest - 3D Edition
// The ultimate first-person sigma experience

class SigmaBananMafiaGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.player = {
            hp: 100,
            maxHP: 100,
            strength: 10,
            xp: 0,
            ballKickLevel: 1,
            position: { x: 0, y: 2, z: 5 }
        };
        this.quests = [];
        this.npcs = [];
        this.buildings = [];
        this.gameObjects = [];
        this.isGameStarted = false;
        this.currentQuest = null;
        this.questCount = 0;
        this.bossDefeated = false;
        this.interactionRange = 5;
        
        // Input handling
        this.keys = {};
        this.mousePressed = false;
        
        // Game state
        this.clock = new THREE.Clock();
        
        // Audio system
        this.audioContext = null;
        this.audioInitialized = false;
        
        this.init();
    }

    // Audio system for epic sound effects
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioInitialized = true;
            console.log("🔊 Audio system initialized!");
        } catch (e) {
            console.log("Audio not supported, continuing without sound");
        }
    }

    playKickSound() {
        if (!this.audioInitialized) return;
        
        // Create epic kick sound using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Kick sound: Low frequency punch
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playHitSound() {
        if (!this.audioInitialized) return;
        
        // Enemy hit sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    playVictorySound() {
        if (!this.audioInitialized) return;
        
        // Epic victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }, index * 200);
        });
    }

    playLevelUpSound() {
        if (!this.audioInitialized) return;
        
        // Level up sound - ascending notes
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3);
        
        oscillator2.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.1);
        oscillator2.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.3);
        oscillator2.start(this.audioContext.currentTime + 0.1);
        oscillator2.stop(this.audioContext.currentTime + 0.4);
    }

    init() {
        // Initialize audio on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioInitialized) {
                this.initAudio();
            }
        }, { once: true });

        // Hide loading screen after a delay for dramatic effect
        setTimeout(() => {
            this.hideLoadingScreen();
            this.startGame();
        }, 3000);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.getElementById('ui').style.display = 'block';
            document.getElementById('questLog').style.display = 'block';
            document.getElementById('instructions').style.display = 'block';
            document.getElementById('crosshair').style.display = 'block';
        }, 500);
    }

    startGame() {
        this.setupScene();
        this.createEnvironment();
        this.createNPCs();
        this.setupControls();
        this.setupEventListeners();
        this.initQuests();
        this.animate();
        this.isGameStarted = true;
        console.log("🍌 SIGMA BANAN MAFIA QUEST STARTED! 🍌");
    }

    setupScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

        // Camera setup (first person)
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(this.player.position.x, this.player.position.y, this.player.position.z);

        // Renderer setup
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(1000, 700);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Sunset lighting for atmosphere
        const sunsetLight = new THREE.DirectionalLight(0xff6b35, 0.4);
        sunsetLight.position.set(-30, 20, -30);
        this.scene.add(sunsetLight);
    }

    createEnvironment() {
        // Ground with grass texture
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4a5d23,
            transparent: true
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create village buildings
        this.createBuildings();
        
        // Add some atmosphere with trees and decorations
        this.createTrees();
        this.createProps();
    }

    createBuildings() {
        // Don Luigi's House (Quest Giver)
        const house1 = this.createHouse(-20, 0, -10, 0xff6b35, "Don Luigi's House");
        this.buildings.push(house1);

        // Mafia Member Houses
        const house2 = this.createHouse(20, 0, -10, 0x8b4513, "Vinny's Hideout");
        this.buildings.push(house2);

        const house3 = this.createHouse(-20, 0, 20, 0x654321, "Tony's Place");
        this.buildings.push(house3);

        const house4 = this.createHouse(20, 0, 20, 0x2f4f4f, "Marco's Den");
        this.buildings.push(house4);

        // Boss Tower (Center, Impressive)
        const bossTower = this.createBossTower(0, 0, -40);
        this.buildings.push(bossTower);
    }

    createHouse(x, y, z, color, name) {
        const house = new THREE.Group();
        house.userData = { name: name, x: x, z: z };

        // Main house structure
        const houseGeometry = new THREE.BoxGeometry(8, 6, 8);
        const houseMaterial = new THREE.MeshLambertMaterial({ color: color });
        const houseBody = new THREE.Mesh(houseGeometry, houseMaterial);
        houseBody.position.set(x, y + 3, z);
        houseBody.castShadow = true;
        houseBody.receiveShadow = true;
        house.add(houseBody);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(6, 4, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(x, y + 8, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        house.add(roof);

        // Door
        const doorGeometry = new THREE.BoxGeometry(1.5, 3, 0.2);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(x, y + 1.5, z + 4.1);
        house.add(door);

        // Windows
        const windowGeometry = new THREE.BoxGeometry(1, 1, 0.1);
        const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(x - 2, y + 4, z + 4.05);
        house.add(window1);

        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(x + 2, y + 4, z + 4.05);
        house.add(window2);

        this.scene.add(house);
        return house;
    }

    createBossTower(x, y, z) {
        const tower = new THREE.Group();
        tower.userData = { name: "Sigma Banan Boss Tower", x: x, z: z, isBoss: true };

        // Main tower (taller and more imposing)
        const towerGeometry = new THREE.BoxGeometry(12, 20, 12);
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x2f2f2f });
        const towerBody = new THREE.Mesh(towerGeometry, towerMaterial);
        towerBody.position.set(x, y + 10, z);
        towerBody.castShadow = true;
        towerBody.receiveShadow = true;
        tower.add(towerBody);

        // Golden top (banana themed)
        const topGeometry = new THREE.CylinderGeometry(3, 6, 6, 8);
        const topMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(x, y + 23, z);
        tower.add(top);

        // Banana symbol on top
        const bananaGeometry = new THREE.SphereGeometry(1, 8, 6);
        const bananaMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        const bananaSymbol = new THREE.Mesh(bananaGeometry, bananaMaterial);
        bananaSymbol.position.set(x, y + 26, z);
        bananaSymbol.scale.set(1, 2, 0.7);
        tower.add(bananaSymbol);

        // Entrance
        const entranceGeometry = new THREE.BoxGeometry(3, 6, 0.5);
        const entranceMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 });
        const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
        entrance.position.set(x, y + 3, z + 6.2);
        tower.add(entrance);

        this.scene.add(tower);
        return tower;
    }

    createTrees() {
        for (let i = 0; i < 20; i++) {
            const tree = new THREE.Group();
            
            // Tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 6);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 3;
            tree.add(trunk);

            // Tree leaves
            const leavesGeometry = new THREE.SphereGeometry(3, 8, 6);
            const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 7;
            tree.add(leaves);

            // Random position around the village
            const angle = (i / 20) * Math.PI * 2;
            const radius = 40 + Math.random() * 30;
            tree.position.x = Math.cos(angle) * radius;
            tree.position.z = Math.sin(angle) * radius;
            
            tree.castShadow = true;
            tree.receiveShadow = true;
            this.scene.add(tree);
        }
    }

    createProps() {
        // Barrels around the village
        for (let i = 0; i < 10; i++) {
            const barrelGeometry = new THREE.CylinderGeometry(1, 1, 2);
            const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
            const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
            
            barrel.position.x = (Math.random() - 0.5) * 80;
            barrel.position.y = 1;
            barrel.position.z = (Math.random() - 0.5) * 80;
            barrel.castShadow = true;
            this.scene.add(barrel);
        }

        // Lamp posts
        for (let i = 0; i < 6; i++) {
            const lampPost = this.createLampPost();
            const angle = (i / 6) * Math.PI * 2;
            lampPost.position.x = Math.cos(angle) * 25;
            lampPost.position.z = Math.sin(angle) * 25;
            this.scene.add(lampPost);
        }
    }

    createLampPost() {
        const lampPost = new THREE.Group();
        
        // Post
        const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x2f2f2f });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 4;
        lampPost.add(post);

        // Light
        const lightGeometry = new THREE.SphereGeometry(0.5);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff88 });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 8;
        lampPost.add(light);

        // Point light
        const pointLight = new THREE.PointLight(0xffff88, 0.5, 20);
        pointLight.position.y = 8;
        lampPost.add(pointLight);

        return lampPost;
    }

    createNPCs() {
        // Don Luigi (Quest Giver)
        const donLuigi = this.createNPC(-18, 2, -8, 0xff0000, "Don Luigi", "questGiver");
        donLuigi.userData.dialogue = [
            "Ay, welcome to my village, sigma friend!",
            "I need your help with something... my bed sheets are dirty!",
            "Clean them for me and I'll teach you the way of the sigma!"
        ];
        this.npcs.push(donLuigi);

        // Mafia Members (Enemies)
        const vinny = this.createNPC(22, 2, -8, 0x800080, "Vinny 'The Nut'", "enemy");
        vinny.userData.hp = 30;
        vinny.userData.isAggressive = false;
        this.npcs.push(vinny);

        const tony = this.createNPC(-18, 2, 22, 0x006400, "Tony 'Two-Toes'", "enemy");
        tony.userData.hp = 40;
        tony.userData.isAggressive = false;
        this.npcs.push(tony);

        const marco = this.createNPC(22, 2, 22, 0x8b0000, "Marco 'The Meatball'", "enemy");
        marco.userData.hp = 50;
        marco.userData.isAggressive = false;
        this.npcs.push(marco);

        // The Ultimate Boss - Sigma Banan!
        const sigmaBoss = this.createBoss(0, 2, -38);
        this.npcs.push(sigmaBoss);
    }

    createNPC(x, y, z, color, name, type) {
        const npc = new THREE.Group();
        npc.userData = { name: name, type: type, x: x, z: z, hp: 100, maxHP: 100 };

        // Body
        const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(x, y + 1, z);
        npc.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.4);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(x, y + 2.5, z);
        npc.add(head);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(x - 0.15, y + 2.6, z + 0.35);
        npc.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(x + 0.15, y + 2.6, z + 0.35);
        npc.add(rightEye);

        npc.position.y = 0;
        npc.castShadow = true;
        this.scene.add(npc);
        
        return npc;
    }

    createBoss(x, y, z) {
        const boss = new THREE.Group();
        boss.userData = { 
            name: "Sigma Banan Boss", 
            type: "boss", 
            x: x, 
            z: z, 
            hp: 200, 
            maxHP: 200,
            isAggressive: false
        };

        // Boss is HUGE and banana-themed
        const bodyGeometry = new THREE.CylinderGeometry(1, 1.5, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(x, y + 2, z);
        boss.add(body);

        // Boss head (banana shaped)
        const headGeometry = new THREE.SphereGeometry(1, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(x, y + 5, z);
        head.scale.set(1, 1.5, 0.8);
        boss.add(head);

        // Crown (because he's the boss)
        const crownGeometry = new THREE.CylinderGeometry(1.2, 1, 0.5);
        const crownMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(x, y + 6.5, z);
        boss.add(crown);

        // Menacing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.2);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(x - 0.4, y + 5.2, z + 0.6);
        boss.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(x + 0.4, y + 5.2, z + 0.6);
        boss.add(rightEye);

        // Boss floats and rotates menacingly
        boss.userData.originalY = y + 2;
        boss.userData.floatTime = 0;

        boss.scale.set(2, 2, 2); // Make boss twice as big
        boss.castShadow = true;
        this.scene.add(boss);
        
        return boss;
    }

    setupControls() {
        // Pointer Lock Controls for first-person movement
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        
        // Lock pointer when clicking on canvas
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('click', () => {
            if (this.isGameStarted) {
                this.controls.lock();
            }
        });
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            if (event.code === 'Escape') {
                this.controls.unlock();
            }
            
            if (event.code === 'KeyE') {
                this.handleInteraction();
            }
            
            if (event.code === 'Space') {
                event.preventDefault();
                this.performBallKick();
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });

        // Mouse events
        document.addEventListener('mousedown', () => {
            this.mousePressed = true;
        });

        document.addEventListener('mouseup', () => {
            this.mousePressed = false;
        });
    }

    handleMovement() {
        if (!this.controls.isLocked) return;

        const direction = new THREE.Vector3();
        const speed = this.keys['ShiftLeft'] ? 0.3 : 0.1;

        if (this.keys['KeyW']) direction.z -= 1;
        if (this.keys['KeyS']) direction.z += 1;
        if (this.keys['KeyA']) direction.x -= 1;
        if (this.keys['KeyD']) direction.x += 1;

        direction.normalize();
        direction.multiplyScalar(speed);

        // Apply camera rotation to movement direction
        direction.applyQuaternion(this.camera.quaternion);
        direction.y = 0; // Keep movement horizontal

        // Update camera position
        this.camera.position.add(direction);
        
        // Keep camera above ground
        if (this.camera.position.y < 2) {
            this.camera.position.y = 2;
        }

        // Update player position
        this.player.position.x = this.camera.position.x;
        this.player.position.z = this.camera.position.z;
    }

    handleInteraction() {
        const nearbyNPC = this.findNearbyNPC();
        if (nearbyNPC) {
            this.interactWithNPC(nearbyNPC);
        }
    }

    findNearbyNPC() {
        const playerPos = this.camera.position;
        
        for (let npc of this.npcs) {
            const npcPos = new THREE.Vector3(npc.userData.x, 0, npc.userData.z);
            const distance = playerPos.distanceTo(npcPos);
            
            if (distance < this.interactionRange) {
                return npc;
            }
        }
        return null;
    }

    interactWithNPC(npc) {
        const npcData = npc.userData;
        
        if (npcData.type === 'questGiver') {
            this.handleQuestGiver(npc);
        } else if (npcData.type === 'enemy') {
            this.startCombat(npc);
        } else if (npcData.type === 'boss') {
            this.handleBossInteraction(npc);
        }
    }

    handleQuestGiver(npc) {
        if (this.questCount === 0) {
            this.startQuest({
                id: 1,
                name: "Clean the Sheets",
                description: "Finn lakenene i Don Luigi's hus og gjør dem rene!",
                target: "bed_sheets",
                reward: { xp: 50, strength: 5 },
                giver: npc
            });
        } else if (this.questCount === 1) {
            alert("Excellent work! Now you're ready for bigger challenges. Go defeat some mafia members!");
        } else {
            alert("You've proven yourself, sigma! Now face the ultimate test - the Banan Boss!");
        }
    }

    startQuest(quest) {
        this.currentQuest = quest;
        this.questCount++;
        document.getElementById('currentQuest').innerHTML = quest.description;
        document.getElementById('questCount').innerHTML = this.questCount;
        
        // Add bed sheets to the quest giver's house for the first quest
        if (quest.id === 1) {
            this.addBedSheets();
        }
        
        alert(`New Quest: ${quest.name}\n${quest.description}`);
    }

    addBedSheets() {
        // Add interactable bed sheets inside Don Luigi's house
        const sheetsGeometry = new THREE.BoxGeometry(2, 0.1, 3);
        const sheetsMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const sheets = new THREE.Mesh(sheetsGeometry, sheetsMaterial);
        sheets.position.set(-20, 1, -10);
        sheets.userData = { type: 'bed_sheets', interactable: true };
        this.scene.add(sheets);
        this.gameObjects.push(sheets);
    }

    performBallKick() {
        const nearbyEnemy = this.findNearbyEnemy();
        if (nearbyEnemy) {
            this.ballKickAttack(nearbyEnemy);
        }
    }

    findNearbyEnemy() {
        const playerPos = this.camera.position;
        
        for (let npc of this.npcs) {
            if (npc.userData.type === 'enemy' || npc.userData.type === 'boss') {
                const npcPos = new THREE.Vector3(npc.userData.x, 0, npc.userData.z);
                const distance = playerPos.distanceTo(npcPos);
                
                if (distance < this.interactionRange && npc.userData.hp > 0) {
                    return npc;
                }
            }
        }
        return null;
    }

    ballKickAttack(enemy) {
        const damage = this.player.strength + (this.player.ballKickLevel * 5) + Math.random() * 10;
        enemy.userData.hp -= damage;
        
        // Play epic sound effects
        this.playKickSound();
        setTimeout(() => this.playHitSound(), 100);
        
        // Visual effect - make enemy flash red and stagger
        const originalMaterial = enemy.children[0].material.color.clone();
        enemy.children[0].material.color.setHex(0xff0000);
        
        setTimeout(() => {
            if (enemy.children[0] && enemy.children[0].material) {
                enemy.children[0].material.color.copy(originalMaterial);
            }
        }, 200);

        // Knockback effect
        const knockbackDirection = new THREE.Vector3(
            enemy.userData.x - this.camera.position.x,
            0,
            enemy.userData.z - this.camera.position.z
        ).normalize();
        
        enemy.position.add(knockbackDirection.multiplyScalar(2));
        
        console.log(`🦵 BALLEKICK! Dealt ${damage.toFixed(1)} damage to ${enemy.userData.name}!`);
        
        if (enemy.userData.hp <= 0) {
            this.defeatEnemy(enemy);
        }
        
        // Gain XP and level up ball kick
        this.player.xp += 10;
        if (this.player.xp >= this.player.ballKickLevel * 100) {
            this.levelUpBallKick();
        }
        
        this.updateUI();
    }

    defeatEnemy(enemy) {
        console.log(`💀 ${enemy.userData.name} has been defeated!`);
        
        // Play victory sound
        this.playVictorySound();
        
        if (enemy.userData.type === 'boss') {
            this.defeatBoss();
            return;
        }
        
        // Remove enemy from scene
        this.scene.remove(enemy);
        this.npcs = this.npcs.filter(npc => npc !== enemy);
        
        // Reward player
        this.player.xp += 100;
        this.player.strength += 10;
        
        alert(`🏆 Victory! You defeated ${enemy.userData.name}!\n+100 XP, +10 Strength`);
        this.updateUI();
    }

    defeatBoss() {
        this.bossDefeated = true;
        document.getElementById('gameOver').style.display = 'flex';
        
        // Epic victory sound sequence
        this.playVictorySound();
        setTimeout(() => this.playVictorySound(), 1000);
        
        console.log("🍌 SIGMA BANAN BOSS DEFEATED! ULTIMATE VICTORY! 🍌");
    }

    levelUpBallKick() {
        this.player.ballKickLevel++;
        this.playLevelUpSound();
        alert(`🦵 BALL KICK LEVEL UP! Level ${this.player.ballKickLevel}!\nYour kicks are now more powerful!`);
    }

    startCombat(enemy) {
        if (enemy.userData.hp > 0) {
            alert(`You encounter ${enemy.userData.name}! Use SPACEBAR to perform a ball kick attack!`);
            enemy.userData.isAggressive = true;
        }
    }

    handleBossInteraction(boss) {
        if (this.questCount >= 3) {
            alert("So... you think you can challenge me, the ultimate Sigma Banan? Let's see what you've got!");
            boss.userData.isAggressive = true;
        } else {
            alert("You're not strong enough yet! Complete more quests and defeat my minions first!");
        }
    }

    initQuests() {
        // Set initial quest state
        document.getElementById('currentQuest').innerHTML = "Snakk med Don Luigi for å få din første oppdrag!";
    }

    updateUI() {
        document.getElementById('playerHP').innerHTML = this.player.hp;
        document.getElementById('playerStrength').innerHTML = this.player.strength;
        document.getElementById('questCount').innerHTML = this.questCount;
        document.getElementById('ballKickLevel').innerHTML = this.player.ballKickLevel;
        document.getElementById('playerXP').innerHTML = this.player.xp;
    }

    animateNPCs() {
        const time = this.clock.getElapsedTime();
        
        for (let npc of this.npcs) {
            if (npc.userData.type === 'boss') {
                // Boss floating animation
                npc.userData.floatTime += 0.02;
                npc.position.y = npc.userData.originalY + Math.sin(npc.userData.floatTime) * 0.5;
                npc.rotation.y += 0.01;
            } else {
                // NPCs slightly bob and look around
                npc.position.y = Math.sin(time + npc.userData.x) * 0.1;
                npc.rotation.y = Math.sin(time * 0.5 + npc.userData.z) * 0.2;
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isGameStarted && !this.bossDefeated) {
            this.handleMovement();
            this.animateNPCs();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    const game = new SigmaBananMafiaGame();
});

console.log("🍌 SIGMA BANAN MAFIA QUEST - Loaded! 🍌");