// ========================
// CONFIGURACIÓN INICIAL
// ========================

// Variables principales de la escena
let escena, camara, renderizador;
let reloj;
let objetosColision = [];
let cargadorTexturas;

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

// Variables de cámara
let rotacionY = 0; // Horizontal (yaw)  
let rotacionX = 0; // Vertical (pitch)
let sensibilidadMouse = 0.002;

// Dimensiones del museo
const DIMENSIONES = {
    sala1: { ancho: 18, alto: 4, profundo: 12 },
    sala2: { ancho: 18, alto: 4, profundo: 12 },
    pasillo: { ancho: 4, largo: 8, alto: 4 }
};

// ========================
// DATOS DE OBRAS DE ARTE CON TEXTURAS
// ========================

const obrasDeArte = [
    // Sala 1
    {
        titulo: "La Mona Lisa",
        artista: "Leonardo da Vinci",
        año: "1503-1519",
        textura: "assets/texturas/mona_lisa.webp",
        tamaño: { ancho: 2.0, alto: 1.5 },
        posicion: new THREE.Vector3(-6, 2, -5.9),
        descripcion: "El retrato más famoso del mundo"
    },
    {
        titulo: "La Noche Estrellada",
        artista: "Vincent van Gogh", 
        año: "1889",
        textura: "assets/texturas/noche_estrellada.webp",
        tamaño: { ancho: 2.2, alto: 1.7 },
        posicion: new THREE.Vector3(-2, 2, -5.9),
        descripcion: "Obra maestra del post-impresionismo"
    },
    {
        titulo: "Autorretrato de Van Gogh",
        artista: "Vincent van Gogh",
        año: "1889",
        textura: "assets/texturas/van_gogh_autorretrato.webp",
        tamaño: { ancho: 1.8, alto: 2.2 },
        posicion: new THREE.Vector3(2, 2, -5.9),
        descripcion: "Autorretrato con sombrero"
    },
    {
        titulo: "Retrato del Dr. Gachet",
        artista: "Vincent van Gogh",
        año: "1890",
        textura: "assets/texturas/van_gogh_doctor.webp",
        tamaño: { ancho: 2.0, alto: 2.4 },
        posicion: new THREE.Vector3(6, 2, -5.9),
        descripcion: "Uno de los últimos retratos de Van Gogh"
    },
    
    // Paredes laterales Sala 1 - con texturas
    {
        titulo: "Las Meninas",
        artista: "Diego Velázquez",
        año: "1656",
        textura: "assets/texturas/las_meninas.webp",
        tamaño: { ancho: 2.0, alto: 2.3 },
        posicion: new THREE.Vector3(-8.9, 2, -2),
        descripcion: "Obra maestra del Siglo de Oro español"
    },
    {
        titulo: "Girl with a Pearl Earring",
        artista: "Johannes Vermeer", 
        año: "1665",
        textura: "assets/texturas/girl_pearl_earring.webp",
        tamaño: { ancho: 1.6, alto: 1.8 },
        posicion: new THREE.Vector3(-8.9, 2, 2),
        descripcion: "La Mona Lisa del Norte"
    },
    {
        titulo: "Los Girasoles",
        artista: "Vincent van Gogh",
        año: "1888", 
        textura: "assets/texturas/van_gogh_girasoles.webp",
        tamaño: { ancho: 1.8, alto: 2.2 },
        posicion: new THREE.Vector3(8.9, 2, -2),
        descripcion: "Serie icónica de naturalezas muertas",
        esGanador: true
    },
    {
        titulo: "El Nacimiento de Venus",
        artista: "Sandro Botticelli",
        año: "1484-1486",
        textura: "assets/texturas/el_nacimiento_venus.webp",
        tamaño: { ancho: 2.6, alto: 1.8 },
        posicion: new THREE.Vector3(8.9, 2, 2),
        descripcion: "Obra maestra del Renacimiento italiano"
    },
    {
        titulo: "Lirios",
        artista: "Vincent van Gogh",
        año: "1889",
        textura: "assets/texturas/van_gogh_biografia.webp",
        tamaño: { ancho: 2.0, alto: 1.6 },
        posicion: new THREE.Vector3(-8.9, 2, -4),
        descripcion: "Otra obra maestra de Van Gogh"
    },
    
    // Sala 2 - con texturas
    {
        titulo: "Guernica",
        artista: "Pablo Picasso",
        año: "1937",
        textura: "assets/texturas/guernica.webp",
        tamaño: { ancho: 3.5, alto: 1.8 },
        posicion: new THREE.Vector3(0, 2, 17.9),
        descripcion: "Denuncia antibélica del cubismo"
    },
    {
        titulo: "La Capilla Sixtina",
        artista: "Miguel Ángel",
        año: "1512", 
        textura: "assets/texturas/capilla_sixtina.webp",
        tamaño: { ancho: 1.6, alto: 2.0 },
        posicion: new THREE.Vector3(-4, 2, 17.9),
        descripcion: "Obra maestra del Renacimiento"
    },
    {
        titulo: "Van Gogh Autorretrato con Vendaje",
        artista: "Vincent van Gogh",
        año: "1889", 
        textura: "assets/texturas/van_gogh_autorretrato_vendaje.webp",
        tamaño: { ancho: 1.4, alto: 2.2 },
        posicion: new THREE.Vector3(4, 2, 17.9),
        descripcion: "Autorretrato después del incidente de la oreja"
    },
    {
        titulo: "Van Gogh Biografía",
        artista: "Vincent van Gogh",
        año: "1889", 
        textura: "assets/texturas/van_gogh_biografia.webp",
        tamaño: { ancho: 2.4, alto: 1.6 },
        posicion: new THREE.Vector3(-8.9, 2, 14),
        descripcion: "Obra representativa de Van Gogh"
    },
    {
        titulo: "Van Gogh Obra Maestra",
        artista: "Vincent van Gogh",
        año: "1888", 
        textura: "assets/texturas/van_gogh_1.webp",
        tamaño: { ancho: 2.2, alto: 1.8 },
        posicion: new THREE.Vector3(8.9, 2, 14),
        descripcion: "Una de las grandes obras de Van Gogh"
    },
    
    // Cuadros en las paredes del pasillo
    {
        titulo: "La Noche Estrellada Alternativa",
        artista: "Vincent van Gogh",
        año: "1889",
        textura: "assets/texturas/noche_estrellada_2.webp",
        tamaño: { ancho: 1.4, alto: 1.8 },
        posicion: new THREE.Vector3(-1.9, 2, 6),
        descripcion: "Otra versión de la noche estrellada"
    },
    {
        titulo: "Mona Lisa Nueva",
        artista: "Leonardo da Vinci",
        año: "1503",
        textura: "assets/texturas/mona_lisa_new.webp",
        tamaño: { ancho: 1.8, alto: 1.2 },
        posicion: new THREE.Vector3(1.9, 2, 6),
        descripcion: "Una nueva interpretación de la Mona Lisa"
    },
    
    // Cuadros adicionales para completar la galería
    {
        titulo: "Obra Maestra Extra 1",
        artista: "Artista Clásico",
        año: "1800",
        textura: "assets/texturas/cuadro_extra1.webp",
        tamaño: { ancho: 2.0, alto: 1.6 },
        posicion: new THREE.Vector3(-8.9, 2, 16),
        descripcion: "Una obra extraordinaria de arte clásico"
    },
    {
        titulo: "Obra Maestra Extra 2",
        artista: "Maestro Renacentista",
        año: "1650",
        textura: "assets/texturas/cuadro_extra2.webp",
        tamaño: { ancho: 1.8, alto: 2.2 },
        posicion: new THREE.Vector3(8.9, 2, 16),
        descripcion: "Expresión del arte renacentista"
    },
    {
        titulo: "Obra Maestra Extra 3",
        artista: "Pintor Barroco",
        año: "1720",
        textura: "assets/texturas/cuadro_extra3.webp",
        tamaño: { ancho: 1.6, alto: 2.0 },
        posicion: new THREE.Vector3(-6, 2, 17.9),
        descripcion: "Belleza del período barroco"
    },
    {
        titulo: "Obra Maestra Extra 4",
        artista: "Artista Moderno",
        año: "1900",
        textura: "assets/texturas/cuadro_extra4.webp",
        tamaño: { ancho: 2.2, alto: 1.8 },
        posicion: new THREE.Vector3(6, 2, 17.9),
        descripcion: "Innovación del arte moderno"
    },
    {
        titulo: "Obra Maestra Extra 5",
        artista: "Maestro Impresionista",
        año: "1880",
        textura: "assets/texturas/cuadro_extra5.webp",
        tamaño: { ancho: 1.8, alto: 1.6 },
        posicion: new THREE.Vector3(-8.9, 2, 0),
        descripcion: "Luz y color del impresionismo"
    },
    {
        titulo: "Obra Maestra Extra 6",
        artista: "Pintor Contemporáneo",
        año: "1950",
        textura: "assets/texturas/cuadro_extra6.webp",
        tamaño: { ancho: 2.0, alto: 1.8 },
        posicion: new THREE.Vector3(8.9, 2, 0),
        descripcion: "Expresión del arte contemporáneo"
    },
    {
        titulo: "Obra Maestra Extra 7",
        artista: "Maestro Final",
        año: "1920",
        textura: "assets/texturas/cuadro_extra7.webp",
        tamaño: { ancho: 1.6, alto: 1.8 },
        posicion: new THREE.Vector3(-8.9, 2, 4),
        descripcion: "La culminación artística"
    }
];

