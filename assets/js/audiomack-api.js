// Audiomack API Integration
// Based on documentation at https://www.audiomack.com/data-api/docs

class AudiomackAPI {
    constructor() {
        this.baseUrl = 'https://api.audiomack.com/v1';
        this.cachedTracks = [];
        this.cachedArtists = [];
        this.currentUser = null;
        
        // Set static base path for assets 
        this.staticPath = window.MYSIC_BASE_PATH || '/';
        console.log('Audiomack API initialized');
    }

    // Helper untuk memperbaiki path gambar
    fixImagePath(imagePath) {
        if (!imagePath) return this.staticPath + 'assets/images/fallback.svg';
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        return imagePath.startsWith('/') 
            ? this.staticPath + imagePath.substring(1) 
            : this.staticPath + imagePath;
    }

    // Initialize the API
    async initialize() {
        try {
            await this.loadLocalTracks();
            return true;
        } catch (error) {
            console.error('Failed to initialize Audiomack API:', error);
            return false;
        }
    }
    
    // Load local tracks from data.json
    async loadLocalTracks() {
        try {
            const data = await this.fetchLocalData();
            if (!data) return false;
            
            if (data.tracks) {
                this.cachedTracks = data.tracks.map(track => ({
                    id: track.id,
                    title: track.title,
                    name: track.title,
                    artist: track.artist,
                    duration: track.duration,
                    cover: track.cover,
                    img: track.cover,
                    genre: track.genre || 'Unknown',
                    audioSrc: track.audioSrc || '',
                    nbPlays: Math.floor(Math.random() * 10000)
                }));
            }
            
            if (data.artists) {
                this.cachedArtists = data.artists;
            }
            
            console.log('Loaded local tracks:', this.cachedTracks.length);
            return true;
        } catch (error) {
            console.error('Failed to load local tracks:', error);
            return false;
        }
    }
    
