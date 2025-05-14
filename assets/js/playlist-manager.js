// Playlist Manager & Artist Recommendations

class PlaylistManager {
    constructor() {
        this.playlists = [];
        this.artists = [];
        this.tracks = [];
        this.currentTrackForPlaylist = null;
        this.loadData();
        this.initEventListeners();
    }

    // Memuat data dari data.json
    async loadData() {
        try {
            const response = await fetch('/assets/js/data.json');
            if (!response.ok) {
                throw new Error('Gagal memuat data');
            }
            const data = await response.json();
            this.playlists = data.playlists || [];
            this.artists = data.artists || [];
            this.tracks = data.tracks || [];

            // Cek local storage untuk playlist favorit yang disimpan
            this.loadFavoritesFromLocalStorage();
            
            // Render playlist dan rekomendasi artist
            this.renderPlaylists();
            this.renderArtistRecommendations();
        } catch (error) {
            console.error('Error loading playlist data:', error);
            // Buat playlist kosong jika gagal memuat
            this.playlists = [{ id: 1, name: 'Favorit', description: 'Kumpulan lagu favorit kamu', tracks: [] }];
            this.renderPlaylists();
        }
    }

    // Menyimpan playlist favorit ke local storage
    loadFavoritesFromLocalStorage() {
        const favoriteTracks = JSON.parse(localStorage.getItem('mysic_favorites')) || [];
        // Cari playlist favorit (biasanya ID 1)
        const favoritePlaylist = this.playlists.find(p => p.id === 1);
        if (favoritePlaylist) {
            favoritePlaylist.tracks = favoriteTracks;
        }
    }

    // Menyimpan playlist favorit ke local storage
    saveFavoritesToLocalStorage() {
        const favoritePlaylist = this.playlists.find(p => p.id === 1);
        if (favoritePlaylist) {
            localStorage.setItem('mysic_favorites', JSON.stringify(favoritePlaylist.tracks));
        }
    }

    // Menambahkan event listeners
    initEventListeners() {
        // Dialog event listeners
        const closeDialog = document.getElementById('close-dialog');
        const createPlaylistBtn = document.getElementById('create-playlist-btn');

        if (closeDialog) {
            closeDialog.addEventListener('click', () => this.closePlaylistDialog());
        }

        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', () => this.createNewPlaylist());
        }

        // Tutup dialog saat klik di luar
        const playlistDialog = document.getElementById('playlist-dialog');
        if (playlistDialog) {
            playlistDialog.addEventListener('click', (e) => {
                if (e.target === playlistDialog) {
                    this.closePlaylistDialog();
                }
            });
        }

