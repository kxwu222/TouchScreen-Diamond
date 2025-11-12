import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

const VideoGallery = () => {
  useIdleTimeout();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Videos should be audible; we keep them unmuted on user tap
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const hideControlsTimeout = useRef<number | null>(null);

  // Build TikTok embed URL from a TikTok share link
  const getTikTokEmbedUrl = (tiktokUrl: string) => {
    const match = tiktokUrl.match(/video\/(\d+)/);
    const id = match && match[1];
    return id ? `https://www.tiktok.com/embed/v2/${id}?autoplay=1&muted=1` : undefined;
  };

  type VideoItem = {
    id: number;
    title: string;
    tiktokUrl: string;
    embedUrl?: string;
    thumbnail?: string;
    videoUrl: string;
  };

  // TikTok videos (9:16)
  const initialVideos: VideoItem[] = [
    {
      id: 1,
      title: "Student life through student eyes",
      tiktokUrl: "https://www.tiktok.com/@sheffielduni/video/7533262488993926422?_r=1&_t=ZN-8zwMGDwMqCE",
      embedUrl: getTikTokEmbedUrl("https://www.tiktok.com/@sheffielduni/video/7533262488993926422?_r=1&_t=ZN-8zwMGDwMqCE"),
      videoUrl: "/videos/student-life-through-student-eyes.mp4"
    },
    {
      id: 2,
      title: "Your QS World Top 100 University",
      tiktokUrl: "https://www.tiktok.com/@sheffielduni/video/7517567342738410774?lang=en",
      embedUrl: getTikTokEmbedUrl("https://www.tiktok.com/@sheffielduni/video/7517567342738410774?lang=en"),
      videoUrl: "/videos/qs-top-100.mp4"
    },
    {
      id: 3,
      title: "Day in the life in Sheffield",
      tiktokUrl: "https://www.tiktok.com/@sheffielduni/video/7496900666883886358?_r=1&_t=ZN-8zwMPIDTH3m",
      embedUrl: getTikTokEmbedUrl("https://www.tiktok.com/@sheffielduni/video/7496900666883886358?_r=1&_t=ZN-8zwMPIDTH3m"),
      videoUrl: "/videos/come-along-to-a-studio-session.mp4"
    },
    {
      id: 4,
      title: "Best things in Uni Accommodation",
      tiktokUrl: "https://www.tiktok.com/@sheffielduni/video/7491321768066419990?_r=1&_t=ZN-8zwMfUmRruA",
      embedUrl: getTikTokEmbedUrl("https://www.tiktok.com/@sheffielduni/video/7491321768066419990?_r=1&_t=ZN-8zwMfUmRruA"),
      videoUrl: "/videos/best-things-in-uni-accommodation.mp4"
    },
    {
      id: 5,
      title: "Varsity Sports Park",
      tiktokUrl: "https://www.tiktok.com/@sheffielduni/video/7487992211024399638?_r=1&_t=ZN-8zwMiFWhfqI",
      embedUrl: getTikTokEmbedUrl("https://www.tiktok.com/@sheffielduni/video/7487992211024399638?_r=1&_t=ZN-8zwMiFWhfqI"),
      videoUrl: "/videos/varsity-sports-park.mp4"
    },
    {
      id: 6,
      title: "Student Guide in Sheffield",
      tiktokUrl: "https://www.tiktok.com/@sheffielduni/video/7485785008922168598?lang=en",
      embedUrl: getTikTokEmbedUrl("https://www.tiktok.com/@sheffielduni/video/7485785008922168598?lang=en"),
      videoUrl: "/videos/student-guide-in-sheffield.mp4"
    }
  ];

  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);

  const handleVideoClick = (videoId: number) => {
    setPlayingVideo(videoId);
    setShowControls(true);
    resetHideControlsTimer();
  };

  // Removed unused stopVideo to satisfy linter

  const goBackToHome = () => {
    window.history.length > 1 ? window.history.back() : (window.location.href = '/home');
  };

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setPlayingVideo(null); // Stop any playing video when navigating
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setPlayingVideo(null); // Stop any playing video when navigating
  };

  // Auto-advance carousel every 5 seconds (only if no video is playing)
  useEffect(() => {
    if (playingVideo === null) {
      const interval = setInterval(nextVideo, 5000);
      return () => clearInterval(interval);
    }
  }, [playingVideo]);

  // Fetch TikTok thumbnails via oEmbed and set loading false after
  useEffect(() => {
    let isMounted = true;
    const resolveThumbnails = async () => {
      try {
        const updated = await Promise.all(
          videos.map(async (item) => {
            try {
              const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(item.tiktokUrl)}`);
              if (!res.ok) throw new Error('oEmbed fetch failed');
              const data = await res.json();
              return { ...item, thumbnail: data.thumbnail_url as string } as VideoItem;
            } catch (e) {
              return item;
            }
          })
        );
        if (isMounted) {
          setVideos(updated);
          setIsLoading(false);
        }
      } catch (e) {
        setIsLoading(false);
      }
    };
    resolveThumbnails();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helpers to manage transient controls visibility
  const resetHideControlsTimer = () => {
    if (hideControlsTimeout.current) window.clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = window.setTimeout(() => setShowControls(false), 2500);
  };

  // Keep isPaused in sync with actual video state and ensure unmuted when playing
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handlePlay = () => setIsPaused(false);
    const handlePause = () => setIsPaused(true);
    el.addEventListener('play', handlePlay);
    el.addEventListener('pause', handlePause);
    if (playingVideo !== null) {
      try {
        el.muted = false;
        const p = el.play();
        if (p && typeof p.then === 'function') {
          p.then(() => setIsPaused(false)).catch(() => setIsPaused(true));
        }
      } catch {
        setIsPaused(true);
      }
    }
    return () => {
      el.removeEventListener('play', handlePlay);
      el.removeEventListener('pause', handlePause);
    };
  }, [playingVideo]);

  // Handle video loading and autoplay issues
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      const handleVideoError = () => {
        console.error('Background video failed to load');
        setVideoError(true);
      };

      const handleVideoLoad = () => {
        console.log('Background video loaded successfully');
        setVideoError(false);
      };

      video.addEventListener('error', handleVideoError);
      video.addEventListener('loadeddata', handleVideoLoad);

      // Try to play the video
      video.play().catch((error) => {
        console.warn('Autoplay failed:', error);
        // Video will show fallback background
      });

      return () => {
        video.removeEventListener('error', handleVideoError);
        video.removeEventListener('loadeddata', handleVideoLoad);
      };
    }
  }, []);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden" style={{ aspectRatio: '1080/1920' }}>
      {/* Background Video optimized for 1080x1920 */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{
              objectFit: 'cover',
              objectPosition: 'center center',
              width: '100%',
              height: '100%'
            }}
            onError={(e) => {
              console.error('Video error:', e);
              const target = e.currentTarget as HTMLVideoElement;
              console.error('Video src:', target.currentSrc || target.src);
              setVideoError(true);
            }}
            onLoadStart={() => console.log('Video loading started')}
            onCanPlay={() => console.log('Video can play')}
            onLoadedData={() => console.log('Video data loaded')}
            onLoad={() => console.log('Video loaded')}
          >
            <source src="/background-video.mp4" type="video/mp4" />
            <source src="/bg-2.mp4" type="video/mp4" />
          </video>
        ) : (
          /* Fallback background when video fails - show video thumbnail */
          <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: thumbnailError ? 'none' : 'url(/opening.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}>
            {/* Fallback gradient overlay if thumbnail also fails */}
            <div className={`w-full h-full ${thumbnailError ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' : 'bg-black/20'}`}></div>
            {/* Hidden image to test thumbnail loading */}
            <img 
              src="/opening.png" 
              alt="Background thumbnail"
              className="hidden"
              onError={() => setThumbnailError(true)}
              onLoad={() => setThumbnailError(false)}
            />
        </div>
        )}
        {/* Enhanced background overlay with more depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col px-12 py-24">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
          {/* Header - aligned with content container */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex-shrink-0 mt-[72px] mb-8">
              <h1 className="text-white text-5xl font-source-serif-pro font-bold">Student experience videos</h1>
            </div>
            <div className="flex-shrink-0 mt-0 mb-8">
              <div className="w-full h-[3px] bg-white/80"></div>
            </div>
            <div className="flex-shrink-0 mt-12 mb-10">
              <p className="text-gray-200 text-3xl my-4">Click right or left to view more videos</p>
            </div>
          </div>

          {/* Carousel Container - Independent positioning */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
            <div className="relative flex items-center justify-center gap-4 transition-transform duration-500 ease-in-out">
              
              {/* Previous Video (Left) - Fixed aspect ratio */}
              {videos.length > 1 && (
                <div 
                  className="absolute left-0 z-10 w-[280px] opacity-60 transform -translate-x-20 hover:opacity-80 transition-all duration-300 cursor-pointer"
                  onClick={prevVideo}
                  style={{ aspectRatio: '9/16', height: '498px' }}
                >
                  <div className="relative group overflow-hidden rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/10 animate-fade-in-up w-full h-full">
                    {isLoading ? (
                      <div className="w-full h-full bg-gray-300 animate-pulse rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-400 to-transparent"></div>
                      </div>
                    ) : (
                      <img 
                        src={videos[(currentIndex - 1 + videos.length) % videos.length].thumbnail}
                        alt={videos[(currentIndex - 1 + videos.length) % videos.length].title}
                        className="w-full h-full object-cover"
                        onLoad={() => setIsLoading(false)}
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 z-20">
                      <div className="bg-black/30 backdrop-blur-md rounded-lg p-4">
                        <h3 className="text-white font-bold text-2xl leading-relaxed font-source-serif-pro drop-shadow-lg line-clamp-2">
                          {videos[(currentIndex - 1 + videos.length) % videos.length].title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Video (Center) */}
              <div 
                className="relative z-20 w-[560px] h-[996px] cursor-pointer transform hover:scale-105 hover:shadow-3xl transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
                onClick={() => handleVideoClick(videos[currentIndex].id)}
              style={{ aspectRatio: '9/16' }}
            >
                <div className="relative group overflow-hidden rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] w-full h-full border border-white/10 group-hover:ring-2 group-hover:ring-white/30 group-hover:ring-offset-2 group-hover:ring-offset-transparent animate-fade-in-up">
                  {playingVideo === videos[currentIndex].id ? (
                    // Play local MP4 inline
                    <>
                    <video
                      src={(videos[currentIndex] as any).videoUrl}
                      autoPlay
                      muted={false}
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      ref={videoRef}
                      onTimeUpdate={(e) => {
                        const el = e.currentTarget;
                        if (el.duration) setProgress(el.currentTime / el.duration);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowControls(true);
                        resetHideControlsTimer();
                      }}
                    />
                    {/* Inline Controls - appear on interaction */}
                    {showControls && (
                      <>
                      {/* Center Play/Pause */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                        <button
                          aria-label={isPaused ? 'Play' : 'Pause'}
                          className="pointer-events-auto bg-white/30 backdrop-blur-md border-2 border-white/60 text-white rounded-full p-8 hover:bg-white/50 transition shadow-[0_10px_25px_rgba(0,0,0,0.45)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!videoRef.current) return;
                            if (isPaused) {
                              videoRef.current.play();
                            } else {
                              videoRef.current.pause();
                            }
                            setIsPaused(!isPaused);
                            resetHideControlsTimer();
                          }}
                        >
                          {isPaused ? <Play className="w-14 h-14 drop-shadow" /> : <Pause className="w-14 h-14 drop-shadow" />}
                        </button>
                      </div>

                      {/* Bottom progress bar area */}
                      <div className="absolute inset-x-0 bottom-0 z-30 p-6 space-y-4 select-none" onClick={(e) => e.stopPropagation()}>
                        {/* Progress bar */}
                        <div
                          className="w-full h-3 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                          onClick={(e) => {
                            if (!videoRef.current) return;
                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                            const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                            videoRef.current.currentTime = ratio * (videoRef.current.duration || 0);
                            setProgress(ratio);
                            resetHideControlsTimer();
                          }}
                        >
                          <div className="h-full bg-white" style={{ width: `${Math.round(progress * 100)}%` }} />
                        </div>
                      </div>
                      </>
                    )}
                    </>
                  ) : (
                    // Thumbnail with Play Button
                    <>
                      {isLoading ? (
                        <div className="w-full h-full bg-gray-300 animate-pulse rounded-3xl">
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-400 to-transparent"></div>
                        </div>
                      ) : (
                        <img 
                          src={videos[currentIndex].thumbnail}
                          alt={videos[currentIndex].title}
                className="w-full h-full object-cover"
                          onLoad={() => setIsLoading(false)}
              />
                      )}
              
                      {/* Enhanced Play Button Overlay with Glass UI */}
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-12 group-hover:bg-white/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 transform group-hover:scale-110">
                          <Play className="w-16 h-16 text-white drop-shadow-lg" fill="white" />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Enhanced Title with better contrast - Text container spans full card without blur */}
                  <div className={`absolute inset-0 bg-black/20 rounded-lg p-4 flex items-end z-10 ${showControls ? 'pb-8' : ''}`}>
                    <div className="w-full backdrop-blur-sm rounded-lg p-4">
                      <h2 className="text-white font-bold text-3xl leading-tight font-source-serif-pro drop-shadow-lg">
                        {videos[currentIndex].title}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Video (Right) - Fixed aspect ratio */}
              {videos.length > 1 && (
                <div 
                  className="absolute right-0 z-10 w-[280px] opacity-60 transform translate-x-20 hover:opacity-80 transition-all duration-300 cursor-pointer"
                  onClick={nextVideo}
                  style={{ aspectRatio: '9/16', height: '498px' }}
                >
                  <div className="relative group overflow-hidden rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/10 animate-fade-in-up w-full h-full">
                    {isLoading ? (
                      <div className="w-full h-full bg-gray-300 animate-pulse rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-400 to-transparent"></div>
                      </div>
                    ) : (
                      <img 
                        src={videos[(currentIndex + 1) % videos.length].thumbnail}
                        alt={videos[(currentIndex + 1) % videos.length].title}
                        className="w-full h-full object-cover"
                        onLoad={() => setIsLoading(false)}
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 z-20">
                      <div className="bg-black/30 backdrop-blur-md rounded-lg p-4">
                        <h3 className="text-white font-bold text-2xl leading-relaxed font-source-serif-pro drop-shadow-lg line-clamp-2">
                          {videos[(currentIndex + 1) % videos.length].title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Navigation Arrows - Positioned within visible bounds */}
            <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-30">
              <button
                onClick={prevVideo}
                aria-label="Previous video"
                className="bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-full p-6 text-white hover:bg-white/50 hover:scale-110 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            </div>
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 z-30">
              <button
                onClick={nextVideo}
                aria-label="Next video"
                className="bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-full p-6 text-white hover:bg-white/50 hover:scale-110 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>

            {/* Dots Indicator - centered right below the main video card */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(50%+600px)] z-20">
              <div className="flex items-center gap-3">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to video ${index + 1}`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setPlayingVideo(null);
                    }}
                    className={`rounded-full transition-all duration-200 ${
                      index === currentIndex
                        ? 'w-6 h-6 bg-white shadow-md'
                        : 'w-5 h-5 bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
        </div>
        </div>
      </div>

      {/* Enhanced Footer - Taller with better spacing and touch-friendly button */}
      <div className="absolute bottom-0 left-0 right-0 z-20 ">
        <div className="bg-gradient-to-r from-[#24125E] to-[#2a1a6b] border-t border-white/10 shadow-2xl" onClick={goBackToHome}>
          <div className="px-12 py-12">
            <div className="pb-12">
              <button
                aria-label="Back to home"
                className="bg-gradient-to-r from-[#7000FF] to-[#7a0aff] text-white px-16 py-8 rounded-3xl flex items-center justify-center space-x-6 mx-auto shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent w-fit"
              >
                <Home className="w-12 h-12" />
                <span className="text-4xl font-bold font-source-serif-pro">Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VideoGallery;
