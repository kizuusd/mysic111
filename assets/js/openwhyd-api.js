// OpenWhyd API Integration
// API documentation: https://openwhyd.github.io/openwhyd/API

class OpenWhydAPI {
    constructor() {
        this.baseUrl = 'https://openwhyd.org';
        this.apiEndpoint = '/api/';
        this.currentUser = null;
        this.currentSession = null;
        this.cachedTracks = [];
        this.cachedArtists = [];
        
        // Set static base path for assets 
        this.staticPath = window.MYSIC_BASE_PATH || '/';
        console.log('OpenWhyd API using base path:', this.staticPath);
    }

    // Helper untuk memperbaiki path gambar
    fixImagePath(imagePath) {
        if (!imagePath) return this.staticPath + 'assets/images/fallback.svg';
        
        // Jika path sudah lengkap dengan http/https, gunakan langsung
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Jika path dimulai dengan /, tambahkan base path
        if (imagePath.startsWith('/')) {
            return this.staticPath + imagePath.substring(1);
        }
        
        return this.staticPath + imagePath;
    }

    // Inisialisasi API dan cek login
    async initialize() {
        try {
            // Coba memuat session dari localStorage
            const savedSession = localStorage.getItem('openwhyd_session');
            if (savedSession) {
                this.currentSession = JSON.parse(savedSession);
                await this.getLoggedUser();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error initializing OpenWhyd API:', error);
            return false;
        }
    }

    // Get logged user
    async getLoggedUser() {
        try {
            const response = await this.apiRequest('/me');
            if (response && response.id) {
                this.currentUser = response;
                return response;
            }
            return null;
        } catch (error) {
            console.error('Error getting logged user:', error);
            return null;
        }
    }

    // Login to OpenWhyd
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (data.redirect) {
                // Login successful, save session
                this.currentSession = {
                    uid: data.uid,
                    email: email,
                    time: Date.now()
                };
                
                localStorage.setItem('openwhyd_session', JSON.stringify(this.currentSession));
                
                // Get user details
                await this.getLoggedUser();
                
                return {
                    success: true,
                    user: this.currentUser
                };
            } else {
                throw new Error('Login gagal');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Logout
    logout() {
        this.currentUser = null;
        this.currentSession = null;
        localStorage.removeItem('openwhyd_session');
        return {
            success: true
        };
    }

    // Search tracks
    async searchTracks(query, limit = 20) {
        try {
            // Format query
            const formattedQuery = query.trim().replace(/\s+/g, '+');
            
            // Simulate OpenWhyd search with YouTube, SoundCloud, etc
            const sources = ['yt', 'sc', 'dm', 'vi']; // YouTube, SoundCloud, Dailymotion, Vimeo
            let tracks = [];
            
            // If we're using real OpenWhyd API
            const response = await this.apiRequest(`/search?q=${formattedQuery}&format=json&limit=${limit}`);
            
            if (response && response.length > 0) {
                // Process tracks
                tracks = response.map(item => this.formatTrack(item));
                this.cachedTracks = [...this.cachedTracks, ...tracks];
                
                return {
                    success: true,
                    tracks: tracks,
                    query: query
                };
            } else {
                // Fallback to local search if OpenWhyd returns no results
                return await this.simulateSearch(query, limit);
            }
        } catch (error) {
            console.error('Error searching tracks:', error);
            // Fallback to simulated search
            return await this.simulateSearch(query, limit);
        }
    }
    
    // Simulate search (fallback)
    async simulateSearch(query, limit) {
        try {
            // Coba beberapa path alternatif untuk data.json
            let data = null;
            const possiblePaths = [
                this.staticPath + 'assets/js/data.json',
                '/assets/js/data.json',
                './assets/js/data.json',
                'assets/js/data.json'
            ];
            
            for (const path of possiblePaths) {
                try {
                    console.log('Trying to load data from:', path);
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        console.log('Successfully loaded data from:', path);
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to load from ${path}`);
                }
            }
            
            // Jika semua path gagal, gunakan data hardcoded
            if (!data) {
                console.warn('Fallback to hardcoded data');
                data = {
                    tracks: [
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
                        }
                    ]
                };
            }
            
            let tracks = data.tracks || [];
            
            // Filter based on query
            if (query && query.trim() !== '') {
                const normalizedQuery = query.toLowerCase();
                tracks = tracks.filter(track => 
                    track.title.toLowerCase().includes(normalizedQuery) || 
                    track.artist.toLowerCase().includes(normalizedQuery) ||
                    (track.genre && track.genre.toLowerCase().includes(normalizedQuery))
                );
            }
            
            // Limit results
            tracks = tracks.slice(0, limit);
            
            // Format tracks to match OpenWhyd format
            tracks = tracks.map(track => ({
                ...track,
                _id: `local_${track.id}`,
                name: track.title,
                eId: `yt/${this.generateRandomVideoId()}`,
                sourceLabel: 'local',
                img: this.fixImagePath(track.cover),
                nbPlays: Math.floor(Math.random() * 10000)
            }));
            
            this.cachedTracks = [...this.cachedTracks, ...tracks];
            
            return {
                success: true,
                tracks: tracks,
                query: query,
                simulated: true
            };
        } catch (error) {
            console.error('Error in simulated search:', error);
            return {
                success: false,
                error: error.message,
                tracks: []
            };
        }
    }
    
    // Generate random YouTube video ID
    generateRandomVideoId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let result = '';
        for (let i = 0; i < 11; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Format a track from OpenWhyd to our format
    formatTrack(item) {
        // Extract YouTube video ID if available
        let videoId = '';
        if (item.eId && item.eId.startsWith('yt/')) {
            videoId = item.eId.substring(3);
        }
        
        return {
            id: item._id || `openwhyd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            _id: item._id,
            title: item.name,
            artist: item.uNm || 'Unknown Artist',
            duration: item.duration || '3:30',
            cover: this.fixImagePath(item.img),
            audioSrc: videoId ? `https://www.youtube.com/watch?v=${videoId}` : '',
            eId: item.eId,
            sourceLabel: item.sourceLabel || 'openwhyd',
            nbPlays: item.nbPlays || 0,
            genre: item.genre || 'Unknown'
        };
    }

    // Get hot tracks (trending)
    async getHotTracks(limit = 10) {
        try {
            const response = await this.apiRequest(`/hot?format=json&limit=${limit}`);
            
            if (response && response.tracks) {
                const tracks = response.tracks.map(item => this.formatTrack(item));
                return {
                    success: true,
                    tracks: tracks
                };
            } else {
                // Fallback to local data
                return await this.getSimulatedHotTracks(limit);
            }
        } catch (error) {
            console.error('Error getting hot tracks:', error);
            return await this.getSimulatedHotTracks(limit);
        }
    }
    
    // Get simulated hot tracks
    async getSimulatedHotTracks(limit) {
        try {
            // Coba beberapa path alternatif untuk data.json
            let data = null;
            const possiblePaths = [
                this.staticPath + 'assets/js/data.json',
                '/assets/js/data.json',
                './assets/js/data.json',
                'assets/js/data.json'
            ];
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to load hot tracks from ${path}`);
                }
            }
            
            // Jika semua path gagal, gunakan data hardcoded
            if (!data) {
                console.warn('Fallback to hardcoded data for hot tracks');
                data = {
                    tracks: [
                        {
                            id: 1,
                            title: "Trending 1",
                            artist: "Artis Populer",
                            duration: "3:30",
                            cover: "/assets/images/fallback.svg",
                            audioSrc: "",
                            genre: "Pop"
                        },
                        {
                            id: 2,
                            title: "Trending 2",
                            artist: "Artis Viral",
                            duration: "4:15",
                            cover: "/assets/images/fallback.svg",
                            audioSrc: "",
                            genre: "Rock"
                        }
                    ]
                };
            }
            
            let tracks = data.tracks || [];
            
            // Shuffle tracks for randomness
            tracks = tracks.sort(() => 0.5 - Math.random());
            
            // Limit results
            tracks = tracks.slice(0, limit);
            
            // Format tracks
            tracks = tracks.map(track => ({
                ...track,
                _id: `local_hot_${track.id}`,
                name: track.title,
                eId: `yt/${this.generateRandomVideoId()}`,
                sourceLabel: 'trending',
                img: this.fixImagePath(track.cover),
                nbPlays: Math.floor(10000 + Math.random() * 90000)
            }));
            
            return {
                success: true,
                tracks: tracks,
                simulated: true
            };
        } catch (error) {
            console.error('Error in simulated hot tracks:', error);
            return {
                success: false,
                error: error.message,
                tracks: []
            };
        }
    }

    // Get user playlists
    async getUserPlaylists() {
        if (!this.currentUser) {
            return await this.getSimulatedPlaylists();
        }
        
        try {
            const userId = this.currentUser.id;
            const response = await this.apiRequest(`/user/${userId}/playlists`);
            
            if (response && Array.isArray(response)) {
                return {
                    success: true,
                    playlists: response
                };
            } else {
                return await this.getSimulatedPlaylists();
            }
        } catch (error) {
            console.error('Error getting user playlists:', error);
            return await this.getSimulatedPlaylists();
        }
    }
    
    // Get simulated playlists
    async getSimulatedPlaylists() {
        try {
            // Coba beberapa path alternatif untuk data.json
            let data = null;
            const possiblePaths = [
                this.staticPath + 'assets/js/data.json',
                '/assets/js/data.json',
                './assets/js/data.json',
                'assets/js/data.json'
            ];
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to load playlists from ${path}`);
                }
            }
            
            // Jika semua path gagal, gunakan data hardcoded
            if (!data) {
                console.warn('Fallback to hardcoded data for playlists');
                data = {
                    playlists: [
                        {
                            id: 1,
                            name: "Favorit",
                            description: "Playlist lagu-lagu favorit",
                            tracks: [1, 2]
                        },
                        {
                            id: 2,
                            name: "Santai",
                            description: "Musik untuk bersantai",
                            tracks: []
                        }
                    ]
                };
            }
            
            let playlists = data.playlists || [];
            
            // Format playlists
            playlists = playlists.map(playlist => ({
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                nbTracks: playlist.tracks ? playlist.tracks.length : 0,
                tracks: playlist.tracks
            }));
            
            return {
                success: true,
                playlists: playlists,
                simulated: true
            };
        } catch (error) {
            console.error('Error in simulated playlists:', error);
            return {
                success: false,
                error: error.message,
                playlists: []
            };
        }
    }

    // Get playlist tracks
    async getPlaylistTracks(playlistId) {
        try {
            const response = await this.apiRequest(`/playlist/${playlistId}`);
            
            if (response && response.tracks) {
                const tracks = response.tracks.map(item => this.formatTrack(item));
                return {
                    success: true,
                    tracks: tracks,
                    playlist: {
                        id: playlistId,
                        name: response.name,
                        description: response.description
                    }
                };
            } else {
                return await this.getSimulatedPlaylistTracks(playlistId);
            }
        } catch (error) {
            console.error('Error getting playlist tracks:', error);
            return await this.getSimulatedPlaylistTracks(playlistId);
        }
    }
    
    // Get simulated playlist tracks
    async getSimulatedPlaylistTracks(playlistId) {
        try {
            // Coba beberapa path alternatif untuk data.json
            let data = null;
            const possiblePaths = [
                this.staticPath + 'assets/js/data.json',
                '/assets/js/data.json',
                './assets/js/data.json',
                'assets/js/data.json'
            ];
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to load playlist tracks from ${path}`);
                }
            }
            
            // Jika semua path gagal, gunakan data hardcoded
            if (!data) {
                console.warn('Fallback to hardcoded data for playlist tracks');
                data = {
                    playlists: [
                        {
                            id: 1,
                            name: "Favorit",
                            description: "Playlist lagu-lagu favorit",
                            tracks: [1, 2]
                        }
                    ],
                    tracks: [
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
                        }
                    ]
                };
            }
            
            const playlists = data.playlists || [];
            const playlist = playlists.find(p => p.id.toString() === playlistId.toString());
            
            if (!playlist) {
                throw new Error('Playlist tidak ditemukan');
            }
            
            // Get tracks from playlist
            const tracks = playlist.tracks.map(trackId => {
                const track = data.tracks.find(t => t.id === trackId);
                if (!track) return null;
                
                return {
                    id: track.id,
                    _id: `local_playlist_${track.id}`,
                    title: track.title,
                    name: track.title,
                    artist: track.artist,
                    duration: track.duration,
                    cover: this.fixImagePath(track.cover),
                    img: this.fixImagePath(track.cover),
                    audioSrc: track.audioSrc,
                    eId: `yt/${this.generateRandomVideoId()}`,
                    sourceLabel: 'playlist',
                    nbPlays: Math.floor(Math.random() * 10000),
                    genre: track.genre
                };
            }).filter(track => track !== null);
            
            return {
                success: true,
                tracks: tracks,
                playlist: {
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description
                },
                simulated: true
            };
        } catch (error) {
            console.error('Error in simulated playlist tracks:', error);
            return {
                success: false,
                error: error.message,
                tracks: []
            };
        }
    }

    // Add track to playlist
    async addTrackToPlaylist(playlistId, track) {
        if (!this.currentUser) {
            return this.simulateAddTrackToPlaylist(playlistId, track);
        }
        
        try {
            // Format the track for OpenWhyd
            const formattedTrack = {
                eId: track.eId || `yt/${this.generateRandomVideoId()}`,
                name: track.title,
                img: track.cover
            };
            
            const response = await this.apiRequest(`/playlist/${playlistId}/track`, {
                method: 'POST',
                body: JSON.stringify(formattedTrack)
            });
            
            if (response && response.success) {
                return {
                    success: true,
                    message: 'Lagu berhasil ditambahkan ke playlist'
                };
            } else {
                return this.simulateAddTrackToPlaylist(playlistId, track);
            }
        } catch (error) {
            console.error('Error adding track to playlist:', error);
            return this.simulateAddTrackToPlaylist(playlistId, track);
        }
    }
    
    // Simulate adding track to playlist
    simulateAddTrackToPlaylist(playlistId, track) {
        try {
            // Add to local storage
            const savedPlaylists = JSON.parse(localStorage.getItem('mysic_playlists') || '{}');
            
            if (!savedPlaylists[playlistId]) {
                savedPlaylists[playlistId] = [];
            }
            
            // Check if track already exists in playlist
            if (!savedPlaylists[playlistId].some(t => t.id === track.id)) {
                savedPlaylists[playlistId].push({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    cover: track.cover,
                    timestamp: Date.now()
                });
            }
            
            localStorage.setItem('mysic_playlists', JSON.stringify(savedPlaylists));
            
            return {
                success: true,
                message: 'Lagu berhasil ditambahkan ke playlist',
                simulated: true
            };
        } catch (error) {
            console.error('Error in simulated add track to playlist:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create new playlist
    async createPlaylist(name, description = '') {
        if (!this.currentUser) {
            return this.simulateCreatePlaylist(name, description);
        }
        
        try {
            const response = await this.apiRequest('/playlist', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    description
                })
            });
            
            if (response && response.id) {
                return {
                    success: true,
                    playlist: response
                };
            } else {
                return this.simulateCreatePlaylist(name, description);
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            return this.simulateCreatePlaylist(name, description);
        }
    }
    
    // Simulate creating playlist
    simulateCreatePlaylist(name, description = '') {
        try {
            // Add to local storage
            const savedPlaylists = JSON.parse(localStorage.getItem('mysic_playlists_meta') || '[]');
            
            const newPlaylist = {
                id: `local_${Date.now()}`,
                name,
                description,
                timestamp: Date.now(),
                tracks: []
            };
            
            savedPlaylists.push(newPlaylist);
            localStorage.setItem('mysic_playlists_meta', JSON.stringify(savedPlaylists));
            
            // Initialize empty tracks array
            const tracksList = JSON.parse(localStorage.getItem('mysic_playlists') || '{}');
            tracksList[newPlaylist.id] = [];
            localStorage.setItem('mysic_playlists', JSON.stringify(tracksList));
            
            return {
                success: true,
                playlist: newPlaylist,
                simulated: true
            };
        } catch (error) {
            console.error('Error in simulated create playlist:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get artist recommendations
    async getArtistRecommendations() {
        try {
            // First try to get from API
            const hotResponse = await this.getHotTracks(20);
            
            if (hotResponse && hotResponse.success) {
                const tracks = hotResponse.tracks;
                
                // Extract artists
                const artists = [];
                const artistMap = new Map();
                
                tracks.forEach(track => {
                    if (track.artist && !artistMap.has(track.artist)) {
                        artistMap.set(track.artist, {
                            id: `artist_${artists.length + 1}`,
                            name: track.artist,
                            popularity: Math.floor(Math.random() * 100),
                            tracks: [track.id],
                            genre: track.genre || 'Pop',
                            image: track.cover
                        });
                    } else if (track.artist) {
                        const artist = artistMap.get(track.artist);
                        artist.tracks.push(track.id);
                        artistMap.set(track.artist, artist);
                    }
                });
                
                artists.push(...artistMap.values());
                
                this.cachedArtists = artists;
                
                return {
                    success: true,
                    artists: artists
                };
            } else {
                return await this.getSimulatedArtistRecommendations();
            }
        } catch (error) {
            console.error('Error getting artist recommendations:', error);
            return await this.getSimulatedArtistRecommendations();
        }
    }
    
    // Get simulated artist recommendations
    async getSimulatedArtistRecommendations() {
        try {
            // Coba beberapa path alternatif untuk data.json
            let data = null;
            const possiblePaths = [
                this.staticPath + 'assets/js/data.json',
                '/assets/js/data.json',
                './assets/js/data.json',
                'assets/js/data.json'
            ];
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to load artist recommendations from ${path}`);
                }
            }
            
