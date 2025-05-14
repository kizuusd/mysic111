// OpenWhyd UI
// Replaced with Audiomack API

class OpenWhydUI {
    constructor() {
        this.isLoading = false;
        this.loginModal = null;
        this.currentTrack = null;
        this.currentPlaylist = null;
        this.initUI();
        this.initEventListeners();
    }

    // Initialize UI
    initUI() {
        // Update search UI
        this.updateSearchUI();
        
        // Add trending section
        this.addTrendingSection();
        
        // Add artist recommendations section
        this.addArtistRecommendationsSection();
        
        // Add playlist manager
        this.addPlaylistManagerUI();
        
        // Add login button in header if needed
        this.addLoginButton();
    }

    // Update search UI to use Audiomack API
    updateSearchUI() {
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');
        
        if (searchButton && searchInput) {
            // Remove old event listeners (not possible directly, so we replace the element)
            const newSearchButton = searchButton.cloneNode(true);
            searchButton.parentNode.replaceChild(newSearchButton, searchButton);
            
            // Add new event listener
            newSearchButton.addEventListener('click', () => this.performSearch());
            
            // Update input field event listener
            searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    }
    
    // Add trending section
    addTrendingSection() {
        const mainElement = document.querySelector('main');
        const playlist = document.querySelector('.playlist');
        
        if (mainElement && playlist) {
            const trendingSection = document.createElement('section');
            trendingSection.className = 'trending-section';
            trendingSection.innerHTML = `
                <h2>Trending Saat Ini</h2>
                <div class="trending-container" id="trending-container">
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Memuat trending...</p>
                    </div>
                </div>
            `;
            
            mainElement.insertBefore(trendingSection, playlist.nextSibling);
            
            // Load trending tracks
            this.loadTrendingTracks();
        }
    }
    
    // Add artist recommendations section
    addArtistRecommendationsSection() {
        const mainElement = document.querySelector('main');
        
        if (mainElement) {
            const recommendationsSection = document.createElement('section');
            recommendationsSection.className = 'artist-recommendations-section';
            recommendationsSection.innerHTML = `
                <h2>Artis yang Mungkin Kamu Suka</h2>
                <div class="artists-container" id="artists-container">
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Memuat rekomendasi artis...</p>
                    </div>
                </div>
            `;
            
            const trendingSection = document.querySelector('.trending-section');
            if (trendingSection) {
                mainElement.insertBefore(recommendationsSection, trendingSection.nextSibling);
            } else {
                const playlist = document.querySelector('.playlist');
                if (playlist) {
                    mainElement.insertBefore(recommendationsSection, playlist.nextSibling);
                } else {
                    mainElement.appendChild(recommendationsSection);
                }
            }
            
            // Load artist recommendations
            this.loadArtistRecommendations();
        }
    }
    
    // Add playlist manager UI
    addPlaylistManagerUI() {
        const mainElement = document.querySelector('main');
        const playerSection = document.querySelector('.music-player');
        
        if (mainElement && playerSection) {
            const playlistManagerSection = document.createElement('section');
            playlistManagerSection.className = 'playlist-manager-section';
            playlistManagerSection.innerHTML = `
                <h2>Playlist Saya</h2>
                <div class="playlist-manager-container">
                    <div class="playlist-actions">
                        <button id="create-playlist-btn" class="create-playlist-btn">
                            <i class="fas fa-plus"></i> Buat Playlist Baru
                        </button>
                    </div>
                    <div class="playlists-list" id="playlists-list">
                        <div class="loading-indicator">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Memuat playlist...</p>
                        </div>
                    </div>
                </div>
            `;
            
            mainElement.insertBefore(playlistManagerSection, playerSection);
            
            // Create playlist dialog
            this.createPlaylistDialog();
            
            // Load playlists
            this.loadPlaylists();
        }
    }
    
    // Create playlist dialog
    createPlaylistDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'playlist-dialog';
        dialog.id = 'create-playlist-dialog';
        dialog.innerHTML = `
            <div class="playlist-dialog-content">
                <div class="dialog-header">
                    <h3>Buat Playlist Baru</h3>
                    <button class="close-dialog" id="close-playlist-dialog"><i class="fas fa-times"></i></button>
                </div>
                <div class="dialog-body">
                    <div class="form-group">
                        <label for="playlist-name">Nama Playlist</label>
                        <input type="text" id="playlist-name" placeholder="Masukkan nama playlist">
                    </div>
                    <div class="form-group">
                        <label for="playlist-description">Deskripsi (opsional)</label>
                        <textarea id="playlist-description" placeholder="Masukkan deskripsi playlist"></textarea>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button id="cancel-playlist" class="cancel-btn">Batal</button>
                    <button id="save-playlist" class="save-btn">Simpan</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Event listeners for dialog
        document.getElementById('close-playlist-dialog').addEventListener('click', () => {
            dialog.classList.remove('active');
        });
        
        document.getElementById('cancel-playlist').addEventListener('click', () => {
            dialog.classList.remove('active');
        });
        
        document.getElementById('save-playlist').addEventListener('click', () => {
            this.saveNewPlaylist();
        });
    }
    
    // Add login button
    addLoginButton() {
        const header = document.querySelector('header');
        
        if (header) {
            const loginContainer = document.createElement('div');
            loginContainer.className = 'login-container';
            loginContainer.innerHTML = `
                <button id="login-button" class="login-button">
                    <i class="fas fa-sign-in-alt"></i> Masuk
                </button>
            `;
            
            header.appendChild(loginContainer);
            
            // Create login modal
            this.createLoginModal();
            
            // Add event listener to login button
            document.getElementById('login-button').addEventListener('click', () => {
                this.showLoginModal();
            });
            
            // Check if already logged in
            this.updateUserUI();
        }
    }
    
    // Create login modal
    createLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'login-modal';
        modal.id = 'login-modal';
        modal.innerHTML = `
            <div class="login-modal-content">
                <div class="modal-header">
                    <h3>Masuk ke Audiomack</h3>
                    <button class="close-modal" id="close-login-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" placeholder="Email Anda">
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" placeholder="Password">
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="login-submit" class="login-submit">Masuk</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.loginModal = modal;
        
        // Event listeners for modal
        document.getElementById('close-login-modal').addEventListener('click', () => {
            this.hideLoginModal();
        });
        
        document.getElementById('login-submit').addEventListener('click', () => {
            this.submitLogin();
        });
    }
    