    // Fetch local data from data.json
    async fetchLocalData() {
        try {
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
                        console.log('Successfully loaded data from:', path);
                        return await response.json();
                    }
                } catch (e) {
                    // Continue to next path
                }
            }
            
            throw new Error('Failed to load data from any path');
        } catch (error) {
            console.error('Failed to fetch local data:', error);
            return null;
        }
    }
    
    // User authentication
    async login(email, password) {
        if (email && password) {
            this.currentUser = {
                id: 'user_' + Date.now(),
                name: email.split('@')[0],
                email: email
            };
            
            return { success: true, user: this.currentUser };
        }
        
        return { success: false, error: 'Email atau password tidak valid' };
    }
    
    // Logout
    logout() {
        this.currentUser = null;
        return true;
    }
    
    // Search tracks
    async searchTracks(query, limit = 20) {
        try {
            if (!this.cachedTracks.length) {
                await this.loadLocalTracks();
            }
            
            let tracks = [...this.cachedTracks];
            
            if (query && query.trim() !== '') {
                const lowerCaseQuery = query.toLowerCase();
                tracks = tracks.filter(track => 
                    (track.title && track.title.toLowerCase().includes(lowerCaseQuery)) || 
                    (track.artist && track.artist.toLowerCase().includes(lowerCaseQuery)) ||
                    (track.genre && track.genre.toLowerCase().includes(lowerCaseQuery))
                );
            }
            
            // Format tracks
            tracks = tracks.slice(0, limit).map(track => this.formatTrack(track));
            
            return { success: true, tracks };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to search tracks',
                tracks: []
            };
        }
    }
    
    // Get hot tracks
    async getHotTracks(limit = 10) {
        try {
            if (!this.cachedTracks.length) {
                await this.loadLocalTracks();
            }
            
            // Shuffle tracks
            let tracks = [...this.cachedTracks];
            for (let i = tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }
            
            // Format tracks
            tracks = tracks.slice(0, limit).map(track => ({
                ...this.formatTrack(track),
                nbPlays: Math.floor(Math.random() * 50000) + 10000
            }));
            
            return { success: true, tracks };
        } catch (error) {
            return {
                success: false,
                tracks: [],
                error: 'Failed to get hot tracks'
            };
        }
    }
    
    // Get user playlists
    async getUserPlaylists() {
        try {
            const data = await this.fetchLocalData();
            
            if (!data || !data.playlists) {
                return { success: true, playlists: [] };
            }
            
            // Format playlists
            const playlists = data.playlists.map(playlist => ({
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                trackCount: playlist.tracks ? playlist.tracks.length : 0,
                nbTracks: playlist.tracks ? playlist.tracks.length : 0,
                img: this.staticPath + 'assets/images/fallback.svg',
                user: this.currentUser ? this.currentUser.name : 'Mysic User'
            }));
            
            return { success: true, playlists };
        } catch (error) {
            return {
                success: false,
                playlists: [],
                error: 'Failed to get playlists'
            };
        }
    }
    
    // Get playlist tracks
    async getPlaylistTracks(playlistId) {
        try {
            const data = await this.fetchLocalData();
            
            if (!data || !data.playlists) {
                return { success: false, tracks: [], error: 'No playlists found' };
            }
            
            // Find playlist
            const playlist = data.playlists.find(p => p.id.toString() === playlistId.toString());
            
            if (!playlist) {
                return { success: false, tracks: [], error: 'Playlist not found' };
            }
            
            // Get tracks in playlist
            const trackIds = playlist.tracks || [];
            const tracks = [];
            
            // Get track details
            for (const trackId of trackIds) {
                const track = data.tracks.find(t => t.id.toString() === trackId.toString());
                if (track) {
                    tracks.push(this.formatTrack(track));
                }
            }
            
            return {
                success: true,
                tracks,
                playlist: {
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description
                }
            };
        } catch (error) {
            return {
                success: false,
                tracks: [],
                error: 'Failed to get playlist tracks'
            };
        }
    }
    
    // Create playlist
    async createPlaylist(name, description = '') {
        return {
            success: true,
            playlist: {
                id: Date.now(),
                name,
                description,
                trackCount: 0,
                nbTracks: 0,
                img: this.staticPath + 'assets/images/fallback.svg',
                user: this.currentUser ? this.currentUser.name : 'Mysic User'
            }
        };
    }
    
    // Add track to playlist
    async addTrackToPlaylist(playlistId, trackId) {
        return {
            success: true,
            message: 'Track added to playlist'
        };
    }
    
    // Get artist recommendations
    async getArtistRecommendations() {
        try {
            const data = await this.fetchLocalData();
            
            if (!data || !data.artists) {
                return { success: true, artists: [] };
            }
            
            // Format artists
            const artists = data.artists.map(artist => ({
                id: artist.id,
                name: artist.name,
                genre: artist.genre,
                description: artist.description,
                image: this.staticPath + 'assets/images/fallback.svg',
                img: this.staticPath + 'assets/images/fallback.svg',
                followers: Math.floor(Math.random() * 100000) + 1000,
                popularity: Math.floor(Math.random() * 100)
            }));
            
            return { success: true, artists };
        } catch (error) {
            return {
                success: false,
                artists: [],
                error: 'Failed to get artist recommendations'
            };
        }
    }
    
    // Get artist tracks
    async getArtistTracks(artistId) {
        try {
            const data = await this.fetchLocalData();
            
            if (!data || !data.artists || !data.tracks) {
                return { success: false, tracks: [], error: 'No data found' };
            }
            
            // Find artist
            const artist = data.artists.find(a => a.id.toString() === artistId.toString());
            
            if (!artist) {
                return { success: false, tracks: [], error: 'Artist not found' };
            }
            
            // Get tracks by artist
            const trackIds = artist.tracks || [];
            const tracks = [];
            
            // Get track details
            for (const trackId of trackIds) {
                const track = data.tracks.find(t => t.id.toString() === trackId.toString());
                if (track) {
                    tracks.push(this.formatTrack(track));
                }
            }
            
            return {
                success: true,
                tracks,
                artist: {
                    id: artist.id,
                    name: artist.name,
                    genre: artist.genre,
                    description: artist.description
                }
            };
        } catch (error) {
            return {
                success: false,
                tracks: [],
                error: 'Failed to get artist tracks'
            };
        }
    }
    
    // Play track
    async playTrack(trackId) {
        try {
            if (this.cachedTracks && this.cachedTracks.length > 0) {
                const track = this.cachedTracks.find(t => t.id.toString() === trackId.toString());
                if (track) {
                    return {
                        success: true,
                        track: this.formatTrack(track)
                    };
                }
            }
            
            return {
                success: true,
                message: 'Track play logged'
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to play track'
            };
        }
    }
    
    // Helper to format track data consistently
    formatTrack(track) {
        return {
            ...track,
            _id: `local_${track.id}`,
            name: track.title,
            eId: `am/${this.generateRandomId()}`,
            sourceLabel: 'audiomack',
            img: this.fixImagePath(track.cover),
            nbPlays: track.nbPlays || Math.floor(Math.random() * 5000)
        };
    }
    
    // Helper to generate random ID
    generateRandomId() {
        return Math.random().toString(36).substring(2, 15);
    }
}

// Initialize API
console.log('Audiomack API loaded'); 