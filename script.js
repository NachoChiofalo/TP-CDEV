// Variables globales
let camera, scene, renderer, controls;
let objects = [];
let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let isRunning = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();
let moveSpeed = 45.0;
let loader = new THREE.GLTFLoader();
let paintingFrames = [];
let modelsLoaded = 0;
let totalModels = 8; // 6 pinturas + 2 tipos de muebles

// Pinturas del museo con sus descripciones
const paintings = [
    {
        title: "La Noche Estrellada",
        artist: "Vincent van Gogh, 1889",
        description: "Una de las obras más conocidas de Van Gogh, representa la vista desde la ventana de su habitación en el sanatorio de Saint-Rémy-de-Provence, justo antes del amanecer. La obra muestra el pueblo con un ciprés gigante y un cielo nocturno lleno de remolinos. Van Gogh pintó esta obra durante su estancia en un manicomio, donde se recluyó voluntariamente.",
        position: { x: -9.8, y: 2, z: -10 },
        rotation: 90 * Math.PI / 180,
        size: { width: 4, height: 3 },
        modelUrl: 'https://threejs.org/examples/models/gltf/Parrot.glb' // URL de ejemplo
    },
    {
        title: "El Grito",
        artist: "Edvard Munch, 1893",
        description: "Esta obra es una representación del pánico y la angustia existencial. La figura andrógina en primer plano simboliza al hombre moderno en un momento de profunda crisis. El cielo ondulante en tonos rojos y naranjas refleja la turbación interior del personaje. Munch creó cuatro versions de esta obra, que se ha convertido en un icono cultural universal.",
        position: { x: 9.8, y: 2, z: -8 },
        rotation: 90 * Math.PI / 180,
        size: { width: 3.5, height: 2.8 },
        modelUrl: 'https://threejs.org/examples/models/gltf/Flamingo.glb' // URL de ejemplo
    },
    {
        title: "La Gioconda",
        artist: "Leonardo da Vinci, 1503",
        description: "También conocida como Mona Lisa, es una de las obras más famosas del mundo. Su enigmática sonrisa ha sido objeto de debate durante siglos. Leonardo utilizó la técnica del sfumato, creando transiciones suaves entre colores y tonos. La pintura fue robada del Louvre en 1911 y recuperada dos años después, lo que aumentó su fama mundial.",
        position: { x: -9.8, y: 2, z: 0 },
        rotation: 90 * Math.PI / 180,
        size: { width: 3, height: 4 },
        modelUrl: 'https://threejs.org/examples/models/gltf/Parrot.glb' // URL de ejemplo
    },
    {
        title: "Las Meninas",
        artist: "Diego Velázquez, 1656",
        description: "Esta compleja composición representa a la infanta Margarita Teresa rodeada de sus sirvientes, mientras los reyes se reflejan en un espejo al fondo. Velázquez se incluyó a sí mismo pintando un gran lienzo. La obra es famosa por su juego de perspectivas y por cuestionar la relación entre el espectador, el pintor y los sujetos retratados.",
        position: { x: 9.8, y: 2, z: 2 },
        rotation: 90 * Math.PI / 180,
        size: { width: 3.2, height: 4.2 },
        modelUrl: 'https://threejs.org/examples/models/gltf/Flamingo.glb' // URL de ejemplo
    },
    {
        title: "Guernica",
        artist: "Pablo Picasso, 1937",
        description: "Representa el bombardeo de Guernica durante la Guerra Civil Española. Es un poderoso alegato contra la guerra y un icono del siglo XX. La obra, pintada en blanco, negro y tonos grises, muestra figuras distorsionadas de personas y animales en sufrimiento. Fue encargada por el gobierno republicano para el pabellón español en la Exposición Internacional de París.",
        position: { x: -9.8, y: 2, z: 10 },
        rotation: 90 * Math.PI / 180,
        size: { width: 5, height: 2.5 },
        modelUrl: 'https://threejs.org/examples/models/gltf/Parrot.glb' // URL de ejemplo
    },
    {
        title: "La joven de la perla",
        artist: "Johannes Vermeer, 1665",
        description: "Conocida como 'la Mona Lisa del Norte', este tronie representa a una joven con un turbante y un pendiente de perla. La obra destaca por el contraste entre el fondo oscuro y la figura iluminada, y por la mirada directa de la joven hacia el espectador. Vermeer utilizó la técnica del punto claro para los reflejos en los labios y la perla.",
        position: { x: 9.8, y: 2, z: 12 },
        rotation: 45 * Math.PI / 180,
        size: { width: 2.5, height: 3.2 },
        modelUrl: 'D:\\UTN\\Creatividad\\MuseoVirtual\\models\\the_tiger_hunt_painting_photogrammetry.glb' // URL de ejemplo
    }
];

