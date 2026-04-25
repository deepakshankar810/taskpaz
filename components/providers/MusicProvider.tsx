'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Station {
  id: string;
  name: string;
  author: string;
  thumbnail: string;
}

const INITIAL_STATIONS: Station[] = [
  {
    id: 'jfKfPfyJRdk',
    name: 'Lofi Hip Hop',
    author: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/0.jpg',
  },
  {
    id: '5yx6BWVnrKY',
    name: 'Chillhop Radio',
    author: 'Chillhop Music',
    thumbnail: 'https://img.youtube.com/vi/5yx6BWVnrKY/0.jpg',
  },
  {
    id: '4xDzrJKXOOY',
    name: 'Synthwave Radio',
    author: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/0.jpg',
  },
];

interface MusicContextType {
  currentStation: Station;
  isPlaying: boolean;
  isRepeating: boolean;
  isSearching: boolean;
  togglePlay: () => void;
  toggleRepeat: () => void;
  nextStation: () => void;
  prevStation: () => void;
  searchSong: (query: string) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station>(INITIAL_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleRepeat = () => setIsRepeating(!isRepeating);

  const nextStation = () => {
    const index = INITIAL_STATIONS.findIndex(s => s.id === currentStation.id);
    if (index !== -1) {
      setCurrentStation(INITIAL_STATIONS[(index + 1) % INITIAL_STATIONS.length]);
    } else {
      setCurrentStation(INITIAL_STATIONS[0]);
    }
    setIsPlaying(true);
  };

  const prevStation = () => {
    const index = INITIAL_STATIONS.findIndex(s => s.id === currentStation.id);
    if (index !== -1) {
      setCurrentStation(INITIAL_STATIONS[(index - 1 + INITIAL_STATIONS.length) % INITIAL_STATIONS.length]);
    } else {
      setCurrentStation(INITIAL_STATIONS[0]);
    }
    setIsPlaying(true);
  };

  const searchSong = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.id) {
        setCurrentStation(data);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <MusicContext.Provider value={{ 
      currentStation, 
      isPlaying, 
      isRepeating,
      isSearching, 
      togglePlay, 
      toggleRepeat,
      nextStation, 
      prevStation, 
      searchSong 
    }}>
      {children}
      
      {/* Persistent Audio Engine */}
      {isPlaying && (
        <div className="hidden pointer-events-none opacity-0 invisible overflow-hidden w-0 h-0">
          <iframe
            key={currentStation.id + (isRepeating ? '-repeat' : '')}
            width="1"
            height="1"
            src={`https://www.youtube.com/embed/${currentStation.id}?autoplay=1&mute=0&controls=0&showinfo=0${isRepeating ? `&loop=1&playlist=${currentStation.id}` : ''}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      )}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