// ========================
// INICIALIZACIÓN
// ========================

function inicializar() {
    console.log('Iniciando museo corregido...');
    try {
        crearEscena();
        crearCamara();
        crearRenderizador();
        crearMuseoCorregido();
        crearIluminacionSimple();
        
        // Inicializar cargador de texturas
        cargadorTexturas = new THREE.TextureLoader();
        
        crearObrasConTexturas();
        configurarControles();
        configurarEventos();
        
        reloj = new THREE.Clock();
        console.log('Museo corregido inicializado');
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
    escena.fog = new THREE.Fog(0x2a2a2a, 1, 30);
}

function crearCamara() {
    camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camara.position.set(0, 1.6, 4);
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
// CREACIÓN DEL MUSEO CORREGIDO
// ========================

function crearMuseoCorregido() {
    console.log('Construyendo museo sin z-fighting...');
    
    // Materiales
    const materialPared = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
    const materialSuelo = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    const materialTecho = new THREE.MeshLambertMaterial({ color: 0xfafafa });
    
    // ========== SALA 1 ==========
    crearSalaCorregida(0, 0, DIMENSIONES.sala1, materialPared, materialSuelo, materialTecho, true);
    
    // ========== PASILLO ==========
    crearPasilloCorregido(0, 6, DIMENSIONES.pasillo, materialPared, materialSuelo, materialTecho);
    
    // ========== SALA 2 ==========
    crearSalaCorregida(0, 12, DIMENSIONES.sala2, materialPared, materialSuelo, materialTecho, false);
}

function crearSalaCorregida(centroX, centroZ, dimensiones, materialPared, materialSuelo, materialTecho, esPrimera) {
    const { ancho, alto, profundo } = dimensiones;
    
    // Suelo
    const suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, profundo),
        materialSuelo
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.set(centroX, 0.01, centroZ); // Separar ligeramente del Y=0
    escena.add(suelo);
    
    // Techo
    const techo = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, profundo),
        materialTecho
    );
    techo.rotation.x = Math.PI / 2;
    techo.position.set(centroX, alto - 0.01, centroZ); // Separar del tope
    escena.add(techo);
    
    // Pared frontal
    const paredFrontal = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, alto),
        materialPared
    );
    paredFrontal.position.set(centroX, alto / 2, centroZ - profundo / 2 + 0.01);
    escena.add(paredFrontal);
    objetosColision.push({tipo: 'pared', z: centroZ - profundo / 2});
    
    // Pared trasera (con o sin apertura)
    if (esPrimera) {
        // Primera sala - con apertura para pasillo
        const anchoPared = (ancho - DIMENSIONES.pasillo.ancho) / 2;
        
        const paredTraseraIzq = new THREE.Mesh(
            new THREE.PlaneGeometry(anchoPared, alto),
            materialPared
        );
        paredTraseraIzq.position.set(centroX - ancho/2 + anchoPared/2, alto / 2, centroZ + profundo / 2 - 0.01);
        paredTraseraIzq.rotation.y = Math.PI;
        escena.add(paredTraseraIzq);
        
        const paredTraseraDer = new THREE.Mesh(
            new THREE.PlaneGeometry(anchoPared, alto),
            materialPared
        );
        paredTraseraDer.position.set(centroX + ancho/2 - anchoPared/2, alto / 2, centroZ + profundo / 2 - 0.01);
        paredTraseraDer.rotation.y = Math.PI;
        escena.add(paredTraseraDer);
        
        objetosColision.push({tipo: 'pared_parcial', z: centroZ + profundo / 2, x1: -ancho/2, x2: -DIMENSIONES.pasillo.ancho/2});
        objetosColision.push({tipo: 'pared_parcial', z: centroZ + profundo / 2, x1: DIMENSIONES.pasillo.ancho/2, x2: ancho/2});
    } else {
        // Segunda sala - pared completa
        const paredTrasera = new THREE.Mesh(
            new THREE.PlaneGeometry(ancho, alto),
            materialPared
        );
        paredTrasera.position.set(centroX, alto / 2, centroZ + profundo / 2 - 0.01);
        paredTrasera.rotation.y = Math.PI;
        escena.add(paredTrasera);
        objetosColision.push({tipo: 'pared', z: centroZ + profundo / 2});
    }
    
    // Paredes laterales
    const paredIzquierda = new THREE.Mesh(
        new THREE.PlaneGeometry(profundo, alto),
        materialPared
    );
    paredIzquierda.position.set(centroX - ancho / 2 + 0.01, alto / 2, centroZ);
    paredIzquierda.rotation.y = Math.PI / 2;
    escena.add(paredIzquierda);
    objetosColision.push({tipo: 'pared', x: centroX - ancho / 2});
    
    const paredDerecha = new THREE.Mesh(
        new THREE.PlaneGeometry(profundo, alto),
        materialPared
    );
    paredDerecha.position.set(centroX + ancho / 2 - 0.01, alto / 2, centroZ);
    paredDerecha.rotation.y = -Math.PI / 2;
    escena.add(paredDerecha);
    objetosColision.push({tipo: 'pared', x: centroX + ancho / 2});
}