// Iniciar la experiencia cuando se haga clic en el botón
document.getElementById('startButton').addEventListener('click', function() {
    init();
});

// Control de velocidad
document.getElementById('speedSlider').addEventListener('input', function() {
    moveSpeed = parseFloat(this.value);
});

function init() {
    // Configurar escena, cámara y renderizador
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 15, 35);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1.6;
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('container').appendChild(renderer.domElement);

    // Configurar controles de pointer lock
    controls = new THREE.PointerLockControls(camera, document.body);

    // Event listeners para movimiento
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('click', onCanvasClick, false);
    
    // Raycaster para detectar clics en objetos
    raycaster = new THREE.Raycaster();

    // Crear la estructura básica del museo
    createMuseumStructure();

    // Añadir iluminación mejorada
    setupLighting();

    // Instrucciones para bloquear el puntero
    const instructions = document.getElementById('instructions');
    instructions.addEventListener('click', function() {
        controls.lock();
    }, false);

    controls.addEventListener('lock', function() {
        instructions.style.display = 'none';
        document.getElementById('speedControl').style.display = 'none';
    });

    controls.addEventListener('unlock', function() {
        instructions.style.display = 'block';
        document.getElementById('speedControl').style.display = 'block';
    });

    // Configurar panel de información
    document.getElementById('closeButton').addEventListener('click', function() {
        document.getElementById('infoPanel').style.display = 'none';
        controls.lock();
    });

    // Ajustar en resize de ventana
    window.addEventListener('resize', onWindowResize, false);

    // Cargar modelos 3D
    loadModels();
}

