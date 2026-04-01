import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music as MusicIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

const tracks: Track[] = [
  {
    id: '1',
    title: 'Cyberpunk Night',
    artist: 'Neural Core',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/cyber/200/200'
  },
  {
    id: '2',
    title: 'Neon Dreams',
    artist: 'Jarvis Protocol',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/neon/200/200'
  },
  {
    id: '3',
    title: 'System Override',
    artist: 'Jani AI',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/system/200/200'
  }
];

export const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center h-full gap-8">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-64 h-64"
      >
        <div className="absolute inset-0 rounded-full border-4 border-jarvis-blue/20 animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border-2 border-jarvis-blue/40 animate-spin-slow-reverse" />
        <img
          src={currentTrack.cover}
          alt={currentTrack.title}
          className="w-full h-full rounded-full object-cover p-8"
          referrerPolicy="no-referrer"
        />
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex gap-1 items-end h-12">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 40, 10] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-jarvis-blue rounded-full"
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="text-center">
        <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-1">{currentTrack.title}</h3>
        <p className="text-sm font-mono text-jarvis-blue uppercase tracking-widest opacity-60">{currentTrack.artist}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="relative h-1 bg-jarvis-blue/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-jarvis-blue shadow-[0_0_10px_#00d2ff]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-8">
          <button onClick={handlePrev} className="text-jarvis-blue/60 hover:text-white transition-colors">
            <SkipBack size={32} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-jarvis-blue text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,210,255,0.4)] hover:scale-110 transition-all"
          >
            {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
          </button>
          <button onClick={handleNext} className="text-jarvis-blue/60 hover:text-white transition-colors">
            <SkipForward size={32} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-jarvis-blue/40">
        <Volume2 size={20} />
        <div className="w-32 h-1 bg-jarvis-blue/10 rounded-full">
          <div className="w-2/3 h-full bg-jarvis-blue/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