function crearPasilloCorregido(centroX, centroZ, dimensiones, materialPared, materialSuelo, materialTecho) {
    const { ancho, largo, alto } = dimensiones;
    
    // Suelo
    const suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, largo),
        materialSuelo
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.set(centroX, 0.01, centroZ);
    escena.add(suelo);
    
    // Techo
    const techo = new THREE.Mesh(
        new THREE.PlaneGeometry(ancho, largo),
        materialTecho
    );
    techo.rotation.x = Math.PI / 2;
    techo.position.set(centroX, alto - 0.01, centroZ);
    escena.add(techo);
    
    // Paredes laterales
    const paredIzquierda = new THREE.Mesh(
        new THREE.PlaneGeometry(largo, alto),
        materialPared
    );
    paredIzquierda.position.set(centroX - ancho / 2 + 0.01, alto / 2, centroZ);
    paredIzquierda.rotation.y = Math.PI / 2;
    escena.add(paredIzquierda);
    objetosColision.push({tipo: 'pared', x: centroX - ancho / 2});
    
    const paredDerecha = new THREE.Mesh(
        new THREE.PlaneGeometry(largo, alto),
        materialPared
    );
    paredDerecha.position.set(centroX + ancho / 2 - 0.01, alto / 2, centroZ);
    paredDerecha.rotation.y = -Math.PI / 2;
    escena.add(paredDerecha);
    objetosColision.push({tipo: 'pared', x: centroX + ancho / 2});
}