function createMuseumStructure() {
    // Crear suelo con textura de mármol
    const floorGeometry = new THREE.PlaneGeometry(50, 50, 20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x808080,
        roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Detalles del suelo
    const floorLineGeometry = new THREE.BoxGeometry(0.1, 0.1, 50);
    const floorLineMaterial = new THREE.MeshLambertMaterial({ color: 0x5a4c3e });
    
    for (let x = -9.5; x <= 9.5; x += 9.5) {
        const floorLine = new THREE.Mesh(floorLineGeometry, floorLineMaterial);
        floorLine.position.set(x, 0.01, 0);
        floorLine.receiveShadow = true;
        scene.add(floorLine);
    }

    // Crear paredes con textura mejorada
    const wallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xf0f0f0,
        roughness: 0.7,
    });
    
    // Pared izquierda
    const leftWallGeometry = new THREE.BoxGeometry(0.5, 8, 50);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-10, 4, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    scene.add(leftWall);

    // Pared derecha
    const rightWallGeometry = new THREE.BoxGeometry(0.5, 8, 50);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(10, 4, 0);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    scene.add(rightWall);

    // Pared trasera
    const backWallGeometry = new THREE.BoxGeometry(20, 8, 0.5);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 4, -25);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    scene.add(backWall);

    // Pared frontal (con abertura)
    const frontWallGeometry = new THREE.BoxGeometry(20, 8, 0.5);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 4, 25);
    frontWall.receiveShadow = true;
    frontWall.castShadow = true;
    scene.add(frontWall);

    // Techo con detalles
    const ceilingGeometry = new THREE.PlaneGeometry(20, 50);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xe0e0e0,
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, 8, 0);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Añadir molduras al techo
    const moldingGeometry = new THREE.BoxGeometry(20.5, 0.2, 0.2);
    const moldingMaterial = new THREE.MeshLambertMaterial({ color: 0x8a7860 });
    
    for (let z = -25; z <= 25; z += 50) {
        const molding = new THREE.Mesh(moldingGeometry, moldingMaterial);
        molding.position.set(0, 8, z);
        scene.add(molding);
    }
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    // Luces direccionales mejoradas
    const directionalLight1 = new THREE.DirectionalLight(0xfffaf0, 0.8);
    directionalLight1.position.set(-5, 8, -15);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    directionalLight1.shadow.camera.near = 0.5;
    directionalLight1.shadow.camera.far = 40;
    directionalLight1.shadow.camera.left = -20;
    directionalLight1.shadow.camera.right = 20;
    directionalLight1.shadow.camera.top = 20;
    directionalLight1.shadow.camera.bottom = -20;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xadd8e6, 0.5);
    directionalLight2.position.set(5, 6, 0);
    directionalLight2.castShadow = true;
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffd700, 0.4);
    directionalLight3.position.set(0, 5, 15);
    directionalLight3.castShadow = true;
    scene.add(directionalLight3);

    // Luces puntuales para las pinturas
    for (let i = 0; i < paintings.length; i++) {
        const painting = paintings[i];
        const light = new THREE.SpotLight(0xffd700, 1.5, 8, Math.PI / 6, 0.5);
        light.position.set(
            painting.position.x * 1.1, 
            painting.position.y + 1, 
            painting.position.z
        );
        light.target.position.set(painting.position.x, painting.position.y, painting.position.z);
        light.castShadow = true;
        scene.add(light);
        scene.add(light.target);
    }
}

function loadModels() {
    // En una implementación real, aquí cargaríamos modelos GLB/GLTF de Sketchfab
    // Por ahora, crearemos marcos de pintura y muebles con geometrías de Three.js
    
    // Crear marcos de pintura realistas
    for (let i = 0; i < paintings.length; i++) {
        const paintingData = paintings[i];
        
        // Marco exterior
        const frameGeometry = new THREE.BoxGeometry(paintingData.size.width + 0.4, paintingData.size.height + 0.4, 0.3);
        const frameMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.2
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        
        // Pintura
        const paintingGeometry = new THREE.PlaneGeometry(paintingData.size.width - 0.2, paintingData.size.height - 0.2);
        const paintingMaterial = new THREE.MeshLambertMaterial({ 
            color: getPaintingColor(i),
            roughness: 0.7
        });
        const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
        
        // Vidrio sobre la pintura
        const glassGeometry = new THREE.PlaneGeometry(paintingData.size.width - 0.1, paintingData.size.height - 0.1);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.9,
            roughness: 0.1,
            thickness: 0.1,
            transparent: true,
            opacity: 0.2
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        
        painting.position.set(0, 0, 0.11);
        glass.position.set(0, 0, 0.15);
        
        frame.add(painting);
        frame.add(glass);
        frame.position.set(paintingData.position.x, paintingData.position.y, paintingData.position.z);
        frame.rotation.y = paintingData.rotation;
        frame.userData = { 
            type: 'painting',
            title: paintingData.title,
            artist: paintingData.artist,
            description: paintingData.description
        };
        
        scene.add(frame);
        objects.push(frame);
        paintingFrames.push(frame);
        
        updateProgress();
    }
    
    // Crear bancas realistas
    for (let z = -20; z <= 20; z += 10) {
        createBench(0, 0.9, z);
        updateProgress();
    }
    
    // Una vez cargados todos los modelos, iniciar la experiencia
    setTimeout(() => {
        document.getElementById('startScreen').style.display = 'none';
        animate();
        controls.lock();
    }, 1000);
}