            // Jika semua path gagal, gunakan data hardcoded
            if (!data) {
                console.warn('Fallback to hardcoded data for artist recommendations');
                data = {
                    artists: [
                        {
                            id: 1,
                            name: "Artis Populer",
                            genre: "Pop",
                            tracks: [1]
                        },
                        {
                            id: 2,
                            name: "Artis Rock",
                            genre: "Rock",
                            tracks: [2]
                        }
                    ]
                };
            }
            
            let artists = data.artists || [];
            
            // Add some random metrics
            artists = artists.map(artist => ({
                ...artist,
                popularity: Math.floor(Math.random() * 100),
                followers: Math.floor(Math.random() * 1000000),
                image: this.fixImagePath('/assets/images/fallback.svg')
            }));
            
            this.cachedArtists = artists;
            
            return {
                success: true,
                artists: artists,
                simulated: true
            };
        } catch (error) {
            console.error('Error in simulated artist recommendations:', error);
            return {
                success: false,
                error: error.message,
                artists: []
            };
        }
    }

    // Play track (for analytics)
    async playTrack(trackId) {
        try {
            // In a real scenario, we would send a request to OpenWhyd
            // to increment play count and analyze user behavior
            
            // For now, we'll just log it locally
            const savedPlays = JSON.parse(localStorage.getItem('mysic_plays') || '[]');
            savedPlays.push({
                trackId,
                timestamp: Date.now()
            });
            
            localStorage.setItem('mysic_plays', JSON.stringify(savedPlays));
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error tracking play:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Make an API request
    async apiRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${this.apiEndpoint}${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
        
        const defaultOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include'
        };
        
        if (options.body) {
            defaultOptions.body = options.body;
        }
        
        try {
            const response = await fetch(url, defaultOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }
} 