    // Show login modal
    showLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.add('active');
        }
    }
    
    // Hide login modal
    hideLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.remove('active');
        }
    }
    
    // Submit login
    async submitLogin() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (!emailInput || !passwordInput) return;
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            alert('Email dan password harus diisi');
            return;
        }
        
        // Show loading
        const submitButton = document.getElementById('login-submit');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Masuk...';
            submitButton.disabled = true;
        }
        
        try {
            const result = await window.openWhydAPI.login(email, password);
            
            if (result.success) {
                this.hideLoginModal();
                this.updateUserUI();
                // Reset form
                emailInput.value = '';
                passwordInput.value = '';
            } else {
                alert(`Login gagal: ${result.error || 'Email atau password salah'}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(`Login gagal: ${error.message || 'Terjadi kesalahan'}`);
        } finally {
            // Reset button
            if (submitButton) {
                submitButton.innerHTML = 'Masuk';
                submitButton.disabled = false;
            }
        }
    }
    
    // Update user UI based on login status
    updateUserUI() {
        const loginButton = document.getElementById('login-button');
        
        if (window.openWhydAPI.currentUser) {
            // User is logged in
            if (loginButton) {
                loginButton.innerHTML = `
                    <i class="fas fa-user"></i> ${window.openWhydAPI.currentUser.name || 'Akun Saya'}
                `;
                
                // Change to logout functionality
                loginButton.addEventListener('click', () => {
                    this.logout();
                });
            }
        } else {
            // User is not logged in
            if (loginButton) {
                loginButton.innerHTML = `<i class="fas fa-sign-in-alt"></i> Masuk`;
                
                // Change to login functionality
                loginButton.addEventListener('click', () => {
                    this.showLoginModal();
                });
            }
        }
    }
    
    // Logout
    logout() {
        window.openWhydAPI.logout();
        this.updateUserUI();
        this.loadPlaylists(); // Reload playlists after logout
    }

    // Event listeners
    initEventListeners() {
        // Listen for create playlist button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'create-playlist-btn' || e.target.closest('#create-playlist-btn')) {
                const dialog = document.getElementById('create-playlist-dialog');
                if (dialog) {
                    dialog.classList.add('active');
                }
            }
        });
        
        // Listen for add to playlist buttons
        document.addEventListener('click', async (e) => {
            const addToPlaylistBtn = e.target.closest('.add-to-playlist');
            if (addToPlaylistBtn) {
                const trackId = addToPlaylistBtn.getAttribute('data-track-id');
                if (trackId) {
                    await this.showAddToPlaylistDialog(trackId);
                }
            }
        });
    }

    // Perform search with Audiomack API
    async performSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        
        // Show loading indicator
        const playlistContainer = document.getElementById('playlist-container');
        if (playlistContainer) {
            playlistContainer.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Mencari lagu "${query}"...</p>
                </div>
            `;
        }
        
        try {
            // Use Audiomack API to search tracks
            const result = await window.openWhydAPI.searchTracks(query);
            
            if (result.success && result.tracks.length > 0) {
                // Render the tracks
                this.renderTracks(result.tracks, playlistContainer);
                
                // Update playlist title
                const playlistTitle = document.querySelector('.playlist h2');
                if (playlistTitle) {
                    playlistTitle.textContent = `Hasil Pencarian: "${query}"`;
                }
            } else {
                // No results
                playlistContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>Tidak ditemukan lagu untuk "${query}"</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error searching tracks:', error);
            playlistContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Terjadi kesalahan saat mencari lagu</p>
                </div>
            `;
        }
    }
    
    // Load trending tracks
    async loadTrendingTracks() {
        const trendingContainer = document.getElementById('trending-container');
        if (!trendingContainer) return;
        
        try {
            // Use Audiomack API to get hot tracks
            const result = await window.openWhydAPI.getHotTracks(10);
            
            if (result.success && result.tracks.length > 0) {
                // Render trending tracks
                this.renderTrendingTracks(result.tracks, trendingContainer);
            } else {
                // Show error if no tracks
                trendingContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-music"></i>
                        <p>Tidak ada lagu trending saat ini</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading trending tracks:', error);
            trendingContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat lagu trending</p>
                </div>
            `;
        }
    }
    
    // Load artist recommendations
    async loadArtistRecommendations() {
        const artistsContainer = document.getElementById('artists-container');
        if (!artistsContainer) return;
        
        try {
            // Use Audiomack API to get artist recommendations
            const result = await window.openWhydAPI.getArtistRecommendations();
            
            if (result.success && result.artists.length > 0) {
                // Render artist recommendations
                this.renderArtistRecommendations(result.artists, artistsContainer);
            } else {
                // Show message if no recommendations
                artistsContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-user-music"></i>
                        <p>Belum ada rekomendasi artist</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading artist recommendations:', error);
            artistsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat rekomendasi artist</p>
                </div>
            `;
        }
    }
    
    // Load playlists
    async loadPlaylists() {
        const playlistsContainer = document.getElementById('playlists-list');
        if (!playlistsContainer) return;
        
        try {
            // Use Audiomack API to get user playlists
            const result = await window.openWhydAPI.getUserPlaylists();
            
            if (result.success && result.playlists.length > 0) {
                // Render playlists
                this.renderPlaylists(result.playlists, playlistsContainer);
            } else {
                // Show message if no playlists
                playlistsContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-list-music"></i>
                        <p>Kamu belum memiliki playlist</p>
                        <button id="create-first-playlist" class="create-playlist-btn">
                            <i class="fas fa-plus"></i> Buat Playlist Pertama
                        </button>
                    </div>
                `;
                
                // Event listener for create first playlist button
                document.getElementById('create-first-playlist').addEventListener('click', () => {
                    document.getElementById('create-playlist-dialog').classList.add('active');
                });
            }
        } catch (error) {
            console.error('Error loading playlists:', error);
            playlistsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat playlist</p>
                </div>
            `;
        }
    }
    
    // Save new playlist
    async saveNewPlaylist() {
        const nameInput = document.getElementById('playlist-name');
        const descriptionInput = document.getElementById('playlist-description');
        
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        const description = descriptionInput ? descriptionInput.value.trim() : '';
        
        if (!name) {
            alert('Nama playlist harus diisi');
            return;
        }
        
        try {
            const result = await window.openWhydAPI.createPlaylist(name, description);
            
            if (result.success) {
                // Close dialog
                const dialog = document.getElementById('create-playlist-dialog');
                if (dialog) {
                    dialog.classList.remove('active');
                }
                
                // Reset form
                nameInput.value = '';
                if (descriptionInput) {
                    descriptionInput.value = '';
                }
                
                // Reload playlists
                this.loadPlaylists();
            } else {
                alert(`Gagal membuat playlist: ${result.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            alert(`Gagal membuat playlist: ${error.message || 'Terjadi kesalahan'}`);
        }
    }
    
    // Show add to playlist dialog
    async showAddToPlaylistDialog(trackId) {
        // Find track data
        let track = null;
        if (window.openWhydAPI.cachedTracks) {
            track = window.openWhydAPI.cachedTracks.find(t => t.id.toString() === trackId.toString());
        }
        
        if (!track) {
            alert('Lagu tidak ditemukan');
            return;
        }
        
        // Get playlists
        const result = await window.openWhydAPI.getUserPlaylists();
        
        if (!result.success) {
            alert(`Gagal memuat playlist: ${result.error || 'Terjadi kesalahan'}`);
            return;
        }
        
        // Create dialog
        let dialog = document.getElementById('add-to-playlist-dialog');
        
        if (!dialog) {
            dialog = document.createElement('div');
            dialog.className = 'playlist-dialog';
            dialog.id = 'add-to-playlist-dialog';
            document.body.appendChild(dialog);
        }
        
        dialog.innerHTML = `
            <div class="playlist-dialog-content">
                <div class="dialog-header">
                    <h3>Tambahkan ke Playlist</h3>
                    <button class="close-dialog" id="close-add-playlist-dialog">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="dialog-body">
                    <div class="selected-track">
                        <div class="track-image" 
                            style="background-image: url(${track.cover || '/assets/images/fallback.svg'})">
                        </div>
                        <div class="track-info">
                            <h4>${track.title}</h4>
                            <p>${track.artist}</p>
                        </div>
                    </div>
                    <div class="playlists-selection">
                        <h4>Pilih Playlist</h4>
                        <ul class="playlists-list">
                            ${result.playlists.map(playlist => `
                                <li>
                                    <button class="playlist-item" data-playlist-id="${playlist.id}">
                                        ${playlist.name}
                                        <span class="track-count">${playlist.nbTracks} lagu</span>
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Show dialog
        dialog.classList.add('active');
        
        // Event listeners
        document.getElementById('close-add-playlist-dialog').addEventListener('click', () => {
            dialog.classList.remove('active');
        });
        
        // Event listeners for playlist items
        const playlistItems = dialog.querySelectorAll('.playlist-item');
        playlistItems.forEach(item => {
            item.addEventListener('click', async () => {
                const playlistId = item.getAttribute('data-playlist-id');
                await this.addTrackToPlaylist(playlistId, track);
                dialog.classList.remove('active');
            });
        });
    }
    
    // Add track to playlist
    async addTrackToPlaylist(playlistId, track) {
        try {
            const result = await window.openWhydAPI.addTrackToPlaylist(playlistId, track);
            
            if (result.success) {
                alert('Lagu berhasil ditambahkan ke playlist');
            } else {
                alert(`Gagal menambahkan lagu ke playlist: ${result.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            console.error('Error adding track to playlist:', error);
            alert(`Gagal menambahkan lagu ke playlist: ${error.message || 'Terjadi kesalahan'}`);
        }
    }
    
    // Render tracks
    renderTracks(tracks, container) {
        if (!container) return;
        
        if (!tracks || tracks.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>Tidak ada lagu ditemukan.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        tracks.forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.setAttribute('data-id', track.id);
            
            const coverUrl = track.cover || track.img || '/assets/images/fallback.svg';
            const sourceLabel = track.sourceLabel ? 
                `<div class="source-label">${track.sourceLabel}</div>` : '';
            
            trackItem.innerHTML = `
                <div class="track-cover" style="background-image: url(${coverUrl})">
                    ${sourceLabel}
                </div>
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                </div>
                <div class="track-duration">${track.duration || '0:00'}</div>
                <div class="track-controls">
                    <button class="play-btn" data-track-id="${track.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="add-to-playlist" data-track-id="${track.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            
            // Play button event listener
            const playButton = trackItem.querySelector('.play-btn');
            playButton.addEventListener('click', () => {
                this.playTrack(track);
            });
            
            container.appendChild(trackItem);
        });
    }
    
    // Render trending tracks
    renderTrendingTracks(tracks, container) {
        if (!container) return;
        
        if (!tracks || tracks.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>Tidak ada trending yang ditemukan.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        const trendingGrid = document.createElement('div');
        trendingGrid.className = 'trending-grid';
        
        tracks.forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.className = 'trending-item';
            trackItem.setAttribute('data-id', track.id);
            
            const coverUrl = track.cover || track.img || '/assets/images/fallback.svg';
            const nbPlays = track.nbPlays ? this.formatNumber(track.nbPlays) : '0';
            
            trackItem.innerHTML = `
                <div class="trending-cover" style="background-image: url(${coverUrl})">
                    <div class="trending-overlay">
                        <button class="trending-play-btn" data-track-id="${track.id}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="trending-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                    <div class="trending-stats">
                        <span><i class="fas fa-play"></i> ${nbPlays}</span>
                        <button class="add-to-playlist" data-track-id="${track.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Play button event listener
            const playButton = trackItem.querySelector('.trending-play-btn');
            playButton.addEventListener('click', () => {
                this.playTrack(track);
            });
            
            trendingGrid.appendChild(trackItem);
        });
        
        container.appendChild(trendingGrid);
    }
    
    // Render artist recommendations
    renderArtistRecommendations(artists, container) {
        if (!container) return;
        
        if (!artists || artists.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>Tidak ada rekomendasi artis yang ditemukan.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        const artistsGrid = document.createElement('div');
        artistsGrid.className = 'artists-grid';
        
        artists.forEach(artist => {
            const artistItem = document.createElement('div');
            artistItem.className = 'artist-item';
            artistItem.setAttribute('data-id', artist.id);
            
            const imageUrl = artist.image || '/assets/images/fallback.svg';
            const popularity = artist.popularity || 0;
            const followers = artist.followers ? this.formatNumber(artist.followers) : '0';
            
            artistItem.innerHTML = `
                <div class="artist-image" style="background-image: url(${imageUrl})"></div>
                <div class="artist-info">
                    <h3>${artist.name}</h3>
                    <p class="artist-genre">${artist.genre}</p>
                    <div class="artist-stats">
                        <div class="popularity-bar" style="width: ${popularity}%"></div>
                        <span>${followers} <i class="fas fa-user"></i></span>
                    </div>
                </div>
            `;
            
            // Click event listener
            artistItem.addEventListener('click', () => {
                this.showArtistTracks(artist);
            });
            
            artistsGrid.appendChild(artistItem);
        });
        
        container.appendChild(artistsGrid);
    }
    
    // Render playlists
    renderPlaylists(playlists, container) {
        if (!container) return;
        
        if (!playlists || playlists.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>Tidak ada playlist yang ditemukan.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        playlists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.setAttribute('data-id', playlist.id);
            
            playlistItem.innerHTML = `
                <div class="playlist-info">
                    <h3>${playlist.name}</h3>
                    <p>${playlist.description || ''}</p>
                    <div class="track-count">${playlist.nbTracks} lagu</div>
                </div>
                <div class="playlist-actions">
                    <button class="playlist-play-btn" data-playlist-id="${playlist.id}">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            `;
            
            // Play button event listener
            const playButton = playlistItem.querySelector('.playlist-play-btn');
            playButton.addEventListener('click', () => {
                this.loadPlaylistTracks(playlist.id);
            });
            
            // Click event listener
            playlistItem.addEventListener('click', (e) => {
                // Avoid clicking if clicking the play button
                if (e.target.closest('.playlist-play-btn')) return;
                
                this.loadPlaylistTracks(playlist.id);
            });
            
            container.appendChild(playlistItem);
        });
    }
    
    // Load playlist tracks
    async loadPlaylistTracks(playlistId) {
        // Update playlist title
        const playlistTitle = document.querySelector('.playlist h2');
        if (playlistTitle) {
            playlistTitle.textContent = 'Memuat Playlist...';
        }
        
        // Show loading indicator
        const playlistContainer = document.getElementById('playlist-container');
        if (playlistContainer) {
            playlistContainer.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat lagu dari playlist...</p>
                </div>
            `;
        }
        
        try {
            const result = await window.openWhydAPI.getPlaylistTracks(playlistId);
            
            if (result.success) {
                // Update playlist title
                if (playlistTitle && result.playlist) {
                    playlistTitle.textContent = `Playlist: ${result.playlist.name}`;
                }
                
                // Render tracks
                this.renderTracks(result.tracks, playlistContainer);
                
                // Save current playlist
                this.currentPlaylist = result.playlist;
            } else {
                // Show error
                if (playlistContainer) {
                    playlistContainer.innerHTML = `
                        <div class="error-message">
                            <p>Gagal memuat playlist: ${result.error || 'Terjadi kesalahan'}</p>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading playlist tracks:', error);
            
            // Show error
            if (playlistContainer) {
                playlistContainer.innerHTML = `
                    <div class="error-message">
                        <p>Gagal memuat playlist: ${error.message || 'Terjadi kesalahan'}</p>
                    </div>
                `;
            }
        }
    }
    
    // Show artist tracks
    async showArtistTracks(artist) {
        // Update playlist title
        const playlistTitle = document.querySelector('.playlist h2');
        if (playlistTitle) {
            playlistTitle.textContent = `Lagu dari ${artist.name}`;
        }
        
        // Show loading indicator
        const playlistContainer = document.getElementById('playlist-container');
        if (playlistContainer) {
            playlistContainer.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat lagu dari ${artist.name}...</p>
                </div>
            `;
        }
        
        try {
            // Get tracks from artist in cached tracks
            let artistTracks = [];
            
            if (artist.tracks && Array.isArray(artist.tracks)) {
                // Get tracks from IDs
                artistTracks = artist.tracks.map(trackId => {
                    return window.openWhydAPI.cachedTracks.find(t => t.id.toString() === trackId.toString());
                }).filter(track => track !== undefined);
            } else {
                // Search by artist name
                const searchResult = await window.openWhydAPI.searchTracks(artist.name);
                if (searchResult.success) {
                    artistTracks = searchResult.tracks.filter(t => 
                        t.artist.toLowerCase() === artist.name.toLowerCase()
                    );
                }
            }
            
            // Render tracks
            this.renderTracks(artistTracks, playlistContainer);
        } catch (error) {
            console.error('Error showing artist tracks:', error);
            
            // Show error
            if (playlistContainer) {
                playlistContainer.innerHTML = `
                    <div class="error-message">
                        <p>Gagal memuat lagu artis: ${error.message || 'Terjadi kesalahan'}</p>
                    </div>
                `;
            }
        }
    }
    
    // Play track
    async playTrack(track) {
        if (!track) return;
        
        try {
            // Store the current track
            this.currentTrack = track;
            
            // Mengubah track ke format yang diharapkan player
            const formattedTrack = {
                id: track.id,
                title: track.title || track.name,
                artist: track.artist,
                duration: track.duration || '3:00',
                cover: track.cover || track.img || '/assets/images/fallback.svg',
                audioSrc: track.audioSrc || ''
            };
            
            // Use Audiomack API to play track for analytics
            await window.openWhydAPI.playTrack(track.id);
            
            // Update current track display
            const currentTrackTitle = document.getElementById('current-track-title');
            const currentTrackArtist = document.getElementById('current-track-artist');
            const trackThumb = document.querySelector('.track-thumb');
            
            if (currentTrackTitle) {
                currentTrackTitle.textContent = formattedTrack.title;
            }
            
            if (currentTrackArtist) {
                currentTrackArtist.textContent = formattedTrack.artist;
            }
            
            if (trackThumb) {
                trackThumb.style.backgroundImage = `url(${formattedTrack.cover})`;
            }
            
            // Update playlist jika fungsi tersedia
            if (typeof updatePlaylist === 'function') {
                updatePlaylist([formattedTrack]);
            }
            
            // Call the original playTrack function (if it's available)
            if (window.playTrack) {
                window.playTrack();
            }
            
            // Update active track in UI
            this.highlightTrack(track.id);
        } catch (error) {
            console.error('Error playing track:', error);
            alert('Gagal memutar lagu. Silakan coba lagi.');
        }
    }
    
    // Highlight active track in the UI
    highlightTrack(trackId) {
        // Remove highlight from all tracks
        document.querySelectorAll('.track-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add highlight to active track
        const activeTrack = document.querySelector(`.track-item[data-id="${trackId}"]`);
        if (activeTrack) {
            activeTrack.classList.add('active');
            // Scroll to the track if needed
            activeTrack.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // Format number (e.g. 1000 -> 1K)
    formatNumber(number) {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    }
}

// Initialize the Audiomack UI and API when the document is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Initializing Audiomack API and UI...');
        
        // Initialize the Audiomack API
        window.openWhydAPI = new AudiomackAPI();
        
        // Inisialisasi API
        const initResult = await window.openWhydAPI.initialize();
        console.log('Audiomack API initialized successfully, logged in:', initResult);
        
        // Verify API methods are available
        if (typeof window.openWhydAPI.searchTracks !== 'function') {
            console.error('API method searchTracks is not defined!');
        }
        
        if (typeof window.openWhydAPI.getHotTracks !== 'function') {
            console.error('API method getHotTracks is not defined!');
        }
        
        // Initialize the UI
        window.openWhydUI = new OpenWhydUI();
        
        // Initialize trending and recommendations
        window.openWhydUI.loadTrendingTracks();
        window.openWhydUI.loadArtistRecommendations();
        
    } catch (error) {
        console.error('Error initializing Audiomack API and UI:', error);
    }
}); 