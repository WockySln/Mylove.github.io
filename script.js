// Base de datos de canciones y playlist
let songsDatabase = {};
let playlist = [];
let songs = [];
let isLoaded = false; // Variable para evitar cargas duplicadas
let galleryLoaded = false; // Variable para evitar cargas duplicadas de galería

// Gradientes para álbumes sin imagen
const albumGradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #ff9a9e, #fecfef)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)'
];

// Elementos del DOM
const albumCover = document.getElementById("album-cover");
const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const playPauseBtn = document.querySelector(".play-pause");
const progressBar = document.querySelector(".progress-bar");
const progress = document.querySelector(".progress");
const progressThumb = document.querySelector(".progress-thumb");
const currentTime = document.getElementById("current-time");
const totalTime = document.getElementById("total-time");
const playIcon = document.querySelector(".play-icon");
const body = document.body;
const shuffleBtn = document.querySelector(".shuffle");
const repeatBtn = document.querySelector(".repeat, .fa-redo");
const loadingIndicator = document.getElementById("loading-indicator");

// Elementos adicionales de la barra inferior
const deviceBtn = document.querySelector(".footer .fa-tv");
const playlistBtn = document.querySelector(".footer .fa-list-ul");
const volumeBtn = document.querySelector(".footer .fa-volume-up");

// Variables de estado
let currentSongIndex = 0;
let isPlaying = false;
let currentTimeSeconds = 0;
let isDragging = false;
let currentAudio = null;
let isShuffled = false;
let isRepeating = false;
let shuffledPlaylist = [];
let currentVolume = 1;
let isMuted = false;

// Variables para animaciones románticas
let heartAnimationTimer = null;
let bubbleAnimationTimer = null;

// Arrays para medios encontrados automáticamente
let foundPhotos = [];
let foundVideos = [];

// Extensiones de archivos soportadas
const photoExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];

// Función para activar animaciones románticas cuando se reproduce
function activateRomanticAnimations() {
    // Activar animación de respiración en el album cover
    albumCover.classList.add('playing');
    
    // Crear corazones dinámicos cada 3 segundos
    if (heartAnimationTimer) clearInterval(heartAnimationTimer);
    heartAnimationTimer = setInterval(() => {
        createFloatingHeart();
    }, 3000);
    
    // Crear burbujas extra cada 2 segundos
    if (bubbleAnimationTimer) clearInterval(bubbleAnimationTimer);
    bubbleAnimationTimer = setInterval(() => {
        createExtraBubble();
    }, 2000);
}

// Función para desactivar animaciones románticas cuando se pausa
function deactivateRomanticAnimations() {
    // Desactivar animación de respiración en el album cover
    albumCover.classList.remove('playing');
    
    // Limpiar timers
    if (heartAnimationTimer) {
        clearInterval(heartAnimationTimer);
        heartAnimationTimer = null;
    }
    
    if (bubbleAnimationTimer) {
        clearInterval(bubbleAnimationTimer);
        bubbleAnimationTimer = null;
    }
}

// Función para crear corazones flotantes dinámicos
function createFloatingHeart() {
    if (!isPlaying) return;
    
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    const heart = document.createElement('div');
    heart.className = 'heart dynamic-heart';
    heart.innerHTML = ['💖', '💗', '💕', '💘', '💝'][Math.floor(Math.random() * 5)];
    
    // Posición aleatoria
    heart.style.left = Math.random() * 80 + 10 + '%';
    heart.style.top = Math.random() * 70 + 15 + '%';
    heart.style.fontSize = Math.random() * 10 + 12 + 'px';
    heart.style.animationDelay = '0s';
    heart.style.animationDuration = Math.random() * 1 + 1.5 + 's';
    
    screen.appendChild(heart);
    
    // Remover después de la animación
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 3000);
}