function createBench(x, y, z) {
    // Asiento de la banca
    const benchSeatGeometry = new THREE.BoxGeometry(6, 0.2, 1.5);
    const benchSeatMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xa0522d,
        roughness: 0.9
    });
    const benchSeat = new THREE.Mesh(benchSeatGeometry, benchSeatMaterial);
    benchSeat.position.set(x, y, z);
    benchSeat.castShadow = true;
    benchSeat.receiveShadow = true;
    scene.add(benchSeat);
    
    // Respaldo de la banca
    const benchBackGeometry = new THREE.BoxGeometry(6, 1.5, 0.2);
    const benchBackMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        roughness: 0.9
    });
    const benchBack = new THREE.Mesh(benchBackGeometry, benchBackMaterial);
    benchBack.position.set(x, y + 0.65, z - 0.75);
    benchBack.castShadow = true;
    benchBack.receiveShadow = true;
    scene.add(benchBack);
    
    // Patas de la banca
    const legGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const legMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        roughness: 0.9
    });
    
    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(x - 2.75, y - 0.4, z - 0.5);
    leg1.castShadow = true;
    scene.add(leg1);
    
    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(x + 2.75, y - 0.4, z - 0.5);
    leg2.castShadow = true;
    scene.add(leg2);
    
    const leg3 = new THREE.Mesh(legGeometry, legMaterial);
    leg3.position.set(x - 2.75, y - 0.4, z + 0.5);
    leg3.castShadow = true;
    scene.add(leg3);
    
    const leg4 = new THREE.Mesh(legGeometry, legMaterial);
    leg4.position.set(x + 2.75, y - 0.4, z + 0.5);
    leg4.castShadow = true;
    scene.add(leg4);
    
    // Soporte lateral
    const supportGeometry = new THREE.BoxGeometry(0.2, 0.5, 1.4);
    const support1 = new THREE.Mesh(supportGeometry, legMaterial);
    support1.position.set(x - 2.9, y - 0.15, z);
    support1.castShadow = true;
    scene.add(support1);
    
    const support2 = new THREE.Mesh(supportGeometry, legMaterial);
    support2.position.set(x + 2.9, y - 0.15, z);
    support2.castShadow = true;
    scene.add(support2);
}

function getPaintingColor(index) {
    const colors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe67e22];
    return colors[index];
}

function updateProgress() {
    modelsLoaded++;
    const progress = (modelsLoaded / totalModels) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            isRunning = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            isRunning = false;
            break;
    }
}

function onCanvasClick() {
    if (controls.isLocked) {
        // Lanzar rayo desde la cámara en la dirección del cursor
        raycaster.setFromCamera(new THREE.Vector2(), camera);
        const intersects = raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            if (object.userData.type === 'painting') {
                // Mostrar información de la pintura
                showPaintingInfo(object.userData);
            }
        }
    }
}

function showPaintingInfo(data) {
    const infoPanel = document.getElementById('infoPanel');
    document.getElementById('paintingTitle').textContent = data.title;
    document.getElementById('paintingArtist').textContent = data.artist;
    document.getElementById('paintingDescription').textContent = data.description;
    
    infoPanel.style.display = 'block';
    controls.unlock();
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;
        
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        
        // Ajustar velocidad según si está corriendo o no
        const currentSpeed = isRunning ? moveSpeed * 1.8 : moveSpeed;
        
        if (moveForward || moveBackward) velocity.z -= direction.z * currentSpeed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * currentSpeed * delta;
        
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        // Limitar el movimiento dentro del museo
        const cameraPosition = controls.getObject().position;
        cameraPosition.x = Math.max(-9, Math.min(9, cameraPosition.x));
        cameraPosition.z = Math.max(-24, Math.min(24, cameraPosition.z));
        
        prevTime = time;
    }
    
    renderer.render(scene, camera);
}