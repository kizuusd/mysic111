// Local Data Handler

class LocalMusicData {
    constructor() {
        this.tracks = [];
        this.loadTracksFromJSON();
    }

    // Memuat data lagu dari file JSON lokal
    async loadTracksFromJSON() {
        try {
            const response = await fetch('/assets/js/data.json');
            if (!response.ok) {
                throw new Error('Gagal memuat data lagu');
            }
            const data = await response.json();
            this.tracks = data.tracks;
            this.initializeUI();
        } catch (error) {
            console.error('Error loading track data:', error);
            this.tracks = this.getFallbackTracks();
            this.initializeUI();
        }
    }

    // Inisialisasi UI setelah data dimuat
    initializeUI() {
        if (typeof updatePlaylist === 'function') {
            updatePlaylist(this.tracks);
        }
    }

    // Mencari lagu berdasarkan query
    searchTracks(query) {
        if (!query || query.trim() === '') {
            return this.tracks;
        }

        const normalizedQuery = query.toLowerCase();
        const results = this.tracks.filter(track => 
            track.title.toLowerCase().includes(normalizedQuery) || 
            track.artist.toLowerCase().includes(normalizedQuery) ||
            (track.genre && track.genre.toLowerCase().includes(normalizedQuery))
        );

        return results;
    }

    // Data fallback jika loading gagal
    getFallbackTracks() {
        return [
            {
                id: 1,
                title: "Lagu Demo 1",
                artist: "Mysic",
                duration: "3:00",
                cover: "/assets/images/fallback.svg",
                audioSrc: "",
                genre: "Pop"
            },
            {
                id: 2,
                title: "Lagu Demo 2",
                artist: "Mysic",
                duration: "3:00",
                cover: "/assets/images/fallback.svg",
                audioSrc: "",
                genre: "Rock"
            },
            {
                id: 3,
                title: "Lagu Demo 3",
                artist: "Mysic",
                duration: "3:00",
                cover: "/assets/images/fallback.svg",
                audioSrc: "",
                genre: "Pop"
            }
        ];
    }

    // Mendapatkan lagu berdasarkan ID
    getTrackById(id) {
        return this.tracks.find(track => track.id === id) || null;
    }
}

// Inisialisasi local music data
const musicData = new LocalMusicData();

// Mendapatkan elemen-elemen DOM untuk pencarian
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    // Event listener untuk tombol pencarian
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    // Event listener untuk input pencarian (saat Enter ditekan)
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Fungsi untuk melakukan pencarian
    function performSearch() {
        const query = searchInput.value.trim();
        
        // Tampilkan loading indicator
        const playlistContainer = document.getElementById('playlist-container');
        if (playlistContainer) {
            playlistContainer.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Mencari lagu "${query}"...</p>
                </div>
            `;
        }
        
        // Lakukan pencarian
        const results = musicData.searchTracks(query);
        if (typeof updatePlaylist === 'function') {
            updatePlaylist(results);
        }
        
        // Update judul playlist
        const playlistTitle = document.querySelector('.playlist h2');
        if (playlistTitle) {
            if (query) {
                playlistTitle.textContent = `Hasil Pencarian: "${query}"`;
            } else {
                playlistTitle.textContent = `Playlist Kamu`;
            }
        }
    }
}); 