// Función para crear burbujas extra
function createExtraBubble() {
    if (!isPlaying) return;
    
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble dynamic-bubble';
    
    // Tamaño aleatorio
    const size = Math.random() * 8 + 4;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 90 + 5 + '%';
    bubble.style.bottom = '-20px';
    bubble.style.animationDelay = '0s';
    bubble.style.animationDuration = Math.random() * 3 + 5 + 's';
    
    screen.appendChild(bubble);
    
    // Remover después de la animación
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
    }, 8000);
}

// Función para crear efecto de explosión de corazones al cambiar canción
function createHeartExplosion() {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '💖';
            heart.style.position = 'absolute';
            heart.style.left = '50%';
            heart.style.top = '50%';
            heart.style.fontSize = '20px';
            heart.style.color = 'rgba(255, 182, 193, 0.8)';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '5';
            heart.style.transform = 'translate(-50%, -50%)';
            
            // Animación de explosión
            const angle = (i / 8) * 2 * Math.PI;
            const distance = 100;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            heart.style.animation = `heart-explosion 1s ease-out forwards`;
            heart.style.setProperty('--end-x', endX + 'px');
            heart.style.setProperty('--end-y', endY + 'px');
            
            screen.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 1000);
        }, i * 100);
    }
}

// Función para resetear las bases de datos
function resetSongsData() {
    songsDatabase = {};
    playlist = [];
    songs = [];
    currentSongIndex = 0;
    isLoaded = false;
}