// ========================
// ILUMINACIÓN SIMPLE
// ========================

function crearIluminacionSimple() {
    // Luz ambiental
    const luzAmbiental = new THREE.AmbientLight(0x404040, 0.5);
    escena.add(luzAmbiental);
    
    // Luz principal
    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 1.0);
    luzPrincipal.position.set(5, DIMENSIONES.sala1.alto, 5);
    escena.add(luzPrincipal);
    
    // Luz para sala 2
    const luzSala2 = new THREE.DirectionalLight(0xffffff, 1.0);
    luzSala2.position.set(0, DIMENSIONES.sala2.alto, 12);
    escena.add(luzSala2);
}

// ========================
// CREACIÓN DE OBRAS CON TEXTURAS
// ========================

function crearObrasConTexturas() {
    console.log('Cargando obras de arte...');
    
    obrasDeArte.forEach((obra, indice) => {
        if (obra.textura) {
            crearObraConTextura(obra, indice);
        } else {
            crearObraConColor(obra, indice);
        }
    });
}

function crearObraConTextura(datos, indice) {
    // Cargar textura
    cargadorTexturas.load(
        datos.textura,
        function(textura) {
            // Textura cargada exitosamente
            console.log(`Textura cargada: ${datos.titulo}`);
            
            // Crear el grupo de la obra
            const grupoObra = new THREE.Group();
            
            // Marco con brillo especial si es ganador o es Van Gogh
            const esVanGogh = datos.artista === "Vincent van Gogh";
            const colorMarco = (datos.esGanador || esVanGogh) ? 0xffd700 : 0x8b4513;
            const marco = new THREE.Mesh(
                new THREE.BoxGeometry(datos.tamaño.ancho + 0.2, datos.tamaño.alto + 0.2, 0.1),
                new THREE.MeshLambertMaterial({ color: colorMarco })
            );
            marco.position.copy(datos.posicion);
            grupoObra.add(marco);
            
            // Marco interno dorado más brillante para Van Gogh o ganador
            if (esVanGogh || datos.esGanador) {
                // Marco interno dorado más brillante
                const marcoInterno = new THREE.Mesh(
                    new THREE.BoxGeometry(datos.tamaño.ancho + 0.15, datos.tamaño.alto + 0.15, 0.12),
                    new THREE.MeshLambertMaterial({ 
                        color: 0xffdf00,
                        emissive: 0x443300
                    })
                );
                marcoInterno.position.copy(datos.posicion);
                marcoInterno.position.z += 0.01;
                grupoObra.add(marcoInterno);
            }
            
            // Pintura con textura real
            const pintura = new THREE.Mesh(
                new THREE.PlaneGeometry(datos.tamaño.ancho, datos.tamaño.alto),
                new THREE.MeshLambertMaterial({ 
                    map: textura,
                    transparent: false
                })
            );
            pintura.position.copy(datos.posicion);
            pintura.position.z += 0.06;
            grupoObra.add(pintura);
            
            // Guardar referencia si es cuadro ganador
            if (datos.esGanador) {
                cuadroGanador = grupoObra;
            }
            
            // Placa informativa
            const placa = new THREE.Mesh(
                new THREE.PlaneGeometry(datos.tamaño.ancho * 0.8, 0.3),
                new THREE.MeshLambertMaterial({ color: 0x2d2d2d })
            );
            placa.position.copy(datos.posicion);
            placa.position.y -= (datos.tamaño.alto / 2) + 0.4;
            placa.position.z += 0.02;
            grupoObra.add(placa);
            
            // Agregar a lista de meshes para colisión
            meshCuadros.push({
                grupo: grupoObra,
                datos: datos,
                posicion: datos.posicion.clone()
            });
            
            escena.add(grupoObra);
        },
        function(progreso) {
            // Progreso de carga
            console.log(`Cargando ${datos.titulo}: ${(progreso.loaded / progreso.total * 100)}%`);
        },
        function(error) {
            // Error cargando textura - usar color de respaldo
            console.warn(`Error cargando ${datos.titulo}, usando color sólido:`, error);
            crearObraConColor({...datos, color: 0x8b7355}, indice);
        }
    );
}

