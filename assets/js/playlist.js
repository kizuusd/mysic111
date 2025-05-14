document.addEventListener('DOMContentLoaded', function() {
    // Data state
    let tracks = [];
    let currentTrackIndex = 0;
    let isPlaying = false;
    const audio = new Audio();
    let simulationInterval;
    let simulatedCurrentTime = 0;
    let simulatedDuration = 180; // 3 minutes in seconds
    
    // DOM elements
    const currentTrackTitle = document.getElementById('current-track-title');
    const currentTrackArtist = document.getElementById('current-track-artist');
    const trackThumb = document.querySelector('.track-thumb');
    const playPauseBtn = document.getElementById('play-pause');
    const prevTrackBtn = document.getElementById('prev-track');
    const nextTrackBtn = document.getElementById('next-track');
    const progressBar = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const volumeControl = document.getElementById('volume');
    const playlistContainer = document.getElementById('playlist-container');

    // Check if all required elements exist
    const hasRequiredElements = validateRequiredElements();

    // Update playlist function - exposed globally
    window.updatePlaylist = function(newTracks) {
        if (!newTracks || newTracks.length === 0 || !playlistContainer) {
            if (playlistContainer) {
                playlistContainer.innerHTML = '<div class="no-results">Tidak ada lagu yang ditemukan.</div>';
            }
            return;
        }
        
        tracks = newTracks;
        renderPlaylist();
        loadTrack(0);
    };

    // Validate that all required elements exist
    function validateRequiredElements() {
        const missingElements = [];
        
        if (!currentTrackTitle) missingElements.push('current-track-title');
        if (!currentTrackArtist) missingElements.push('current-track-artist');
        if (!trackThumb) missingElements.push('track-thumb');
        if (!playPauseBtn) missingElements.push('play-pause');
        if (!prevTrackBtn) missingElements.push('prev-track');
        if (!nextTrackBtn) missingElements.push('next-track');
        if (!progressBar) missingElements.push('progress');
        if (!progressContainer) missingElements.push('progress-bar');
        if (!currentTimeEl) missingElements.push('current-time');
        if (!totalTimeEl) missingElements.push('total-time');
        if (!playlistContainer) missingElements.push('playlist-container');
        
        if (missingElements.length > 0) {
            console.error('Missing required elements:', missingElements.join(', '));
            return false;
        }
        
        return true;
    }

    // Render playlist items 
    function renderPlaylist() {
        if (!playlistContainer) return;
        
        playlistContainer.innerHTML = '';
        
        tracks.forEach((track, index) => {
            const coverUrl = track.cover || '/assets/images/fallback.svg';
            
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.setAttribute('data-id', track.id);
            trackItem.setAttribute('data-index', index);
            
            trackItem.innerHTML = `
                <div class="track-cover" style="background-image: url(${coverUrl})"></div>
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                </div>
                <div class="track-duration">${track.duration || '0:00'}</div>
                <div class="track-controls">
                    <button class="play-btn" data-index="${index}"><i class="fas fa-play"></i></button>
                    <button class="add-to-playlist-btn" data-track-id="${track.id}"><i class="fas fa-plus"></i></button>
                </div>
            `;
            
            playlistContainer.appendChild(trackItem);
            
            // Add event listener for track item click
            trackItem.addEventListener('click', function(e) {
                if (e.target.closest('.play-btn') || e.target.closest('.add-to-playlist-btn')) return;
                
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                playTrack();
            });
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Play/pause button
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function() {
                isPlaying ? pauseTrack() : playTrack();
            });
        }
        
        // Previous track button
        if (prevTrackBtn) {
            prevTrackBtn.addEventListener('click', prevTrack);
        }
        
        // Next track button
        if (nextTrackBtn) {
            nextTrackBtn.addEventListener('click', nextTrack);
        }
        
        // Progress bar click
        if (progressContainer) {
            progressContainer.addEventListener('click', setProgress);
        }
        
        // Volume control
        if (volumeControl) {
            volumeControl.addEventListener('input', function() {
                audio.volume = volumeControl.value / 100;
            });
            
            // Set initial volume
            audio.volume = volumeControl.value / 100;
        }
        
        // Audio events
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', nextTrack);
        
        // Play buttons in playlist
        document.addEventListener('click', function(e) {
            const playBtn = e.target.classList.contains('play-btn') 
                ? e.target 
                : e.target.closest('.play-btn');
                
            if (playBtn) {
                const index = parseInt(playBtn.getAttribute('data-index'));
                
                if (currentTrackIndex === index && isPlaying) {
                    pauseTrack();
                } else {
                    currentTrackIndex = index;
                    loadTrack(currentTrackIndex);
                    playTrack();
                }
            }
        });
    }

    // Load track
    function loadTrack(index) {
        if (!tracks.length || !hasRequiredElements) return;
        
        // Ensure index is valid
        if (index < 0) index = tracks.length - 1;
        if (index >= tracks.length) index = 0;
        
        currentTrackIndex = index;
        const track = tracks[currentTrackIndex];
        
        // Check if audio source is available
        if (!track.audioSrc) {
            updateTrackInfo(track);
            if (currentTrackTitle) currentTrackTitle.textContent = `${track.title} (Demo)`;
            if (currentTrackArtist) currentTrackArtist.textContent = `${track.artist} - Simulasi`;
            if (playPauseBtn) {
                playPauseBtn.disabled = true;
                playPauseBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            }
            return;
        }
        
        // Reset button state
        if (playPauseBtn) {
            playPauseBtn.disabled = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // Set audio source
        audio.src = track.audioSrc;
        audio.load();
        updateTrackInfo(track);
    }

    // Update track info
    function updateTrackInfo(track) {
        if (!track) return;
        
        if (currentTrackTitle) currentTrackTitle.textContent = track.title;
        if (currentTrackArtist) currentTrackArtist.textContent = track.artist;
        if (trackThumb) trackThumb.style.backgroundImage = `url(${track.cover || '/assets/images/fallback.svg'})`;
    }

    // Play track
    function playTrack() {
        if (!tracks.length || !hasRequiredElements) return;
        
        const track = tracks[currentTrackIndex];
        
        // If no audio source, use simulation
        if (!track.audioSrc || track.audioSrc === '') {
            simulateAudioPlayback();
            return;
        }
        
        // Play audio if available
        audio.play().catch(() => {
            simulateAudioPlayback();
        });
        
        isPlaying = true;
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        highlightCurrentTrack();
    }
    
    // Expose playTrack function globally
    window.playTrack = playTrack;
    
    // Simulate audio playback
    function simulateAudioPlayback() {
        clearInterval(simulationInterval);
        simulatedCurrentTime = 0;
        isPlaying = true;
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        highlightCurrentTrack();
        
        simulationInterval = setInterval(() => {
            simulatedCurrentTime += 1;
            
            // Update progress bar and time
            if (progressBar) {
                const progressPercent = (simulatedCurrentTime / simulatedDuration) * 100;
                progressBar.style.width = `${progressPercent}%`;
            }
            
            // Update current time display
            if (currentTimeEl) {
                const currentMinutes = Math.floor(simulatedCurrentTime / 60);
                const currentSeconds = Math.floor(simulatedCurrentTime % 60);
                currentTimeEl.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
            }
            
            // Update total time
            if (totalTimeEl) {
                const durationMinutes = Math.floor(simulatedDuration / 60);
                const durationSeconds = Math.floor(simulatedDuration % 60);
                totalTimeEl.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
            }
            
            // Auto next track
            if (simulatedCurrentTime >= simulatedDuration) {
                clearInterval(simulationInterval);
                nextTrack();
            }
        }, 1000);
    }

    // Pause track
    function pauseTrack() {
        if (simulationInterval) {
            clearInterval(simulationInterval);
        }
        
        audio.pause();
        isPlaying = false;
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    // Next track
    function nextTrack() {
        if (simulationInterval) {
            clearInterval(simulationInterval);
        }
        
        currentTrackIndex++;
        if (currentTrackIndex >= tracks.length) {
            currentTrackIndex = 0;
        }
        
        loadTrack(currentTrackIndex);
        if (isPlaying) playTrack();
    }

    // Previous track
    function prevTrack() {
        if (simulationInterval) {
            clearInterval(simulationInterval);
        }
        
        currentTrackIndex--;
        if (currentTrackIndex < 0) {
            currentTrackIndex = tracks.length - 1;
        }
        
        loadTrack(currentTrackIndex);
        if (isPlaying) playTrack();
    }

    // Update progress bar
    function updateProgress() {
        if (!progressBar || !currentTimeEl || !totalTimeEl) return;
        
        const currentTime = audio.currentTime;
        const duration = audio.duration || 0;
        
        if (duration) {
            // Update progress bar
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            
            // Update time display
            const currentMinutes = Math.floor(currentTime / 60);
            const currentSeconds = Math.floor(currentTime % 60);
            currentTimeEl.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
            
            const durationMinutes = Math.floor(duration / 60);
            const durationSeconds = Math.floor(duration % 60);
            totalTimeEl.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
        }
    }

    // Set progress when clicking on progress bar
    function setProgress(e) {
        if (!progressContainer || !progressBar) return;
        
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        
        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        } else if (simulationInterval) {
            // For simulated playback
            simulatedCurrentTime = (clickX / width) * simulatedDuration;
            updateProgress();
        }
    }

    // Highlight current track in playlist
    function highlightCurrentTrack() {
        if (!playlistContainer) return;
        
        const allTracks = playlistContainer.querySelectorAll('.track-item');
        allTracks.forEach((track, index) => {
            if (index === currentTrackIndex) {
                track.classList.add('playing');
            } else {
                track.classList.remove('playing');
            }
        });
    }

    // Initialize player
    function init() {
        if (hasRequiredElements) {
            setupEventListeners();
            console.log('Music player initialized');
        } else {
            console.warn('Music player initialization failed - missing elements');
        }
    }

    // Initialize the player
    init();
}); 