// Función para cargar canciones desde songs.json
async function loadSongsFromJSON() {
    // Evitar cargas duplicadas
    if (isLoaded) {
        console.log('Las canciones ya están cargadas, saltando...');
        return true;
    }
    
    try {
        showLoadingIndicator(true);
        console.log('Cargando canciones desde songs.json...');
        
        // Resetear datos antes de cargar
        resetSongsData();
        
        const response = await fetch('./songs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const songsData = await response.json();
        
        // Verificar que el archivo tenga el formato correcto
        if (!songsData.songs || !Array.isArray(songsData.songs)) {
            throw new Error('Formato de archivo JSON inválido');
        }
        
        // Procesar cada canción
        for (let i = 0; i < songsData.songs.length; i++) {
            const songData = songsData.songs[i];
            
            // Validar datos mínimos requeridos
            if (!songData.id || !songData.audioFile) {
                console.warn(`Canción en índice ${i} no tiene id o audioFile, saltando...`);
                continue;
            }
            
            // Verificar que no esté ya agregada
            if (songsDatabase[songData.id]) {
                console.warn(`Canción ${songData.id} ya existe, saltando...`);
                continue;
            }
            
            // Verificar que el archivo de audio existe
            const audioExists = await checkFileExists(songData.audioFile);
            if (!audioExists) {
                console.warn(`Archivo de audio no encontrado: ${songData.audioFile}`);
                continue;
            }
            
            // Crear objeto de canción
            const songInfo = {
                id: songData.id,
                title: songData.title || songData.id,
                artist: songData.artist || "Artista Desconocido",
                audioUrl: songData.audioFile,
                imageUrl: null,
                gradient: albumGradients[i % albumGradients.length],
                colors: songData.colors || ["#667eea", "#764ba2"]
            };
            
            // Verificar imagen de portada si está especificada
            if (songData.coverImage) {
                const imageExists = await checkFileExists(songData.coverImage);
                if (imageExists) {
                    songInfo.imageUrl = songData.coverImage;
                }
            }
            
            // Agregar a las bases de datos
            songsDatabase[songData.id] = songInfo;
            playlist.push(songData.id);
            
            // Crear objeto compatible con el reproductor
            const song = {
                title: songInfo.title,
                artist: songInfo.artist,
                cover: songInfo.imageUrl || 'https://via.placeholder.com/500x500/667eea/ffffff?text=Sin+Imagen',
                colors: songInfo.colors,
                audioSrc: songInfo.audioUrl,
                duration: 0,
                id: songData.id
            };
            songs.push(song);
        }
        
        console.log(`Cargadas ${songs.length} canciones exitosamente`);
        showLoadingIndicator(false);
        
        if (songs.length > 0) {
            isLoaded = true; // Marcar como cargado
            loadSong(0);
            return true;
        } else {
            showError("No se encontraron canciones válidas", "Verifica el archivo songs.json y los archivos de audio");
            return false;
        }
        
    } catch (error) {
        console.error('Error cargando canciones:', error);
        showLoadingIndicator(false);
        isLoaded = false; // Permitir reintentos en caso de error
        
        if (error.message.includes('404')) {
            showError("Archivo songs.json no encontrado", "Crea el archivo songs.json con la información de tus canciones");
        } else {
            showError("Error al cargar música", error.message);
        }
        return false;
    }
}

// Función para verificar si un archivo existe
async function checkFileExists(filename) {
    try {
        const response = await fetch(filename, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Función para mostrar errores
function showError(title, message) {
    if (songTitle) songTitle.textContent = title;
    if (artistName) artistName.textContent = message;
    if (albumCover) albumCover.src = 'https://via.placeholder.com/500x500/ff6b6b/ffffff?text=Error';
}

// Función para mostrar/ocultar indicador de carga
function showLoadingIndicator(show) {
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
}

// Función para cargar la canción actual
function loadSong(index) {
    if (!songs[index]) return;
    
    const song = songs[index];
    console.log(`Cargando canción: ${song.title}`);

    // Crear explosión de corazones al cambiar canción
    if (currentSongIndex !== index) {
        createHeartExplosion();
    }

    if (albumCover) albumCover.src = song.cover;
    if (songTitle) songTitle.textContent = song.title;
    if (artistName) artistName.textContent = song.artist;

    // Cambiar el fondo degradado
    if (body) body.style.background = `linear-gradient(135deg, ${song.colors[0]}, ${song.colors[1]})`;

    // Reiniciar la animación del título
    if (songTitle) {
        songTitle.style.animation = "none";
        setTimeout(() => {
            songTitle.style.animation = "moveTitle 10s linear infinite";
        }, 10);
    }

    // Cargar el audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio(song.audioSrc);
    currentAudio.volume = currentVolume; // Establecer volumen
    
    // Eventos del audio
    currentAudio.addEventListener('loadedmetadata', () => {
        song.duration = currentAudio.duration;
        if (totalTime) totalTime.textContent = formatTime(song.duration);
        console.log(`Duración de ${song.title}: ${song.duration}s`);
    });

    currentAudio.addEventListener('timeupdate', () => {
        if (!isDragging && currentAudio) {
            currentTimeSeconds = currentAudio.currentTime;
            const percentage = (currentTimeSeconds / song.duration) * 100;
            updateProgressBar(percentage);
        }
    });

    currentAudio.addEventListener('ended', () => {
        if (isRepeating) {
            currentAudio.currentTime = 0;
            currentAudio.play();
        } else {
            nextSong();
        }
    });

    currentAudio.addEventListener('error', (e) => {
        console.error('Error cargando el audio:', song.audioSrc, e);
        if (albumCover) albumCover.src = 'https://via.placeholder.com/500x500/ff6b6b/ffffff?text=Error+Audio';
        showError("Error al cargar audio", `No se pudo cargar: ${song.audioSrc}`);
    });

    // Reiniciar la barra de progreso
    if (progress) progress.style.width = "0%";
    if (progressThumb) progressThumb.style.left = "0%";
    currentTimeSeconds = 0;
    if (currentTime) currentTime.textContent = "0:00";
    if (totalTime) totalTime.textContent = "0:00";
}

// Función para formatear el tiempo (segundos a mm:ss)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Función para actualizar la barra de progreso
function updateProgressBar(percentage) {
    if (isNaN(percentage)) percentage = 0;
    if (progress) progress.style.width = `${percentage}%`;
    if (progressThumb) progressThumb.style.left = `${percentage}%`;
    if (currentTime) currentTime.textContent = formatTime(currentTimeSeconds);
}

// Función para mezclar playlist
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Función para obtener el siguiente índice
function getNextIndex() {
    if (isShuffled) {
        const currentShuffledIndex = shuffledPlaylist.indexOf(currentSongIndex);
        const nextShuffledIndex = (currentShuffledIndex + 1) % shuffledPlaylist.length;
        return shuffledPlaylist[nextShuffledIndex];
    } else {
        return (currentSongIndex + 1) % songs.length;
    }
}

// Función para obtener el índice anterior
function getPrevIndex() {
    if (isShuffled) {
        const currentShuffledIndex = shuffledPlaylist.indexOf(currentSongIndex);
        const prevShuffledIndex = (currentShuffledIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
        return shuffledPlaylist[prevShuffledIndex];
    } else {
        return (currentSongIndex - 1 + songs.length) % songs.length;
    }
}

// Función para pasar a la siguiente canción
function nextSong() {
    currentSongIndex = getNextIndex();
    loadSong(currentSongIndex);
    if (isPlaying) {
        setTimeout(() => {
            if (currentAudio) currentAudio.play();
        }, 100);
    }
}

// Función para pasar a la canción anterior
function prevSong() {
    currentSongIndex = getPrevIndex();
    loadSong(currentSongIndex);
    if (isPlaying) {
        setTimeout(() => {
            if (currentAudio) currentAudio.play();
        }, 100);
    }
}

// Función para alternar shuffle
function toggleShuffle() {
    isShuffled = !isShuffled;
    if (shuffleBtn) shuffleBtn.classList.toggle('active', isShuffled);
    
    if (isShuffled) {
        shuffledPlaylist = shuffleArray([...Array(songs.length).keys()]);
    }
    console.log('Shuffle:', isShuffled ? 'ON' : 'OFF');
}

// Función para alternar repeat
function toggleRepeat() {
    isRepeating = !isRepeating;
    
    // Buscar el botón de repeat de diferentes maneras
    const repeatButton = document.querySelector(".repeat") || document.querySelector(".controls .fa-redo")?.parentElement;
    const repeatIcon = document.querySelector(".controls .fa-redo");
    
    if (repeatButton) {
        repeatButton.classList.toggle('active', isRepeating);
    }
    
    if (repeatIcon) {
        repeatIcon.style.color = isRepeating ? '#1DB954' : '';
        repeatIcon.style.transform = isRepeating ? 'scale(1.1)' : '';
    }
    
    console.log('Repeat:', isRepeating ? 'ON' : 'OFF');
}

// Función para alternar volumen/mute
function toggleMute() {
    if (currentAudio) {
        isMuted = !isMuted;
        currentAudio.volume = isMuted ? 0 : currentVolume;
        
        // Cambiar icono
        if (volumeBtn) {
            if (isMuted) {
                volumeBtn.className = 'fas fa-volume-mute';
            } else {
                volumeBtn.className = 'fas fa-volume-up';
            }
        }
        
        console.log('Mute:', isMuted ? 'ON' : 'OFF');
    }
}

// Función para mostrar información de dispositivos
function showDeviceInfo() {
    alert('Reproduciendo en: Dispositivo Local\n\nEsta función simulada muestra los dispositivos disponibles para reproducir música.');
}

// Función para mostrar playlist
function showPlaylist() {
    let playlistInfo = 'Lista de Reproducción:\n\n';
    songs.forEach((song, index) => {
        const isCurrentSong = index === currentSongIndex;
        playlistInfo += `${isCurrentSong ? '► ' : ''}${song.title} - ${song.artist}\n`;
    });
    
    if (songs.length === 0) {
        playlistInfo = 'No hay canciones en la playlist';
    }
    
    alert(playlistInfo);
}

// ============================================
// FUNCIONES DE GALERÍA DE RECUERDOS
// ============================================

// Función para buscar archivos multimedia automáticamente
async function searchForMediaFiles() {
    console.log('🔍 Buscando archivos multimedia...');
    
    // Resetear arrays
    foundPhotos = [];
    foundVideos = [];
    
    // Nombres de archivos comunes para probar
    const commonMediaNames = [
        // Fotos
        'foto1', 'foto2', 'foto3', 'foto4', 'foto5',
        'imagen1', 'imagen2', 'imagen3', 'imagen4', 'imagen5',
        'pic1', 'pic2', 'pic3', 'pic4', 'pic5',
        'photo1', 'photo2', 'photo3', 'photo4', 'photo5',
        'recuerdo1', 'recuerdo2', 'recuerdo3',
        'momento1', 'momento2', 'momento3',
        'nosotros1', 'nosotros2', 'nosotros3',
        'juntos1', 'juntos2', 'juntos3',
        'amor1', 'amor2', 'amor3',
        'primera_cita', 'cumpleanos', 'aniversario',
        'viaje', 'playa', 'cena', 'flores'
    ];
    
    // Buscar fotos
    for (const baseName of commonMediaNames) {
        for (const ext of photoExtensions) {
            const filename = `${baseName}${ext}`;
            const exists = await checkFileExists(filename);
            if (exists) {
                foundPhotos.push({
                    file: filename,
                    title: generatePhotoTitle(baseName),
                    emoji: getRandomEmoji('photo')
                });
                console.log(`📸 Foto encontrada: ${filename}`);
            }
        }
    }
    
    // Buscar videos
    for (const baseName of commonMediaNames) {
        for (const ext of videoExtensions) {
            const filename = `${baseName}${ext}`;
            const exists = await checkFileExists(filename);
            if (exists) {
                foundVideos.push({
                    file: filename,
                    title: generateVideoTitle(baseName),
                    emoji: getRandomEmoji('video')
                });
                console.log(`🎥 Video encontrado: ${filename}`);
            }
        }
    }
    
    console.log(`✅ Búsqueda completada: ${foundPhotos.length} fotos, ${foundVideos.length} videos`);
}

// Función para generar títulos románticos para fotos
function generatePhotoTitle(baseName) {
    const photoTitles = {
        'foto1': 'Nuestro primer momento',
        'foto2': 'Sonrisas compartidas',
        'foto3': 'Recuerdo especial',
        'foto4': 'Momento perfecto',
        'foto5': 'Dulces memorias',
        'imagen1': 'Capturando amor',
        'imagen2': 'Instante mágico',
        'pic1': 'Snapshot de felicidad',
        'pic2': 'Momento candid',
        'photo1': 'Primera fotografía',
        'photo2': 'Segundo momento',
        'recuerdo1': 'Memoria del corazón',
        'momento1': 'Instante especial',
        'nosotros1': 'Somos nosotros',
        'juntos1': 'Unidos en amor',
        'amor1': 'Puro amor',
        'primera_cita': 'Nuestra primera cita',
        'cumpleanos': 'Celebrando juntos',
        'aniversario': 'Nuestro aniversario',
        'viaje': 'Aventura juntos',
        'playa': 'Día en la playa',
        'cena': 'Cena romántica',
        'flores': 'Flores para ti'
    };
    
    return photoTitles[baseName] || `Recuerdo de ${baseName}`;
}

// Función para generar títulos románticos para videos
function generateVideoTitle(baseName) {
    const videoTitles = {
        'video1': 'Nuestro primer video',
        'video2': 'Momentos en movimiento',
        'vid1': 'Clip especial',
        'movie1': 'Nuestra película',
        'momentos': 'Momentos preciados',
        'recuerdos_video': 'Video de recuerdos',
        'baile': 'Bailando contigo',
        'karaoke': 'Cantando juntos',
        'declaracion': 'Declaración de amor'
    };
    
    return videoTitles[baseName] || `Video de ${baseName}`;
}

// Función para obtener emoji aleatorio
function getRandomEmoji(type) {
    const photoEmojis = ['💕', '💖', '💗', '💘', '💝', '❤️', '💜', '💙', '💚', '💛', '🧡', '🌹', '🌺', '🌸', '🌼', '🌻', '🌷', '💑', '👫', '💏', '💋', '🤗', '🥰', '😍'];
    const videoEmojis = ['🎥', '🎬', '📹', '🎞️', '📽️', '🎵', '🎶', '🎤', '🎸', '💃', '🕺'];
    
    const emojis = type === 'photo' ? photoEmojis : videoEmojis;
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// Función para cargar contenido de galería
async function loadGalleryContent() {
    if (galleryLoaded) return; // Evitar cargas duplicadas
    
    try {
        console.log('📂 Cargando galería de recuerdos...');
        
        // Intentar cargar desde infomedia.json primero
        let photosData = [];
        let videosData = [];
        
        try {
            const response = await fetch('./infomedia.json');
            if (response.ok) {
                const mediaInfo = await response.json();
                
                // Verificar que los archivos existen y cargar info
                if (mediaInfo.photos) {
                    for (const photo of mediaInfo.photos) {
                        const exists = await checkFileExists(photo.file);
                        if (exists) {
                            photosData.push({
                                file: photo.file,
                                title: photo.title,
                                description: photo.description || '',
                                date: photo.date || '',
                                location: photo.location || '',
                                emoji: photo.emoji || '💕'
                            });
                        }
                    }
                }
                
                if (mediaInfo.videos) {
                    for (const video of mediaInfo.videos) {
                        const exists = await checkFileExists(video.file);
                        if (exists) {
                            videosData.push({
                                file: video.file,
                                title: video.title,
                                description: video.description || '',
                                date: video.date || '',
                                location: video.location || '',
                                emoji: video.emoji || '🎥'
                            });
                        }
                    }
                }
                
                console.log('✅ Información cargada desde infomedia.json');
            } else {
                throw new Error('infomedia.json no encontrado');
            }
        } catch (error) {
            console.log('⚠️ infomedia.json no disponible, usando búsqueda automática...');
            
            // Fallback: usar búsqueda automática
            await searchForMediaFiles();
            photosData = foundPhotos;
            videosData = foundVideos;
        }
        
        // Cargar fotos
        const photosGrid = document.getElementById('photos-grid');
        if (photosGrid) {
            photosGrid.innerHTML = '';
            
            if (photosData.length > 0) {
                photosData.forEach(photo => {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'gallery-item';
                    photoItem.innerHTML = `
                        <img src="./${photo.file}" alt="${photo.title}" loading="lazy" onerror="this.style.display='none'">
                        <div class="memory-info">
                            <p class="memory-title">${photo.title} ${photo.emoji}</p>
                            ${photo.description ? `<p class="memory-description">${photo.description}</p>` : ''}
                            ${photo.date ? `<p class="memory-date">📅 ${photo.date}</p>` : ''}
                            ${photo.location ? `<p class="memory-location">📍 ${photo.location}</p>` : ''}
                        </div>
                    `;
                    photosGrid.appendChild(photoItem);
                });
            } else {
                photosGrid.innerHTML = '<div class="gallery-placeholder"><p>📸 No se encontraron fotos</p><small>Agrega archivos y configura infomedia.json</small></div>';
            }
        }
        
        // Cargar videos
        const videosGrid = document.getElementById('videos-grid');
        if (videosGrid) {
            videosGrid.innerHTML = '';
            
            if (videosData.length > 0) {
                videosData.forEach(video => {
                    const videoItem = document.createElement('div');
                    videoItem.className = 'gallery-item video-item';
                    videoItem.innerHTML = `
                        <video controls>
                            <source src="./${video.file}" type="video/mp4">
                            Tu navegador no soporta videos.
                        </video>
                        <div class="memory-info">
                            <p class="memory-title">${video.title} ${video.emoji}</p>
                            ${video.description ? `<p class="memory-description">${video.description}</p>` : ''}
                            ${video.date ? `<p class="memory-date">📅 ${video.date}</p>` : ''}
                            ${video.location ? `<p class="memory-location">📍 ${video.location}</p>` : ''}
                        </div>
                    `;
                    videosGrid.appendChild(videoItem);
                });
            } else {
                videosGrid.innerHTML = '<div class="gallery-placeholder"><p>🎥 No se encontraron videos</p><small>Agrega archivos y configura infomedia.json</small></div>';
            }
        }
        
        galleryLoaded = true;
        console.log(`✅ Galería cargada: ${photosData.length} fotos, ${videosData.length} videos`);
        
    } catch (error) {
        console.error('Error cargando galería:', error);
        
        const photosGrid = document.getElementById('photos-grid');
        const videosGrid = document.getElementById('videos-grid');
        
        if (photosGrid) {
            photosGrid.innerHTML = '<div class="gallery-placeholder"><p>📸 Error cargando fotos</p></div>';
        }
        
        if (videosGrid) {
            videosGrid.innerHTML = '<div class="gallery-placeholder"><p>🎥 Error cargando videos</p></div>';
        }
    }
}

// Función para abrir la galería (página completa)
function openGallery() {
    const gallery = document.getElementById("memoryGallery");
    if (gallery) {
        gallery.classList.add("show");
        
        // Cargar contenido si no se ha cargado aún
        if (!galleryLoaded) {
            loadGalleryContent();
        }
        
        // Efecto de corazones al abrir la galería
        createGalleryHeartEffect();
    }
}

// Función para cerrar la galería
function closeGallery() {
    const gallery = document.getElementById("memoryGallery");
    if (gallery) {
        gallery.classList.remove("show");
    }
}

// Función para cambiar entre fotos y videos
function showCategory(category) {
    // Ocultar todas las secciones
    const photosSection = document.getElementById("photos-section");
    const videosSection = document.getElementById("videos-section");
    
    if (photosSection) photosSection.classList.remove("active");
    if (videosSection) videosSection.classList.remove("active");
    
    // Remover clase active de todos los botones
    const navBtns = document.querySelectorAll(".nav-btn");
    navBtns.forEach(btn => btn.classList.remove("active"));
    
    // Mostrar la sección seleccionada
    if (category === 'photos') {
        if (photosSection) photosSection.classList.add("active");
        const photosBtn = document.querySelector('[onclick="showCategory(\'photos\')"]');
        if (photosBtn) photosBtn.classList.add("active");
    } else if (category === 'videos') {
        if (videosSection) videosSection.classList.add("active");
        const videosBtn = document.querySelector('[onclick="showCategory(\'videos\')"]');
        if (videosBtn) videosBtn.classList.add("active");
    }
}

// Función para crear efecto de corazones al abrir la galería
function createGalleryHeartEffect() {
    const gallery = document.getElementById("memoryGallery");
    if (!gallery) return;
    
    // Crear varios corazones flotantes
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = ['💖', '💗', '💕', '💘', '💝', '❤️'][i];
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * 80 + 10 + '%';
            heart.style.top = '100%';
            heart.style.fontSize = '24px';
            heart.style.zIndex = '10001';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'gallery-heart-float 3s ease-out forwards';
            
            document.body.appendChild(heart);
            
            // Remover después de la animación
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 3000);
        }, i * 200);
    }
}

// Función para inicializar eventos de la galería
function initializeGalleryEvents() {
    // Botón de corazón para abrir galería
    const heartButton = document.querySelector('.heart-button');
    if (heartButton) {
        heartButton.addEventListener('click', openGallery);
    }
    
    // Botón de cerrar galería
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', closeGallery);
    }
    
    // Botones de navegación de categorías
    const photosNavBtn = document.querySelector('[onclick="showCategory(\'photos\')"]');
    const videosNavBtn = document.querySelector('[onclick="showCategory(\'videos\')"]');
    
    if (photosNavBtn) {
        photosNavBtn.addEventListener('click', () => showCategory('photos'));
    }
    
    if (videosNavBtn) {
        videosNavBtn.addEventListener('click', () => showCategory('videos'));
    }
    
    // Cerrar galería con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const gallery = document.getElementById("memoryGallery");
            if (gallery && gallery.classList.contains('show')) {
                closeGallery();
            }
        }
    });
}