function crearObraConColor(datos, indice) {
    const grupoObra = new THREE.Group();
    
    // Marco con brillo especial si es ganador o es Van Gogh
    const esVanGogh = datos.artista === "Vincent van Gogh";
    const colorMarco = (datos.esGanador || esVanGogh) ? 0xffd700 : 0x8b4513;
    const marco = new THREE.Mesh(
        new THREE.BoxGeometry(datos.tamaño.ancho + 0.2, datos.tamaño.alto + 0.2, 0.1),
        new THREE.MeshLambertMaterial({ color: colorMarco })
    );
    marco.position.copy(datos.posicion);
    grupoObra.add(marco);
    
    // Marco interno dorado más brillante para Van Gogh
    if (esVanGogh || datos.esGanador) {
        // Marco interno dorado más brillante
        const marcoInterno = new THREE.Mesh(
            new THREE.BoxGeometry(datos.tamaño.ancho + 0.15, datos.tamaño.alto + 0.15, 0.12),
            new THREE.MeshLambertMaterial({ 
                color: 0xffdf00,
                emissive: 0x443300
            })
        );
        marcoInterno.position.copy(datos.posicion);
        marcoInterno.position.z += 0.01;
        grupoObra.add(marcoInterno);
    }
    
    // Pintura con color sólido
    const pintura = new THREE.Mesh(
        new THREE.PlaneGeometry(datos.tamaño.ancho, datos.tamaño.alto),
        new THREE.MeshLambertMaterial({ color: datos.color })
    );
    pintura.position.copy(datos.posicion);
    pintura.position.z += 0.06;
    grupoObra.add(pintura);
    
    // Guardar referencia si es cuadro ganador
    if (datos.esGanador) {
        cuadroGanador = grupoObra;
    }
    
    // Placa
    const placa = new THREE.Mesh(
        new THREE.PlaneGeometry(datos.tamaño.ancho * 0.8, 0.3),
        new THREE.MeshLambertMaterial({ color: 0x2d2d2d })
    );
    placa.position.copy(datos.posicion);
    placa.position.y -= (datos.tamaño.alto / 2) + 0.4;
    placa.position.z += 0.02;
    grupoObra.add(placa);
    
    // Agregar a lista de meshes para colisión
    meshCuadros.push({
        grupo: grupoObra,
        datos: datos,
        posicion: datos.posicion.clone()
    });
    
    escena.add(grupoObra);
}

