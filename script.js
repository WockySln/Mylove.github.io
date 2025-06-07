// Base de datos de canciones y playlist
let songsDatabase = {};
let playlist = [];
let songs = [];

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

// Función para cargar canciones desde songs.json
async function loadSongsFromJSON() {
    try {
        showLoadingIndicator(true);
        console.log('Cargando canciones desde songs.json...');
        
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
            loadSong(0);
            return true;
        } else {
            showError("No se encontraron canciones válidas", "Verifica el archivo songs.json y los archivos de audio");
            return false;
        }
        
    } catch (error) {
        console.error('Error cargando canciones:', error);
        showLoadingIndicator(false);
        
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
    songTitle.textContent = title;
    artistName.textContent = message;
    albumCover.src = 'https://via.placeholder.com/500x500/ff6b6b/ffffff?text=Error';
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

    albumCover.src = song.cover;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;

    // Cambiar el fondo degradado
    body.style.background = `linear-gradient(135deg, ${song.colors[0]}, ${song.colors[1]})`;

    // Reiniciar la animación del título
    songTitle.style.animation = "none";
    setTimeout(() => {
        songTitle.style.animation = "moveTitle 10s linear infinite";
    }, 10);

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
        totalTime.textContent = formatTime(song.duration);
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
        albumCover.src = 'https://via.placeholder.com/500x500/ff6b6b/ffffff?text=Error+Audio';
        showError("Error al cargar audio", `No se pudo cargar: ${song.audioSrc}`);
    });

    // Reiniciar la barra de progreso
    progress.style.width = "0%";
    if (progressThumb) progressThumb.style.left = "0%";
    currentTimeSeconds = 0;
    currentTime.textContent = "0:00";
    totalTime.textContent = "0:00";
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
    progress.style.width = `${percentage}%`;
    if (progressThumb) progressThumb.style.left = `${percentage}%`;
    currentTime.textContent = formatTime(currentTimeSeconds);
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
    shuffleBtn.classList.toggle('active', isShuffled);
    
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
        if (isMuted) {
            volumeBtn.className = 'fas fa-volume-mute';
        } else {
            volumeBtn.className = 'fas fa-volume-up';
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

// Eventos de control de progreso
progressBar.addEventListener("mousedown", (e) => {
    if (!currentAudio || !songs[currentSongIndex] || !songs[currentSongIndex].duration) return;
    
    isDragging = true;
    const rect = progressBar.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    const newTime = (percentage / 100) * songs[currentSongIndex].duration;
    
    currentAudio.currentTime = newTime;
    currentTimeSeconds = newTime;
    updateProgressBar(percentage);
});

document.addEventListener("mousemove", (e) => {
    if (isDragging && currentAudio && songs[currentSongIndex]) {
        const rect = progressBar.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        
        const newTime = (percentage / 100) * songs[currentSongIndex].duration;
        currentAudio.currentTime = newTime;
        currentTimeSeconds = newTime;
        updateProgressBar(percentage);
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Controles de navegación
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// Control de reproducción
playPauseBtn.addEventListener("click", () => {
    if (!currentAudio) return;
    
    isPlaying = !isPlaying;
    playPauseBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (playIcon) playIcon.style.display = isPlaying ? "block" : "none";

    if (isPlaying) {
        currentAudio.play().catch(e => {
            console.error('Error al reproducir:', e);
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (playIcon) playIcon.style.display = "none";
        });
    } else {
        currentAudio.pause();
    }
});

// Controles de shuffle y repeat
if (shuffleBtn) {
    shuffleBtn.addEventListener("click", toggleShuffle);
}

if (repeatBtn) {
    repeatBtn.addEventListener("click", toggleRepeat);
}

// También agregar listener al icono específico si existe
const repeatIcon = document.querySelector(".controls .fa-redo");
if (repeatIcon && !repeatIcon.parentElement.classList.contains('repeat')) {
    repeatIcon.addEventListener("click", toggleRepeat);
}

// Controles de la barra inferior
if (deviceBtn) {
    deviceBtn.addEventListener("click", showDeviceInfo);
}

if (playlistBtn) {
    playlistBtn.addEventListener("click", showPlaylist);
}

if (volumeBtn) {
    volumeBtn.addEventListener("click", toggleMute);
}

// Manejo de errores de carga de imagen
albumCover.addEventListener('error', () => {
    albumCover.src = 'https://via.placeholder.com/500x500/667eea/ffffff?text=Sin+Imagen';
});

// Inicializar el reproductor cuando se carga la página
window.addEventListener('load', () => {
    console.log('Iniciando reproductor de música...');
    loadSongsFromJSON();
});

// También intentar cargar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM cargado, iniciando reproductor...');
        loadSongsFromJSON();
    });
} else {
    console.log('DOM ya está listo, iniciando reproductor...');
    loadSongsFromJSON();
}