// Agregar estilos CSS para la animación de corazones de la galería
function addGalleryStyles() {
    const galleryStyles = document.createElement('style');
    galleryStyles.textContent = `
        @keyframes gallery-heart-float {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .gallery-placeholder {
            text-align: center;
            padding: 40px 20px;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .gallery-placeholder p {
            font-size: 18px;
            margin-bottom: 8px;
        }
        
        .gallery-placeholder small {
            font-size: 12px;
            opacity: 0.6;
        }
    `;
    document.head.appendChild(galleryStyles);
}

// Inicializar todo al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎵 Inicializando reproductor musical...');
    
    // Agregar estilos de la galería
    addGalleryStyles();
    
    // Inicializar eventos de la galería
    initializeGalleryEvents();
    
    // Cargar canciones
    const songsLoaded = await loadSongsFromJSON();
    
    if (songsLoaded && songs.length > 0) {
        console.log('✅ Reproductor listo');
        
        // Event Listeners para controles
        if (playPauseBtn) {
            playPauseBtn.addEventListener("click", () => {
                if (isPlaying) {
                    pauseMusic();
                } else {
                    playMusic();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener("click", nextSong);
        }
        
        if (prevBtn) {
            prevBtn.addEventListener("click", prevSong);
        }
        
        // Event listeners para shuffle y repeat
        if (shuffleBtn) {
            shuffleBtn.addEventListener("click", toggleShuffle);
        }
        
        if (repeatBtn) {
            repeatBtn.addEventListener("click", toggleRepeat);
        }
        
        // Event listeners para la barra de progreso
        if (progressBar) {
            progressBar.addEventListener("click", (e) => {
                if (currentAudio && songs[currentSongIndex]) {
                    const rect = progressBar.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newTime = percentage * songs[currentSongIndex].duration;
                    
                    currentAudio.currentTime = newTime;
                    currentTimeSeconds = newTime;
                    updateProgressBar(percentage * 100);
                }
            });
        }
        
        // Event listeners para los botones del footer
        if (deviceBtn) {
            deviceBtn.addEventListener("click", showDeviceInfo);
        }
        
        if (playlistBtn) {
            playlistBtn.addEventListener("click", showPlaylist);
        }
        
        if (volumeBtn) {
            volumeBtn.addEventListener("click", toggleMute);
        }
        
        // Controles de teclado
        document.addEventListener("keydown", (e) => {
            // Solo activar si no hay un input enfocado
            if (document.activeElement.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (isPlaying) {
                        pauseMusic();
                    } else {
                        playMusic();
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSong();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSong();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    toggleShuffle();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    toggleRepeat();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
            }
        });
        
    } else {
        console.error('❌ No se pudieron cargar las canciones');
    }
});

// Funciones del reproductor
function playMusic() {
    if (currentAudio) {
        currentAudio.play().then(() => {
            isPlaying = true;
            if (playIcon) playIcon.textContent = "⏸️";
            activateRomanticAnimations();
        }).catch(error => {
            console.error('Error reproduciendo:', error);
        });
    }
}

function pauseMusic() {
    if (currentAudio) {
        currentAudio.pause();
        isPlaying = false;
        if (playIcon) playIcon.textContent = "▶️";
        deactivateRomanticAnimations();
    }
}