// ========================
// CONTROLES
// ========================

function configurarControles() {
    const bloqueador = document.getElementById('bloqueador');
    const botonIniciar = document.getElementById('botonIniciar');
    
    botonIniciar.addEventListener('click', function() {
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
    document.addEventListener('keydown', function(evento) {
        teclasPulsadas[evento.code] = true;
    });
    
    document.addEventListener('keyup', function(evento) {
        teclasPulsadas[evento.code] = false;
    });
    
    // Mouse - SIMPLIFICADO Y CORREGIDO
    document.addEventListener('mousemove', function(evento) {
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
    window.addEventListener('resize', function() {
        camara.aspect = window.innerWidth / window.innerHeight;
        camara.updateProjectionMatrix();
        renderizador.setSize(window.innerWidth, window.innerHeight);
    });
}

// ========================
// MOVIMIENTO CORREGIDO
// ========================

function actualizarMovimiento(tiempoDelta) {
    if (juegoTerminado) return;
    
    const velocidad = velocidadMovimiento * tiempoDelta;
    const direccion = new THREE.Vector3();
    
    // Obtener dirección de entrada CORREGIDA
    if (teclasPulsadas['KeyW']) direccion.z = -1;  // Forward
    if (teclasPulsadas['KeyS']) direccion.z = 1; // Backward  
    if (teclasPulsadas['KeyA']) direccion.x = -1;  // Left
    if (teclasPulsadas['KeyD']) direccion.x = 1; // Right
    
    if (direccion.length() === 0) return; // No hay movimiento
    
    direccion.normalize();
    
    // Aplicar rotación Y (horizontal) a la dirección - CORREGIDO
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
    verificarVictoria();
}

function verificarColisiones(nuevaPosicion) {
    const margen = 0.5;
    
    // Límites generales del museo
    if (nuevaPosicion.x < -9 + margen || nuevaPosicion.x > 9 - margen) return false;
    if (nuevaPosicion.z < -6 + margen || nuevaPosicion.z > 18 - margen) return false;
    
    // Límites del pasillo
    if (nuevaPosicion.z > 2 + margen && nuevaPosicion.z < 10 - margen) {
        if (nuevaPosicion.x < -2 + margen || nuevaPosicion.x > 2 - margen) {
            return false;
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
    
    if (distancia < 3.0) { // Distancia de activación aumentada
        console.log('¡Victoria detectada!');
        mostrarVictoria(cuadroGanadorData.datos);
    }
}

function mostrarVictoria(datosObra) {
    console.log('Mostrando pantalla de victoria');
    juegoTerminado = true;
    
    // LIBERAR EL MOUSE INMEDIATAMENTE
    if (document.exitPointerLock) {
        document.exitPointerLock();
    }
    
    // Crear overlay de victoria
    const overlayVictoria = document.createElement('div');
    overlayVictoria.id = 'overlayVictoria';
    
    const tituloObra = datosObra ? datosObra.titulo : "Los Girasoles";
    const artistaObra = datosObra ? datosObra.artista : "Vincent van Gogh";
    
    overlayVictoria.innerHTML = `
        <div id="menuVictoria">
            <h1>🎉 ¡FELICIDADES! 🎉</h1>
            <h2>¡Has ganado el juego!</h2>
            <p>Encontraste la obra maestra: "${tituloObra}" de ${artistaObra}</p>
            <button id="botonReiniciar">Volver a Jugar</button>
            <button id="botonSalir">Salir</button>
        </div>
    `;
    
    // Estilos del overlay
    overlayVictoria.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Arial', sans-serif;
        cursor: default;
    `;
    
    // Estilos del menú
    const menuVictoria = overlayVictoria.querySelector('#menuVictoria');
    menuVictoria.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        animation: pulse 2s infinite;
        cursor: default;
    `;
    
    // Agregar animación CSS
    const estilo = document.createElement('style');
    estilo.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(estilo);
    
    document.body.appendChild(overlayVictoria);
    
    // CONFIGURAR BOTONES CON MEJOR DETECCIÓN
    setTimeout(() => {
        const botonReiniciar = document.getElementById('botonReiniciar');
        const botonSalir = document.getElementById('botonSalir');
        
        if (botonReiniciar) {
            botonReiniciar.style.cssText = `
                background: #4CAF50;
                color: white;
                border: none;
                padding: 15px 30px;
                margin: 10px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                outline: none;
            `;
            
            botonReiniciar.addEventListener('mouseenter', () => {
                botonReiniciar.style.transform = 'scale(1.1)';
                botonReiniciar.style.background = '#45a049';
            });
            
            botonReiniciar.addEventListener('mouseleave', () => {
                botonReiniciar.style.transform = 'scale(1)';
                botonReiniciar.style.background = '#4CAF50';
            });
            
            botonReiniciar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón Reiniciar clickeado');
                reiniciarJuego();
            });
        }
        
        if (botonSalir) {
            botonSalir.style.cssText = `
                background: #f44336;
                color: white;
                border: none;
                padding: 15px 30px;
                margin: 10px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                outline: none;
            `;
            
            botonSalir.addEventListener('mouseenter', () => {
                botonSalir.style.transform = 'scale(1.1)';
                botonSalir.style.background = '#da190b';
            });
            
            botonSalir.addEventListener('mouseleave', () => {
                botonSalir.style.transform = 'scale(1)';
                botonSalir.style.background = '#f44336';
            });
            
            botonSalir.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón Salir clickeado');
                const overlay = document.getElementById('overlayVictoria');
                if (overlay) overlay.remove();
                document.getElementById('bloqueador').style.display = 'flex';
            });
        }
    }, 100);
}

function reiniciarJuego() {
    console.log('Reiniciando juego...');
    
    // Remover overlay
    const overlay = document.getElementById('overlayVictoria');
    if (overlay) overlay.remove();
    
    // Resetear variables
    juegoTerminado = false;
    
    // Resetear posición del jugador
    camara.position.set(0, 1.6, 4);
    rotacionX = 0;
    rotacionY = 0;
    camara.rotation.set(0, 0, 0);
    
    // SOLICITAR POINTER LOCK NUEVAMENTE para continuar jugando
    setTimeout(() => {
        const elemento = document.body;
        elemento.requestPointerLock = elemento.requestPointerLock || 
                                    elemento.mozRequestPointerLock || 
                                    elemento.webkitRequestPointerLock;
        
        if (elemento.requestPointerLock) {
            elemento.requestPointerLock();
        }
        
        // Ocultar bloqueador
        document.getElementById('bloqueador').style.display = 'none';
    }, 200);
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
    
    renderizador.render(escena, camara);
}

// ========================
// INICIO
// ========================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando museo corregido...');
    if (typeof THREE === 'undefined') {
        console.error('Three.js no cargado');
        return;
    }
    inicializar();
});

if (document.readyState !== 'loading') {
    inicializar();
}