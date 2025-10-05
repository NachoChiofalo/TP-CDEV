// Verificar que Three.js se haya cargado
if (typeof THREE === 'undefined') {
    console.error('Three.js no se cargó correctamente');
    alert('Error cargando Three.js. Verifica la ruta del archivo.');
} else {
    console.log('Three.js cargado correctamente, versión:', THREE.REVISION);
}

// ========================
// CONFIGURACIÓN INICIAL
// ========================
    
    

// Variables principales de la escena
let escena, camara, renderizador;
let reloj;
let objetosColision = [];
let cargadorTexturas;
let mixer; // Para animaciones

// Personas caminando
let personas = [];
// Puertas interactuables
let puertasInteractuables = [];


// Variables de control
let teclasPulsadas = {};
let velocidadMovimiento = 5.0;

// Variables de juego
let cuadroGanador = null;
let juegoTerminado = false;
let meshCuadros = [];

// Variables de rendimiento
let ultimoTiempo = 0;
let contadorFrames = 0;
let tiempoFPS = 0;
let debugPanel;

// Variables de cámara
let rotacionY = 0; // Horizontal (yaw)  
let rotacionX = 0; // Vertical (pitch)
let sensibilidadMouse = 0.002;

// Dimensiones de la sala única
const DIMENSIONES_SALA = {
    ancho: 60,
    alto: 5,
    profundo: 40
};

// ========================
// DEBUG PANEL - POSICIÓN EN TIEMPO REAL - ES PARA DEBUGGING (SACAR EN LA VERSION FINAL)
// ========================

class DebugPanel {
    constructor() {
        this.panel = this.crearPanel();
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
    }

    crearPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            color: #0f0;
            padding: 10px 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border-radius: 5px;
            z-index: 1000;
            min-width: 180px;
            border: 1px solid #d4af37;
            user-select: none;
        `;
        panel.innerHTML = `
            <div style="margin-bottom: 5px; font-weight: bold; color: #d4af37;">DEBUG INFO</div>
            <div>Pos X: 0.00</div>
            <div>Pos Y: 0.00</div>
            <div>Pos Z: 0.00</div>
            <div>Rot Y: 0.00°</div>
        `;
        document.body.appendChild(panel);
        return panel;
    }

    calcularFPS(tiempoTranscurrido) {
        this.frameCount++;
        const currentTime = performance.now();

        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        return this.fps;
    }

    actualizar(camara, tiempoTranscurrido) {
        const fps = this.calcularFPS(tiempoTranscurrido);
        const rotacionGrados = (camara.rotation.y * 180 / Math.PI).toFixed(1);

        this.panel.innerHTML = `
            <div style="margin-bottom: 5px; font-weight: bold; color: #d4af37;">DEBUG INFO</div>
            <div>Pos X: ${camara.position.x.toFixed(2)}</div>
            <div>Pos Y: ${camara.position.y.toFixed(2)}</div>
            <div>Pos Z: ${camara.position.z.toFixed(2)}</div>
            <div>Rot Y: ${rotacionGrados}°</div>
            <div style="margin-top: 5px; border-top: 1px solid #d4af37; padding-top: 5px;">
                FPS: ${fps}
            </div>
        `;
    }
}


// ========================
// INICIALIZACIÓN
// ========================

function inicializar() {
    console.log('Iniciando museo con sala única...');
    try {
        crearEscena();
        crearCamara();
        crearRenderizador();
    // Crear modelos 3D desde array de configuración
        crearModelos3DDesdeConfig();
        crearSalaUnica();
        crearIluminacion();

        // Inicializar cargador de texturas
        cargadorTexturas = new THREE.TextureLoader();

        crearObrasConTexturas();

        crearPersonasCaminando();

    // Inicializar música ambiental por habitación
        inicializarMusicaAmbiental();

        // Música default se inicia solo al presionar el botón de entrar

// PERSONAS CAMINANDO
function crearPersonasCaminando() {
    // Cargar el modelo GLTF de persona simple low poly
    posicionesPersonas = [
        [-1, 0, -2, -3.44],
        [2, 0, -1, -3],
        [-21, 0, 3, -2],
        [13, 0, 2, 0.4]
    ];


    const loader = new THREE.GLTFLoader();
    for (let i = 0; i < 4; i++) {
        loader.load(
            'assets/models/simple_low_poly_character/scene.gltf',
            function (gltf) {
                const person = gltf.scene.clone();
                const [x, y, z, rotY] = posicionesPersonas[i];
                person.position.set(x, y, z);
                person.scale.set(1.3, 1.7, 1.3); // Ajusta el tamaño si es necesario (1:1 para low poly) // Convertir a radianes
                person.rotation.y = rotY;
                console.log('Dirección:', person.userData.direccion);
                personas.push(person);
                escena.add(person);
            },
            undefined,
            function (error) {
                console.error('Error cargando modelo de persona:', error);
            }
        );
    }
}

        configurarControles();
        configurarEventos();

        reloj = new THREE.Clock();
        debugPanel = new DebugPanel();

        console.log('Museo con sala única inicializado');
        animar();
    } catch (error) {
        console.error('Error inicializando museo:', error);
    }
}

// ========================
// CREACIÓN DE LA ESCENA
// ========================
function crearEscena() {
    escena = new THREE.Scene();
    escena.background = new THREE.Color(0x2a2a2a);
    escena.fog = new THREE.Fog(0x2a2a2a, 1, 40);
}

function crearCamara() {
    camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camara.position.set(26, 3.0, 0); // Altura más cercana al techo
    camara.rotation.order = 'YXZ'; // Importante para evitar gimbal lock

}

function crearRenderizador() {
    console.log('Creando renderizador optimizado...');
    renderizador = new THREE.WebGLRenderer({
        canvas: document.querySelector("#miCanvas"),
        antialias: true
    });

    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderizador.shadowMap.enabled = false;
    renderizador.outputEncoding = THREE.sRGBEncoding;
}

// ========================
// CREACIÓN DE LA SALA ÚNICA
// ========================

function crearSalaUnica() {
    console.log('Construyendo sala única grande...');

    //Textura piso
    const texturaSuelo = new THREE.TextureLoader().load("assets/texturas/checkered_pavement_tiles_diff_1k.jpg");
    texturaSuelo.wrapS = THREE.RepeatWrapping;
    texturaSuelo.wrapT = THREE.RepeatWrapping;
    texturaSuelo.repeat.set(6, 6); // Ajusta el número de repeticiones según el tamaño del piso

    //Textura pared
    const texturaPared = new THREE.TextureLoader().load("assets/texturas/marble_01_diff_2k.jpg");
    texturaPared.wrapS = THREE.RepeatWrapping;
    texturaPared.wrapT = THREE.RepeatWrapping;
    texturaPared.repeat.set(2, 2);

    // Materiales
    const materialPared = new THREE.MeshLambertMaterial({ map: texturaPared, side: THREE.DoubleSide });
    const materialSuelo = new THREE.MeshLambertMaterial({ map: texturaSuelo });
    const materialTecho = new THREE.MeshLambertMaterial({ color: 0x574030 });

    // CUADRADO

    const { ancho, alto, profundo } = DIMENSIONES_SALA;

    // Suelo
    const suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, profundo),
        materialSuelo
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.set(0, 0.01, 0);
    escena.add(suelo);

    // Techo
    const techo = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, profundo),
        materialTecho
    );
    techo.rotation.x = Math.PI / 2;
    techo.position.set(0, alto - 0.01, 0);
    escena.add(techo);

    // Pared norte
    const paredNorte = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, alto),
        materialPared
    );
    paredNorte.position.set(0, alto / 2, -profundo / 2 + 0.01);
    escena.add(paredNorte);
    objetosColision.push({ tipo: 'pared', z: -profundo / 2 });

    // Pared sur
    const paredSur = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, alto),
        materialPared
    );
    paredSur.position.set(0, alto / 2, profundo / 2 - 0.01);
    paredSur.rotation.y = Math.PI;
    escena.add(paredSur);
    objetosColision.push({ tipo: 'pared', z: profundo / 2 });

    // Pared este
    const paredEste = new THREE.Mesh(
        new THREE.PlaneGeometry(profundo, alto),
        materialPared
    );
    paredEste.position.set(ancho / 2 - 0.01, alto / 2, 0);
    paredEste.rotation.y = -Math.PI / 2;
    escena.add(paredEste);
    objetosColision.push({ tipo: 'pared', x: ancho / 2 });

    // Pared oeste
    const paredOeste = new THREE.Mesh(
        new THREE.PlaneGeometry(profundo, alto),
        materialPared
    );
    paredOeste.position.set(-ancho / 2 + 0.01, alto / 2, 0);
    paredOeste.rotation.y = Math.PI / 2;
    escena.add(paredOeste);
    objetosColision.push({ tipo: 'pared', x: -ancho / 2 });


    //CUADRADO 1

    const paredMedioDer = new THREE.Mesh(
        new THREE.PlaneGeometry(15, alto),
        materialPared
    )
    paredMedioDer.position.set(-4.5, alto / 2, -12.5);
    paredMedioDer.rotation.y = Math.PI / 2;
    escena.add(paredMedioDer);
    objetosColision.push({ tipo: 'pared', x: -4.5, zMin: -20, zMax: -5 }); // ← COLISIÓN


    const paredPasilloPuertaDer1 = new THREE.Mesh(
        new THREE.PlaneGeometry(14.2, alto),
        materialPared
    )
    paredPasilloPuertaDer1.position.set(-25, alto / 2, -5);
    escena.add(paredPasilloPuertaDer1);
    objetosColision.push({ tipo: 'pared', z: -5, xMin: -30, xMax: -20 }); // ← COLISIÓN



    const paredPasilloPuertaDer2 = new THREE.Mesh(
        new THREE.PlaneGeometry(10, alto),
        materialPared
    )
    paredPasilloPuertaDer2.position.set(-9.5, alto / 2, -5);
    escena.add(paredPasilloPuertaDer2);
    objetosColision.push({ tipo: 'pared', z: -5, xMin: -14.5, xMax: -4.5 }); // ← COLISIÓN

    const paredPasilloSobrePuerta2 = new THREE.Mesh(
    new THREE.PlaneGeometry(38, 0.6),
    materialPared
    )
    paredPasilloSobrePuerta2.position.set(0, 4.7, -5);
    escena.add(paredPasilloSobrePuerta2);
    objetosColision.push({ tipo: 'pared', z: -5, xMin: -14.5, xMax: -4.5 }); // ← COLISIÓN


    // CUADRADO 2 

    const paredPasilloSobrePuerta1 = new THREE.Mesh(
    new THREE.PlaneGeometry(38, 0.6),
    materialPared
    )
    paredPasilloSobrePuerta1.position.set(0, 4.7, 5);
    escena.add(paredPasilloSobrePuerta1);
    objetosColision.push({ tipo: 'pared', z: 5, xMin: -14.5, xMax: -4.5 }); // ← COLISIÓN

    const paredFrontDer = new THREE.Mesh(
        new THREE.PlaneGeometry(15, alto),
        materialPared
    )
    paredFrontDer.position.set(20.5, alto / 2, -12.5);
    paredFrontDer.rotation.y = Math.PI / 2;
    escena.add(paredFrontDer);
    objetosColision.push({ tipo: 'pared', x: 20.5, zMin: -20, zMax: -5 }); // ← COLISIÓN


    const paredPasilloPuertaDer3 = new THREE.Mesh(
        new THREE.PlaneGeometry(14.2, alto),
        materialPared
    )
    paredPasilloPuertaDer3.position.set(0, alto / 2, -5);
    escena.add(paredPasilloPuertaDer3);
    objetosColision.push({ tipo: 'pared', z: -5, xMin: -5, xMax: 5 }); // ← COLISIÓN


    const paredPasilloPuertaDer4 = new THREE.Mesh(
        new THREE.PlaneGeometry(10, alto),
        materialPared
    )
    paredPasilloPuertaDer4.position.set(15.5, alto / 2, -5);
    escena.add(paredPasilloPuertaDer4);
    objetosColision.push({ tipo: 'pared', z: -5, xMin: 10.5, xMax: 20.5 }); // ← COLISIÓN

    // CUADRADO 3

    const paredMedioIzq = new THREE.Mesh(
        new THREE.PlaneGeometry(15, alto),
        materialPared
    )
    paredMedioIzq.position.set(-4.5, alto / 2, 12.5);
    paredMedioIzq.rotation.y = Math.PI / 2;
    escena.add(paredMedioIzq);
    objetosColision.push({ tipo: 'pared', x: -4.5, zMin: 5, zMax: 20 }); // ← COLISIÓN


    const paredPasilloPuertaIzq1 = new THREE.Mesh(
        new THREE.PlaneGeometry(14.2, alto),
        materialPared
    )
    paredPasilloPuertaIzq1.position.set(-25, alto / 2, 5);
    escena.add(paredPasilloPuertaIzq1);
    objetosColision.push({ tipo: 'pared', z: 5, xMin: -30, xMax: -20 }); // ← COLISIÓN


    const paredPasilloPuertaIzq2 = new THREE.Mesh(
        new THREE.PlaneGeometry(10, alto),
        materialPared
    )
    paredPasilloPuertaIzq2.position.set(-9.5, alto / 2, 5);
    escena.add(paredPasilloPuertaIzq2);
    objetosColision.push({ tipo: 'pared', z: 5, xMin: -14.5, xMax: -4.5 }); // ← COLISIÓN



    // CUADRADO 4

    const paredFrontIzq = new THREE.Mesh(
        new THREE.PlaneGeometry(15, alto),
        materialPared
    )
    paredFrontIzq.position.set(20.5, alto / 2, 12.5);
    paredFrontIzq.rotation.y = Math.PI / 2;
    escena.add(paredFrontIzq);
    objetosColision.push({ tipo: 'pared', x: 20.5, zMin: 5, zMax: 20 }); // ← COLISIÓN


    const paredPasilloPuertaIzq3 = new THREE.Mesh(
        new THREE.PlaneGeometry(14.2, alto),
        materialPared
    )
    paredPasilloPuertaIzq3.position.set(0, alto / 2, 5);
    escena.add(paredPasilloPuertaIzq3);
    objetosColision.push({ tipo: 'pared', z: 5, xMin: -5, xMax: 5 }); // ← COLISIÓN

    const paredPasilloPuertaIzq4 = new THREE.Mesh(
        new THREE.PlaneGeometry(10, alto),
        materialPared
    )
    paredPasilloPuertaIzq4.position.set(15.5, alto / 2, 5);
    escena.add(paredPasilloPuertaIzq4);
    objetosColision.push({ tipo: 'pared', z: 5, xMin: 10.5, xMax: 20.5 }); // ← COLISIÓN

    // Columnas decorativas
    crearColumnasDecorativas();
    cargarLogoUTN();
}

function crearColumnasDecorativas() {
    const materialColumna = new THREE.MeshLambertMaterial({ color: 0x734E31 });
    const geometriaColumna = new THREE.CylinderGeometry(0.5, 0.5, DIMENSIONES_SALA.alto, 16);

    // Crear columnas en las esquinas
    const posicionesColumnas = [
        { x: -DIMENSIONES_SALA.ancho / 2 + 1, z: -DIMENSIONES_SALA.profundo / 2 + 1 },
        { x: DIMENSIONES_SALA.ancho / 2 - 1, z: -DIMENSIONES_SALA.profundo / 2 + 1 },
        { x: -DIMENSIONES_SALA.ancho / 2 + 1, z: DIMENSIONES_SALA.profundo / 2 - 1 },
        { x: DIMENSIONES_SALA.ancho / 2 - 1, z: DIMENSIONES_SALA.profundo / 2 - 1 },
        { x: 2, z: 0 },
        { x: -10, z: 0 },
        { x: 19, z: 0 },
    ];

    posicionesColumnas.forEach(pos => {
        const columna = new THREE.Mesh(geometriaColumna, materialColumna);
        columna.position.set(pos.x, DIMENSIONES_SALA.alto / 2, pos.z);
        objetosColision.push({ tipo: 'columna', x: pos.x, z: pos.z, radio: 0.5 });
        escena.add(columna);
    });
}

// ========================
// ILUMINACIÓN
// ========================

function crearIluminacion() {
    // Luz ambiental
    const luzAmbiental = new THREE.AmbientLight(0x404040, 0.5);
    escena.add(luzAmbiental);

    // Luces direccionales principales
    const luzPrincipal1 = new THREE.DirectionalLight(0xffffff, 0.8);
    luzPrincipal1.position.set(10, DIMENSIONES_SALA.alto, 10);
    escena.add(luzPrincipal1);

    const luzPrincipal2 = new THREE.DirectionalLight(0xffffff, 0.8);
    luzPrincipal2.position.set(-10, DIMENSIONES_SALA.alto, -10);
    escena.add(luzPrincipal2);

    // Luces focales para las obras
    const luzFocal1 = new THREE.SpotLight(0xffffff, 1, 20, Math.PI / 6, 0.5);
    luzFocal1.position.set(0, DIMENSIONES_SALA.alto - 1, 0);
    luzFocal1.target.position.set(0, 0, 0);
    escena.add(luzFocal1);
    escena.add(luzFocal1.target);
}


// MODELO 3D - THINKER

// ========================
// CREACIÓN DE MODELOS 3D DESDE CONFIGURACIÓN
// ========================
function crearModelos3DDesdeConfig() {
    const modelosConfig = [
        {
            path: 'assets/models/modern_bench_1/scene.gltf',
            position: { x: -8, y: 0, z: 0 },
            scale: { x: 2.0, y: 2.0, z: 2.0 },
            rotation: { x: 0, y: Math.PI, z: 0 }
        },
        {
            path: 'assets/models/modern_bench_1/scene.gltf',
            position: { x: 0, y: 0, z: 0 },
            scale: { x: 2.0, y: 2.0, z: 2.0 },
            rotation: { x: 0, y: Math.PI, z: 0 }
        },
        {
            path: 'assets/models/modern_bench_1/scene.gltf',
            position: { x: 17, y: 0, z: 0 },
            scale: { x: 2.0, y: 2.0, z: 2.0 },
            rotation: { x: 0, y: Math.PI, z: 0 }
        },
        {
            path: 'assets/models/apple_ii_computer.glb',
            position: { x: -20, y: 1, z: -15 },
            scale: { x: 3.0, y: 3.0, z: 3.0 },
            rotation: { x: 0, y: 0, z: 0 },
            base: {
                color: 0x222222,
                // La base está debajo del modelo, así que la posición Y del modelo es la parte superior de la base
                size: { x: 3, y: 1, z: 2 }
            }
        },

        {
            path: 'assets/models/alan_turing_sculpture.glb',
            // La posición Y del modelo es la parte superior de la base
            position: { x: -23.7, y: 3, z: -0.5 },
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            rotation: { x: 0, y: Math.PI / 2, z: 0 },
            
        },
        {
            path: 'assets/models/8_bit_dj/scene.gltf',
            // La posición Y del modelo es la parte superior de la base
            position: { x: -27.33, y: 0.6, z: -7 },
            scale: { x: 0.009, y: 0.009, z: 0.009 },
            rotation: { x: 0, y: Math.PI / 3, z: 0 },
            
        },
// En la configuración de modelos, actualiza la ruta de la puerta:
        {
            path: 'assets/models/old_wooden_door_gltf/scene.gltf', // ← Cambiado aquí también
            position: { x: 8.8, y: 0, z: -5 },
            scale: { x: 1.5, y: 1.25, z: 1.5 },
            rotation: { x: 0, y: -Math.PI/4, z: 0 },
            tipo: 'puerta',
            propiedadesPuerta: {
                tiempoCierre: 4000,
                gradoApertura: Math.PI / 2
            }
        },
        {
            path: 'assets/models/old_wooden_door_gltf/scene.gltf', // ← Cambiado aquí también
            position: { x: 8.8, y: 0, z: 5 },
            scale: { x: 1.5, y: 1.25, z: 1.5 },
            rotation: { x: 0, y: Math.PI/4, z: 0 },
            tipo: 'puerta',
            propiedadesPuerta: {
                tiempoCierre: 4000,
                gradoApertura: Math.PI / 2
            }
        },
        {
            path: 'assets/models/old_wooden_door_gltf/scene.gltf', // ← Cambiado aquí también
            position: { x: -16.2, y: 0, z: 5 },
            scale: { x: 1.5, y: 1.25, z: 1.5 },
            rotation: { x: 0, y: Math.PI/4, z: 0 },
            tipo: 'puerta',
            propiedadesPuerta: {
                tiempoCierre: 4000,
                gradoApertura: Math.PI / 2
            }
        },
        {
            path: 'assets/models/old_wooden_door_gltf/scene.gltf', // ← Cambiado aquí también
            position: { x: -16.2, y: 0, z: -5 },
            scale: { x: 1.5, y: 1.25, z: 1.5 },
            rotation: { x: 0, y: -Math.PI/4, z: 0 },
            tipo: 'puerta',
            propiedadesPuerta: {
                tiempoCierre: 4000,
                gradoApertura: Math.PI / 2
            }
        },
        {
            path: 'assets/models/frank/scene.gltf', // ← Cambiado aquí también
            position: { x: 14, y: 1.1, z: -13 },
            scale: { x: 1.5, y: 1.5, z: 1.5 },
            rotation: { x: 0, y: 0, z: 0 },
        }
        // Puedes agregar más modelos aquí
        // {
        //     path: 'assets/models/thinker/scene.gltf',
        //     position: { x: 10, y: 0, z: 5 },
        //     scale: { x: 1.5, y: 1.5, z: 1.5 },
        //     rotation: { x: 0, y: 0, z: 0 },
        //     base: { color: 0x888888, size: { x: 1.6, y: 0.3, z: 1.6 } }
        // },
    ];
    const loader1 = new THREE.GLTFLoader();
    clock = new THREE.Clock();
    loader1.load('assets/models/dinobot/source/model.gltf', (gltf) => {
        model = gltf.scene;
        model.position.set(-8, 0, -9);
        model.scale.set(1.6, 1.6, 1.6);
        model.rotation.y = Math.PI/5;
        escena.add(model);

        // Animaciones
        const animations = gltf.animations;
        console.log("Animaciones:", animations);

        // Crear mixer y reproducir una animación
        mixer = new THREE.AnimationMixer(model);

        // Selecciona una animación por nombre
        const idleAnim = THREE.AnimationClip.findByName(animations, 'test');
        const action = mixer.clipAction(idleAnim);
        action.play();
    });


    const loader = new THREE.GLTFLoader();
    modelosConfig.forEach(cfg => {
        loader.load(
            cfg.path,
            function (gltf) {
                const modelo = gltf.scene;
                modelo.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
                modelo.scale.set(cfg.scale.x, cfg.scale.y, cfg.scale.z);
                modelo.rotation.set(cfg.rotation.x, cfg.rotation.y, cfg.rotation.z);

                // Forzar nombre para bancos modernos
                if (cfg.path.includes('modern_bench')) {
                    modelo.name = 'modern_bench';
                }

                // Si la config tiene base, crear cubo debajo
                if (cfg.base) {
                    const baseGeo = new THREE.BoxGeometry(cfg.base.size.x, cfg.base.size.y, cfg.base.size.z);
                    const baseMat = new THREE.MeshLambertMaterial({ color: cfg.base.color });
                    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
                    // Posicionar base debajo del modelo
                    baseMesh.position.set(
                        cfg.position.x,
                        cfg.position.y - (cfg.base.size.y / 2),
                        cfg.position.z
                    );
                    escena.add(baseMesh);
                    // Registrar la base para colisiones
                    objetosColision.push({
                        tipo: 'modelo3d',
                        modelo: baseMesh
                    });
                }
                escena.add(modelo);

                // Registrar el modelo para colisiones (se recalcula el bounding box en cada verificación)
                objetosColision.push({
                    tipo: 'modelo3d',
                    modelo: modelo
                });

                // Si es una puerta, darle propiedades y registrar
                if (cfg.tipo === 'puerta') {
                    descomponerMatrices(modelo);

                    // 1. Calcular bounding box del modelo
                    const box = new THREE.Box3().setFromObject(modelo);
                    const size = new THREE.Vector3();
                    box.getSize(size);

                    // 2. Calcular el desplazamiento para que la base esté en (0,0,0)
                    const offset = new THREE.Vector3(
                        -(box.min.x + size.x / 2), // Centrar en X
                        -box.min.y,                // Llevar base a Y=0
                        -(box.min.z + size.z / 2)  // Centrar en Z
                    );

                    // 3. Crear un grupo y agregar el modelo desplazado
                    const group = new THREE.Group();
                    modelo.position.add(offset); // Mueve el modelo internamente
                    group.add(modelo);

                    // 4. Ahora aplica la posición, escala y rotación al grupo
                    group.scale.set(cfg.scale.x, cfg.scale.y, cfg.scale.z);
                    group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
                    group.rotation.set(cfg.rotation.x, cfg.rotation.y, cfg.rotation.z);

                    group.userData.estado = 'cerrada';
                    group.userData.tiempoCierre = cfg.propiedadesPuerta.tiempoCierre || 4000;
                    group.userData.animando = false;
                    group.userData.gradoApertura = cfg.propiedadesPuerta.gradoApertura || Math.PI / 2;

                    puertasInteractuables.push(group);
                    objetosColision.push({
                        tipo: 'pared',
                        modelo: group
                    });
                    escena.add(group);

                    console.log('Puerta interactuable cargadaaaa:', group);
                    ;
                }

                // Debug: mostrar bounding box en consola
                const box = new THREE.Box3().setFromObject(modelo);
                console.log('BoundingBox', modelo.name, box.min, box.max);
            },
            undefined,
            function (error) {
                console.error('Error cargando modelo:', cfg.path, error);
            }
        );
    });
}

function descomponerMatrices(obj) {
    obj.traverse(child => {
        if (child.matrix && !child.matrixAutoUpdate) {
            child.matrix.decompose(child.position, child.quaternion, child.scale);
            child.matrixAutoUpdate = true;
        }
    });
}

function alternarPuertaOldWooden(puerta) {
    if (puerta.userData.animando) return;

    // Buscar el nodo de la puerta (SM_door_68)
    let nodoPuerta = null;
    puerta.traverse(child => {
        if (child.name === "SM_door_68") {
            nodoPuerta = child;
        }
    });

    if (!nodoPuerta) {
        console.warn("No se encontró el nodo de la puerta para animar");
        return;
    }

    puerta.userData.animando = true;
    const abierta = puerta.userData.estado === "abierta";
    const rotInicial = nodoPuerta.rotation.y;
    const rotFinal = abierta ? 0 : -Math.PI / 2; // Abrir -90 grados en Y

    // Animar apertura/cierre
    gsap.to(nodoPuerta.rotation, {
        y: rotFinal,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            puerta.userData.estado = abierta ? "cerrada" : "abierta";
            puerta.userData.animando = false;
        }
    });
}


function cargarModelo3DBench() {
    console.log('Cargando modelo 3D...');

    const loader = new THREE.GLTFLoader();
    const rutaModelo = 'assets/models/granite_bench/scene.gltf';

    loader.load(
        rutaModelo,
        function (gltf) {
            console.log('Modelo 3D cargado correctamente');

            // Obtener el modelo
            const modelo = gltf.scene;

            // Ajustar posición, escala y rotación
            modelo.position.set(25, 1, 0);
            modelo.scale.set(2.0, 2.0, 2.0);
            modelo.rotation.y = Math.PI;

            // Agregar a la escena
            escena.add(modelo);


            console.log('Escultura agregada correctamente');
        },
        function (xhr) {
            // Progreso de carga
            console.log((xhr.loaded / xhr.total * 100) + '% cargado');
        },
        function (error) {
            console.error('Error al cargar el modelo:', error);

            // Mensaje de error en pantalla
            const divError = document.createElement('div');
            divError.style.position = 'fixed';
            divError.style.bottom = '20px';
            divError.style.left = '50%';
            divError.style.transform = 'translateX(-50%)';
            divError.style.backgroundColor = 'rgba(200, 0, 0, 0.8)';
            divError.style.color = 'white';
            divError.style.padding = '10px 20px';
            divError.style.borderRadius = '5px';
            divError.style.zIndex = '10000';
            divError.style.textAlign = 'center';
            divError.innerHTML = '<h3>Error al cargar el modelo 3D</h3>' +
                '<p>Verifica la ruta del archivo: ' + rutaModelo + '</p>';
            document.body.appendChild(divError);

            // Eliminar el mensaje después de 5 segundos
            setTimeout(() => {
                if (document.body.contains(divError)) {
                    document.body.removeChild(divError);
                }
            }, 5000);
        }
    );
}
// cargar logo utn
function cargarLogoUTN() {
    const textura = new THREE.TextureLoader().load("assets/texturas/UTN_logo.jpg");
    const material = new THREE.MeshBasicMaterial({ map: textura });
    const geometria = new THREE.PlaneGeometry(4.0, 3.0);
    const pintura = new THREE.Mesh(geometria, material);
    pintura.position.set(20.53, 2.5, -15);

    // Rotar si está en la pared sur
    pintura.rotation.y = Math.PI / 2;
    // Guardar referencia y descripción
    pintura.userData.descripcion = "Logo de la Universidad Tecnológica Nacional";
    pinturasInteract.push(pintura);
    escena.add(pintura);
}

// Array global para almacenar las pinturas y sus descripciones
let pinturasInteract = [];

// ========================
// CREACIÓN DE OBRAS CON TEXTURAS
// ========================

function crearObrasConTexturas() {
    console.log('Cargando obras de arte...');

    // Datos de las pinturas
    const pinturasData = [
        {
            textura: "assets/texturas/capilla_sixtina.webp",
            posicion: [15, 2.5, -4.9],
            descripcion: "La Creación de Adán - Miguel Ángel (1512)\n\nUna de las escenas más icónicas del techo de la Capilla Sixtina. Esta obra maestra del Renacimiento representa el momento bíblico en que Dios da vida a Adán. El casi-contacto entre los dedos de Dios y Adán se ha convertido en una de las imágenes más reproducidas de la historia del arte. Miguel Ángel pintó esta y otras escenas en el techo entre 1508 y 1512, trabajando en condiciones extremadamente difíciles sobre andamios a gran altura."
        },
        {
            textura: "assets/texturas/dormitorio_en_arles.webp",
            posicion: [0, 2.5, -4.9],
            descripcion: "El Dormitorio en Arlés - Vincent van Gogh (1888)\n\nVan Gogh pintó esta obra durante su estancia en la Casa Amarilla de Arlés, representando su propio dormitorio. Los colores vibrantes y la perspectiva ligeramente distorsionada crean una sensación de calidez e intimidad. Para Van Gogh, esta pintura simbolizaba descanso y tranquilidad. El artista estaba tan orgulloso de esta obra que realizó tres versiones, actualmente en diferentes museos. Las paredes azul lavanda contrastan bellamente con el suelo rojo y la cama amarilla."
        },
        {
            textura: "assets/texturas/las_meninas.webp",
            posicion: [-8, 2.5, -4.9],
            descripcion: "Las Meninas - Diego Velázquez (1656)\n\nConsiderada una de las pinturas más importantes de la historia del arte occidental. Esta compleja obra muestra a la infanta Margarita rodeada de sus damas de compañía (meninas), otros miembros de la corte y el propio Velázquez pintando. El juego de perspectivas y espejos ha fascinado a críticos durante siglos. La obra se encuentra en el Museo del Prado en Madrid y es un ejemplo supremo del Barroco español."
        },
        {
            textura: "assets/texturas/noche_estrellada.webp",
            posicion: [-8, 2.5, 4.9],
            descripcion: "La Noche Estrellada - Vincent van Gogh (1889)\n\nPintada durante la estancia de Van Gogh en el asilo de Saint-Rémy-de-Provence, esta obra muestra una vista nocturna desde su ventana con un ciprés en primer plano y un pueblo al fondo. El cielo arremolinado con estrellas brillantes y una luna creciente refleja tanto la turbulencia emocional del artista como su genio creativo. Actualmente se exhibe en el MoMA de Nueva York y es una de las pinturas más reconocidas del mundo."
        },
        {
            textura: "assets/texturas/girl_pearl_earring.webp",
            posicion: [15, 2.5, 4.9],
            descripcion: "La Joven de la Perla - Johannes Vermeer (1665)\n\nApodada la 'Mona Lisa del Norte', esta pintura captura a una joven con un turbante exótico y un gran pendiente de perla. La mirada directa de la joven y su expresión enigmática han cautivado al público durante siglos. Vermeer utilizó su característico dominio de la luz para crear profundidad y luminosidad. La obra se encuentra en la Mauritshuis de La Haya y representa el apogeo del arte barroco holandés."
        },
        {
            textura: "assets/texturas/mona_lisa.webp",
            posicion: [0, 2.5, -19.4],
            descripcion: "La Mona Lisa - Leonardo da Vinci (1503-1519)\n\nLa pintura más famosa del mundo. Este retrato de Lisa Gherardini, esposa de un comerciante florentino, es célebre por la enigmática sonrisa de la retratada y la revolucionaria técnica del sfumato utilizada por Leonardo. La obra tardó años en completarse y Leonardo la llevó consigo a Francia. Actualmente es la joya de la corona del Museo del Louvre en París, donde atrae millones de visitantes cada año."
        },
        {
            textura: "assets/texturas/guernica.webp",
            posicion: [8, 2.5, -19.4],
            descripcion: "Guernica - Pablo Picasso (1937)\n\nEsta monumental obra en blanco y negro fue creada en respuesta al bombardeo de la ciudad vasca de Guernica durante la Guerra Civil Española. Con sus figuras distorsionadas y expresiones de agonía, Picasso creó un poderoso alegato antibelicista que trasciende su contexto histórico específico. La pintura de 3.5 x 7.8 metros se exhibe en el Museo Reina Sofía de Madrid y es considerada una de las obras más influyentes del siglo XX."
        },
        {
            textura: "assets/texturas/van_gogh_girasoles.webp",
            posicion: [16, 2.5, -19.4],
            descripcion: "Los Girasoles - Vincent van Gogh (1888)\n\nVan Gogh pintó una serie de cuadros de girasoles, siendo esta una de las versiones más conocidas. Creada en Arlés durante uno de sus períodos más productivos, la obra muestra su característico uso vibrante del color amarillo y pinceladas expresivas. Para Van Gogh, los girasoles simbolizaban gratitud. Existen varias versiones de esta obra en diferentes museos alrededor del mundo, testimonio de la fascinación del artista con este tema."
        },
        {
            textura: "assets/texturas/cristianMac-Crepusculo.png",
            posicion: [0, 2.5, 19.4],
            descripcion: "Crepúsculo - Cristian Mac (2024)\n\nUna obra contemporánea que captura la transición efímera entre el día y la noche. Mac utiliza una paleta de colores cálidos y fríos en equilibrio perfecto para representar ese momento mágico donde la luz solar se desvanece y da paso a la oscuridad. La composición invita al espectador a reflexionar sobre los ciclos naturales y el paso inevitable del tiempo. Esta pieza forma parte de la serie 'Momentos Fugaces' del artista, donde explora la belleza de los instantes transitorios que a menudo pasan desapercibidos en la vida cotidiana."
        },
        {
            textura: "assets/texturas/cristianMac-Ojo.png",
            posicion: [8, 2.5, 19.4],
            descripcion: "Ojo - Cristian Mac (2024)\n\nUna exploración íntima de la mirada humana como ventana al alma. Mac deconstruye el concepto tradicional del retrato para enfocarse únicamente en el órgano de la percepción, creando una obra que es simultáneamente observadora y observada. El detallismo técnico se combina con elementos abstractos que rodean el ojo, sugiriendo las capas de conciencia y subconsciencia que subyacen en cada mirada. Esta obra invita al espectador a confrontar su propia forma de ver y ser visto, cuestionando la naturaleza de la observación artística."
        },
        {
            textura: "assets/texturas/cristianMac-Simetria.png",
            posicion: [16, 2.5, 19.4],
            descripcion: "Simetría - Cristian Mac (2024)\n\nUna meditación visual sobre el equilibrio y la armonía en la composición. Mac explora los principios matemáticos y estéticos de la simetría, creando una obra que dialoga entre el orden y el caos, lo predecible y lo sorprendente. La repetición de formas y patrones genera un ritmo visual hipnótico que atrae la mirada del espectador hacia el centro de la composición. Esta pieza representa la búsqueda del artista por encontrar belleza en la estructura y el orden, mientras mantiene espacio para la interpretación personal y la experiencia subjetiva del observador."
        },
        {
            textura: "assets/texturas/Maradona.JPG",
            posicion: [-12, 2.5, 19.4],
            descripcion: "Autorretrato - Vincent van Gogh (1889)\n\nVan Gogh pintó más de 30 autorretratos durante su vida, siendo esta una de sus obras más introspectivas. Con pinceladas arremolinadas y colores intensos, el artista se representa con una mirada penetrante que refleja tanto su determinación artística como su lucha interior. Los autorretratos de Van Gogh son documentos psicológicos invaluables que revelan su evolución personal y artística durante sus turbulentos últimos años."
        },
        {
            textura: "assets/texturas/messi.jpg",
            posicion: [-17, 2.5, 19.4],
            descripcion: "El Nacimiento de Venus - Sandro Botticelli (1485)\n\nEsta obra icónica del Renacimiento temprano representa a la diosa Venus emergiendo del mar sobre una concha, empujada por los vientos Céfiro y Aura hacia la costa donde la espera una de las Horas. La composición elegante y la belleza idealizada de Venus ejemplifican los ideales renacentistas de armonía y proporción. La pintura se encuentra en la Galería Uffizi de Florencia y es una de las obras más célebres del Renacimiento italiano."
        },
        {
            textura: "assets/texturas/kempes.jpg",
            posicion: [-23, 2.5, 19.4],
            descripcion: "La Mona Lisa - Leonardo da Vinci (1503-1519)\n\nLa pintura más famosa del mundo. Este retrato de Lisa Gherardini, esposa de un comerciante florentino, es célebre por la enigmática sonrisa de la retratada y la revolucionaria técnica del sfumato utilizada por Leonardo. La obra tardó años en completarse y Leonardo la llevó consigo a Francia. Actualmente es la joya de la corona del Museo del Louvre en París, donde atrae millones de visitantes cada año."
        },
        {
            textura: "assets/texturas/van_gogh_autorretrato.webp",
            posicion: [-12, 2.5, -19.4],
            descripcion: "Autorretrato - Vincent van Gogh (1889)\n\nVan Gogh pintó más de 30 autorretratos durante su vida, siendo esta una de sus obras más introspectivas. Con pinceladas arremolinadas y colores intensos, el artista se representa con una mirada penetrante que refleja tanto su determinación artística como su lucha interior. Los autorretratos de Van Gogh son documentos psicológicos invaluables que revelan su evolución personal y artística durante sus turbulentos últimos años."
        },
        {
            textura: "assets/texturas/el_nacimiento_venus.webp",
            posicion: [-17, 2.5, -19.4],
            descripcion: "El Nacimiento de Venus - Sandro Botticelli (1485)\n\nEsta obra icónica del Renacimiento temprano representa a la diosa Venus emergiendo del mar sobre una concha, empujada por los vientos Céfiro y Aura hacia la costa donde la espera una de las Horas. La composición elegante y la belleza idealizada de Venus ejemplifican los ideales renacentistas de armonía y proporción. La pintura se encuentra en la Galería Uffizi de Florencia y es una de las obras más célebres del Renacimiento italiano."
        },
        {
            textura: "assets/texturas/mona_lisa_new.webp",
            posicion: [-23, 2.5, -19.4],
            descripcion: "La Mona Lisa - Leonardo da Vinci (1503-1519)\n\nLa pintura más famosa del mundo. Este retrato de Lisa Gherardini, esposa de un comerciante florentino, es célebre por la enigmática sonrisa de la retratada y la revolucionaria técnica del sfumato utilizada por Leonardo. La obra tardó años en completarse y Leonardo la llevó consigo a Francia. Actualmente es la joya de la corona del Museo del Louvre en París, donde atrae millones de visitantes cada año."
        }
    ];

    pinturasData.forEach(data => {
        // Obtener nombre de la obra para el cartel
        const nombreObra = data.descripcion.split(',')[0];
        const textura = new THREE.TextureLoader().load(data.textura);
        const material = new THREE.MeshBasicMaterial({ map: textura });
        const geometria = new THREE.PlaneGeometry(4.0, 3.0);
        const pintura = new THREE.Mesh(geometria, material);
        pintura.position.set(...data.posicion);

        // Rotar si está en la pared sur
        if (data.posicion[2] > 0) pintura.rotation.y = Math.PI;

        // Guardar referencia y descripción
        pintura.userData.descripcion = data.descripcion;
        pinturasInteract.push(pintura);

        escena.add(pintura);

        // === MARCO DE MADERA ===
        // Crea un marco simple alrededor de la pintura
        const marcoMaterial = new THREE.MeshLambertMaterial({ color: 0x8B5A2B }); // Color madera
        const marcoGrosor = 0.18;
        const marcoProfundidad = 0.15;

        // Lados horizontales
        const marcoSuperior = new THREE.Mesh(
            new THREE.BoxGeometry(4.0 + marcoGrosor * 2, marcoGrosor, marcoProfundidad),
            marcoMaterial
        );
        marcoSuperior.position.set(data.posicion[0], data.posicion[1] + 1.5 + marcoGrosor / 2, data.posicion[2]);
        marcoSuperior.rotation.y = pintura.rotation.y;
        escena.add(marcoSuperior);

        const marcoInferior = new THREE.Mesh(
            new THREE.BoxGeometry(4.0 + marcoGrosor * 2, marcoGrosor, marcoProfundidad),
            marcoMaterial
        );
        marcoInferior.position.set(data.posicion[0], data.posicion[1] - 1.5 - marcoGrosor / 2, data.posicion[2]);
        marcoInferior.rotation.y = pintura.rotation.y;
        escena.add(marcoInferior);

        // Lados verticales
        const marcoIzquierdo = new THREE.Mesh(
            new THREE.BoxGeometry(marcoGrosor, 3.0 + marcoGrosor * 2, marcoProfundidad),
            marcoMaterial
        );
        marcoIzquierdo.position.set(data.posicion[0] - 2.0 - marcoGrosor / 2, data.posicion[1], data.posicion[2]);
        marcoIzquierdo.rotation.y = pintura.rotation.y;
        escena.add(marcoIzquierdo);

        const marcoDerecho = new THREE.Mesh(
            new THREE.BoxGeometry(marcoGrosor, 3.0 + marcoGrosor * 2, marcoProfundidad),
            marcoMaterial
        );
        marcoDerecho.position.set(data.posicion[0] + 2.0 + marcoGrosor / 2, data.posicion[1], data.posicion[2]);
        marcoDerecho.rotation.y = pintura.rotation.y;
        escena.add(marcoDerecho);

        // === CARTEL CON NOMBRE DE LA OBRA ===
            // Eliminar el cartel dorado
    });

    // Evento para mostrar descripción al hacer clic
    window.addEventListener('click', function (event) {
        if (document.pointerLockElement !== document.body) return;
        console.log('🔫 Click detectado en posición:', event.clientX, event.clientY);
        // Raycaster para detectar objetos bajo el mouse
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camara);

        // Detectar pinturas
        const intersectPinturas = raycaster.intersectObjects(pinturasInteract, true);
        if (intersectPinturas.length > 0) {
            const pintura = intersectPinturas[0].object;
            mostrarDescripcionPintura(pintura.userData.descripcion);
            return; // no procesar puertas si se hizo clic en una pintura
        }

        // Detectar puertas - MEJORADO para buscar en toda la jerarquía
        let puertaClickeada = null;
        for (const puerta of puertasInteractuables) {
            const intersecciones = raycaster.intersectObject(puerta, true);
            if (intersecciones.length > 0) {
                // Buscar el grupo padre (puerta) en la jerarquía
                let obj = intersecciones[0].object;
                while (obj && obj !== puerta) {
                    obj = obj.parent;
                }
                if (obj === puerta) {
                    puertaClickeada = puerta;
                    console.log('🎯 Puerta intersectada:', puerta);
                    break;
                }
            }
        }

        if (puertaClickeada) {
            console.log('🚪 Clic en puerta detectado, estado actual:', puertaClickeada.userData.estado);
            alternarPuertaOldWooden(puertaClickeada);
        } else {
            console.log('❌ No se intersectó ninguna puerta');
        }
    });

}

// ========================

// Muestra la descripción en pantalla
function mostrarDescripcionPintura(descripcion) {
    let div = document.getElementById('descripcionPintura');
    if (!div) {
        div = document.createElement('div');
        div.id = 'descripcionPintura';
        div.style.position = 'fixed';
        div.style.top = '60px';
        div.style.right = '40px';
        div.style.background = 'rgba(30,30,30,0.97)';
        div.style.color = '#ffd700';
        div.style.padding = '20px 32px';
        div.style.borderRadius = '12px';
        div.style.fontSize = '18px';
        div.style.zIndex = '2000';
        div.style.maxWidth = '600px';
        div.style.textAlign = 'left';
        div.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
        div.style.overflowY = 'auto';
        div.style.maxHeight = '60vh';
        document.body.appendChild(div);
    }
    div.textContent = descripcion;
    div.style.display = 'block';

    // Ocultar después de 6 segundos
    clearTimeout(div._timeout);
    div._timeout = setTimeout(() => {
        div.style.display = 'none';
    }, 6000);
}

// ========================
// CONTROLES
// ========================

function configurarControles() {
    const bloqueador = document.getElementById('bloqueador');
    const botonIniciar = document.getElementById('botonIniciar');

    botonIniciar.addEventListener('click', function () {
        console.log('Iniciando recorrido...');
        const elemento = document.body;

        elemento.requestPointerLock = elemento.requestPointerLock ||
            elemento.mozRequestPointerLock ||
            elemento.webkitRequestPointerLock;

        if (elemento.requestPointerLock) {
            elemento.requestPointerLock();
        } else {
            bloqueador.style.display = 'none';
        }

        // Iniciar música default al entrar al museo
        if (musicaDefault) {
            musicaDefault.currentTime = 0;
            musicaDefault.play();
            musicaActual = musicaDefault;
        }

        // Reproducir narración inicial solo la primera vez
        if (narracionInicial && !narracionReproducida) {
            narracionInicial.currentTime = 0;
            narracionInicial.play();
            narracionReproducida = true;
            console.log('Reproduciendo narración inicial...');
        }
    });

    document.addEventListener('pointerlockchange', cambiarPointerLock);
    document.addEventListener('mozpointerlockchange', cambiarPointerLock);
    document.addEventListener('webkitpointerlockchange', cambiarPointerLock);

    function cambiarPointerLock() {
        const elemento = document.pointerLockElement ||
            document.mozPointerLockElement ||
            document.webkitPointerLockElement;

        if (elemento === document.body) {
            bloqueador.style.display = 'none';
        } else {
            bloqueador.style.display = 'flex';
        }
    }
}

function configurarEventos() {
    // Teclado
    document.addEventListener('keydown', function (evento) {
        teclasPulsadas[evento.code] = true;
    });

    document.addEventListener('keyup', function (evento) {
        teclasPulsadas[evento.code] = false;
    });

    // Mouse
    document.addEventListener('mousemove', function (evento) {
        if (document.pointerLockElement === document.body) {
            const movimientoX = evento.movementX || 0;
            const movimientoY = evento.movementY || 0;

            // Actualizar rotaciones
            rotacionY -= movimientoX * sensibilidadMouse;
            rotacionX -= movimientoY * sensibilidadMouse;

            // Limitar pitch
            rotacionX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotacionX));

            // Aplicar rotación a la cámara
            camara.rotation.y = rotacionY;
            camara.rotation.x = rotacionX;
            camara.rotation.z = 0;
        }
    });

    // Redimensionar
    window.addEventListener('resize', function () {
        camara.aspect = window.innerWidth / window.innerHeight;
        camara.updateProjectionMatrix();
        renderizador.setSize(window.innerWidth, window.innerHeight);
    });
}

// ========================
// MOVIMIENTO
// ========================

function actualizarMovimiento(tiempoDelta) {
    if (juegoTerminado) return;

    const velocidad = velocidadMovimiento * tiempoDelta;
    const direccion = new THREE.Vector3();

    // Obtener dirección de entrada
    if (teclasPulsadas['KeyW']) direccion.z = -1;  // Forward
    if (teclasPulsadas['KeyS']) direccion.z = 1; // Backward  
    if (teclasPulsadas['KeyA']) direccion.x = -1;  // Left
    if (teclasPulsadas['KeyD']) direccion.x = 1; // Right

    if (direccion.length() === 0) return; // No hay movimiento

    direccion.normalize();

    // Aplicar rotación Y (horizontal) a la dirección
    const cos = Math.cos(rotacionY);
    const sin = Math.sin(rotacionY);

    const direccionMundial = new THREE.Vector3(
        direccion.x * cos + direccion.z * sin,
        0,
        -direccion.x * sin + direccion.z * cos
    );

    // Calcular nueva posición
    const nuevaPosicion = camara.position.clone();
    nuevaPosicion.add(direccionMundial.multiplyScalar(velocidad));

    // Verificar colisiones y aplicar
    if (verificarColisiones(nuevaPosicion)) {
        camara.position.copy(nuevaPosicion);
    }

    // Verificar condición de victoria
    //verificarVictoria();
}

/* function verificarColisiones(nuevaPosicion) {
    const margen = 0.5;
    const { ancho, profundo } = DIMENSIONES_SALA;
    
    // Límites de la sala
    if (nuevaPosicion.x < -ancho/2 + margen || nuevaPosicion.x > ancho/2 - margen) return false;
    if (nuevaPosicion.z < -profundo/2 + margen || nuevaPosicion.z > profundo/2 - margen) return false;
    
    return true;
} */

function verificarColisiones(nuevaPosicion) {
    const margen = 0.5;
    const { ancho, profundo } = DIMENSIONES_SALA;

    // 1. Verificar límites de la sala principal
    if (nuevaPosicion.x < -ancho / 2 + margen || nuevaPosicion.x > ancho / 2 - margen) return false;
    if (nuevaPosicion.z < -profundo / 2 + margen || nuevaPosicion.z > profundo / 2 - margen) return false;

    // 2. Verificar colisión con todas las paredes internas y modelos 3D
    for (const obj of objetosColision) {
        if (obj.tipo === 'pared') {
            // ...paredes, igual que antes...
            if (obj.z !== undefined) {
                const distanciaZ = Math.abs(nuevaPosicion.z - obj.z);
                if (distanciaZ < margen) {
                    const dentroDeLimites = !obj.xMin ||
                        (nuevaPosicion.x >= obj.xMin && nuevaPosicion.x <= obj.xMax);
                    if (dentroDeLimites) {
                        return false;
                    }
                }
            }
            if (obj.x !== undefined) {
                const distanciaX = Math.abs(nuevaPosicion.x - obj.x);
                if (distanciaX < margen) {
                    const dentroDeLimites = !obj.zMin ||
                        (nuevaPosicion.z >= obj.zMin && nuevaPosicion.z <= obj.zMax);
                    if (dentroDeLimites) {
                        return false;
                    }
                }
            }
        }
        if (obj.tipo === 'columna') {
            const dx = nuevaPosicion.x - obj.x;
            const dz = nuevaPosicion.z - obj.z;
            const distancia = Math.sqrt(dx * dx + dz * dz);
            if (distancia < (obj.radio || 0.5) + margen) {
                return false;
            }
        }
        // Colisión con modelos 3D
        if (obj.tipo === 'modelo3d' && obj.modelo) {
            // Recalcular bounding box en cada verificación (por si el modelo se mueve o anima)
            let box = new THREE.Box3().setFromObject(obj.modelo);
            // Si el modelo es un banco moderno, expandir la caja en Y para que el jugador no pase por arriba
            if (obj.modelo.name && obj.modelo.name.toLowerCase().includes('bench')) {
                // Expandir la caja en Y (altura)
                box.min.y -= 1.5;
                box.max.y += 2.5;
            }
            if (!box.isEmpty() && box.containsPoint(nuevaPosicion)) {
                return false;
            }
        }
    }

    return true;
}

// ========================
// RENDIMIENTO
// ========================

function actualizarFPS(tiempoTranscurrido) {
    contadorFrames++;
    tiempoFPS += tiempoTranscurrido;

    if (tiempoFPS >= 1000) {
        const fps = Math.round((contadorFrames * 1000) / tiempoFPS);
        document.getElementById('contadorFPS').textContent = fps;
        contadorFrames = 0;
        tiempoFPS = 0;
    }
}

// PRUEBASSSSS







// ========================
// DETECCIÓN DE VICTORIA
// ========================

function verificarVictoria() {
    if (juegoTerminado) return;

    // Buscar el cuadro ganador en la lista de meshes
    const cuadroGanadorData = meshCuadros.find(cuadro => cuadro.datos.esGanador);

    if (!cuadroGanadorData) {
        console.log('No se encontró cuadro ganador');
        return;
    }

    const posicionJugador = camara.position;
    const posicionCuadro = cuadroGanadorData.posicion;

    const distancia = posicionJugador.distanceTo(posicionCuadro);

    console.log(`Distancia al cuadro ganador: ${distancia.toFixed(2)}`);

    if (distancia < 3.0) {
        console.log('¡Victoria detectada!');
        //mostrarVictoria(cuadroGanadorData.datos);
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}

// ========================
// BUCLE PRINCIPAL
// ========================

function animar(tiempoActual) {
    requestAnimationFrame(animar);

    const tiempoDelta = reloj.getDelta();
    const tiempoTranscurrido = tiempoActual - ultimoTiempo;
    ultimoTiempo = tiempoActual;

    actualizarMovimiento(tiempoDelta);
    actualizarFPS(tiempoTranscurrido);

    if (debugPanel) {
        debugPanel.actualizar(camara, tiempoTranscurrido);
    }

    if (mixer) {
        mixer.update(tiempoDelta);
    }

    // Música ambiental por habitación
    actualizarMusicaAmbiental();



    renderizador.render(escena, camara);
}

// ========================
// INICIO
// ========================

document.addEventListener('DOMContentLoaded', function () {
    console.log('Inicializando museo con sala única...');
    if (typeof THREE === 'undefined') {
        console.error('Three.js no cargado');
        return;
    }
    inicializar();
});

if (document.readyState !== 'loading') {
    inicializar();
}

// ========================
// MÚSICA AMBIENTAL POR HABITACIÓN
// ========================
let musicaActual = null;
let musicaDefault = null;
let narracionInicial = null;
let narracionReproducida = false;
const habitacionesMusica = [
    {
        nombre: 'Cuadrado 1',
        xMin: -30, xMax: -5, zMin: -20, zMax: -5,
        audio: 'assets/audio/room1.mp3'
    },
    {
        nombre: 'Cuadrado 2',
        xMin: -4, xMax: 20, zMin: -20, zMax: -5,
        audio: 'assets/audio/room2.mp3'
    },
    {
        nombre: 'Cuadrado 3',
        xMin: -30, xMax: -5, zMin: 5, zMax: 20,
        audio: 'assets/audio/lamanodedios.mp3'
    },
    {
        nombre: 'Cuadrado 4',
        xMin: -4, xMax: 20, zMin: 5, zMax: 20,
        audio: 'assets/audio/room4.mp3'
    }
];

function inicializarMusicaAmbiental() {
    // Preload audios
    habitacionesMusica.forEach(hab => {
        hab.audioObj = new Audio(hab.audio);
        hab.audioObj.loop = true;
        hab.audioObj.volume = 0.1;
    });
    // Música para zonas fuera de habitaciones
    musicaDefault = new Audio('assets/audio/default.mp3');
    musicaDefault.loop = true;
    musicaDefault.volume = 0.1;

    // Narración inicial (se reproduce solo una vez)
    narracionInicial = new Audio('assets/audio/narracion_galeria.mp3');
    narracionInicial.loop = false;
    narracionInicial.volume = 0.3; // Más alto que la música (0.1)
}

function actualizarMusicaAmbiental() {
    const pos = camara.position;
    let nuevaMusica = null;
    for (const hab of habitacionesMusica) {
        if (pos.x >= hab.xMin && pos.x <= hab.xMax && pos.z >= hab.zMin && pos.z <= hab.zMax) {
            nuevaMusica = hab.audioObj;
            break;
        }
    }
    // Si no está en ninguna habitación, usar música default
    if (!nuevaMusica) {
        nuevaMusica = musicaDefault;
    }
    if (nuevaMusica !== musicaActual) {
        if (musicaActual) {
            musicaActual.pause();
            musicaActual.currentTime = 0;
        }
        if (nuevaMusica) {
            nuevaMusica.play();
        }
        musicaActual = nuevaMusica;
    }
}