        // Listener untuk tombol tambah ke playlist
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-playlist-btn')) {
                const trackId = parseInt(e.target.getAttribute('data-track-id'));
                this.openPlaylistDialog(trackId);
            }
        });
    }

    // Menampilkan playlist
    renderPlaylists() {
        const playlistsGrid = document.getElementById('playlists-grid');
        if (!playlistsGrid) return;

        playlistsGrid.innerHTML = '';

        this.playlists.forEach(playlist => {
            const trackCount = playlist.tracks.length;
            const playlistElement = document.createElement('div');
            playlistElement.className = 'playlist-card';
            playlistElement.setAttribute('data-playlist-id', playlist.id);
            
            playlistElement.innerHTML = `
                <h3>${playlist.name}</h3>
                <p>${playlist.description}</p>
                <div class="track-count">${trackCount} lagu</div>
            `;
            
            playlistElement.addEventListener('click', () => this.showPlaylistTracks(playlist.id));
            
            playlistsGrid.appendChild(playlistElement);
        });
    }

    // Menampilkan rekomendasi artist
    renderArtistRecommendations() {
        // Jika API tersedia, gunakan API untuk rekomendasi artist
        if (window.musicAPI && window.streamingUI) {
            window.streamingUI.refreshArtistRecommendations();
            return;
        }

        // Fallback ke metode lama jika API tidak tersedia
        const artistsGrid = document.getElementById('artists-grid');
        if (!artistsGrid) return;

        artistsGrid.innerHTML = '';

        this.artists.forEach(artist => {
            const artistElement = document.createElement('div');
            artistElement.className = 'artist-card';
            artistElement.setAttribute('data-artist-id', artist.id);
            
            // Gunakan emoji sebagai fallback
            const firstLetter = artist.name.charAt(0).toUpperCase();
            
            artistElement.innerHTML = `
                <div class="artist-image">🎵</div>
                <h3>${artist.name}</h3>
                <p class="genre">${artist.genre}</p>
                <p class="description">${artist.description}</p>
            `;
            
            artistElement.addEventListener('click', () => this.showArtistTracks(artist.id));
            
            artistsGrid.appendChild(artistElement);
        });
    }

    // Menampilkan lagu-lagu dari playlist yang dipilih
    showPlaylistTracks(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        // Dapatkan informasi lagu dari ID di playlist
        const playlistTracks = playlist.tracks.map(trackId => {
            return this.tracks.find(t => t.id === trackId);
        }).filter(track => track !== undefined);

        // Update playlist container dengan lagu dari playlist yang dipilih
        if (typeof updatePlaylist === 'function') {
            updatePlaylist(playlistTracks);
        }

        // Update judul playlist
        const playlistTitle = document.querySelector('.playlist h2');
        if (playlistTitle) {
            playlistTitle.textContent = `Playlist: ${playlist.name}`;
        }
    }

    // Menampilkan lagu-lagu dari artist yang dipilih
    showArtistTracks(artistId) {
        const artist = this.artists.find(a => a.id === artistId);
        if (!artist) return;

        // Dapatkan informasi lagu dari ID di artist
        const artistTracks = artist.tracks.map(trackId => {
            return this.tracks.find(t => t.id === trackId);
        }).filter(track => track !== undefined);

        // Update playlist container dengan lagu dari artist yang dipilih
        if (typeof updatePlaylist === 'function') {
            updatePlaylist(artistTracks);
        }

        // Update judul playlist
        const playlistTitle = document.querySelector('.playlist h2');
        if (playlistTitle) {
            playlistTitle.textContent = `Lagu dari: ${artist.name}`;
        }
    }

    // Membuka dialog playlist
    openPlaylistDialog(trackId) {
        this.currentTrackForPlaylist = trackId;
        const playlistDialog = document.getElementById('playlist-dialog');
        const playlistItems = document.getElementById('playlist-items');
        
        if (!playlistDialog || !playlistItems) return;

        // Render daftar playlist
        playlistItems.innerHTML = '';
        
        this.playlists.forEach(playlist => {
            const isInPlaylist = playlist.tracks.includes(this.currentTrackForPlaylist);
            
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            
            playlistItem.innerHTML = `
                <label>
                    <input type="checkbox" data-playlist-id="${playlist.id}" ${isInPlaylist ? 'checked' : ''}>
                    ${playlist.name}
                </label>
            `;
            
            playlistItems.appendChild(playlistItem);
        });

        // Tambahkan event listener untuk checkbox
        const checkboxes = playlistItems.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const playlistId = parseInt(e.target.getAttribute('data-playlist-id'));
                this.toggleTrackInPlaylist(playlistId, this.currentTrackForPlaylist, e.target.checked);
            });
        });

        // Tampilkan dialog
        playlistDialog.classList.add('active');
    }

    // Menutup dialog playlist
    closePlaylistDialog() {
        const playlistDialog = document.getElementById('playlist-dialog');
        if (playlistDialog) {
            playlistDialog.classList.remove('active');
        }
        this.currentTrackForPlaylist = null;
    }

    // Membuat playlist baru
    createNewPlaylist() {
        const newPlaylistInput = document.getElementById('new-playlist-name');
        if (!newPlaylistInput) return;

        const playlistName = newPlaylistInput.value.trim();
        if (!playlistName) {
            alert('Nama playlist tidak boleh kosong');
            return;
        }

        // Buat ID baru (max id + 1)
        const newId = Math.max(...this.playlists.map(p => p.id), 0) + 1;
        
        // Buat playlist baru
        const newPlaylist = {
            id: newId,
            name: playlistName,
            description: 'Playlist baru',
            tracks: this.currentTrackForPlaylist ? [this.currentTrackForPlaylist] : []
        };

        // Tambahkan playlist baru
        this.playlists.push(newPlaylist);
        
        // Render ulang playlist
        this.renderPlaylists();
        
        // Tutup dialog dan reset input
        newPlaylistInput.value = '';
        this.closePlaylistDialog();
    }

    // Menambah/menghapus lagu dari playlist
    toggleTrackInPlaylist(playlistId, trackId, isAdd) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        if (isAdd) {
            // Tambahkan lagu jika belum ada
            if (!playlist.tracks.includes(trackId)) {
                playlist.tracks.push(trackId);
            }
        } else {
            // Hapus lagu dari playlist
            playlist.tracks = playlist.tracks.filter(id => id !== trackId);
        }

        // Render ulang playlist
        this.renderPlaylists();
        
        // Simpan ke local storage jika ini adalah playlist favorit
        if (playlistId === 1) {
            this.saveFavoritesToLocalStorage();
        }
    }
}

// Inisialisasi playlist manager saat DOM sudah siap
document.addEventListener('DOMContentLoaded', function() {
    window.playlistManager = new PlaylistManager();
}); 