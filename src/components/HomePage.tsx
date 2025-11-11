 
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden" style={{ aspectRatio: '1080/1920' }}>
      {/* Background Video optimized for 1080x1920 */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
            width: '100%',
            height: '100%'
          }}
          onError={(e) => console.error('Video error:', e)}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
        >
          <source src="/background-video.mp4" type="video/mp4" />
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50"></div>
      </div>

      {/* Background Image instead of Video */}
          {/* <div className="absolute inset-0 z-0">
        <img 
          src="/background-image.jpg" 
          alt="Background"
          className="w-full h-full object-cover"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
            width: '100%',
            height: '100%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50"></div>
      </div> */}

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center px-12 py-24">
        <div className="w-full px-8 max-w-4xl flex flex-col h-full">
          
          {/* Top Logo */}
          <div className="flex-shrink-0 mt-10 mb-8">
            <img src="/uos-logo-white.png" alt="University of Sheffield" className="h-20 w-auto" />
          </div>
          <div className="flex-shrink-0 mt-0 mb-8">
            <div className="w-full h-[3px] bg-white/80"></div>
          </div>

          {/* Event Information with Real-Time Status */}
          <div className="flex-shrink-0 mt-12 mb-16">
            <div className="mb-8">
              <h1 className="text-white text-7xl font-bold font-source-serif-pro leading-tight">Open Day</h1>
            </div>
            <div className="flex items-center">
              <p className="text-gray-200 text-4xl font-source-sans-pro">Saturday 22 November 2025</p>
            </div>
          </div>
          {/* Main Action Button */}
          <div className="flex-shrink-0 mb-8 flex justify-center">
            <button onClick={() => window.location.href = 'https://sheffield.ac.uk/undergraduate/visit/your-open-day-guide/diamond'} className="w-full max-w-3xl bg-[#23125E] text-white py-16 px-10 rounded-3xl text-4xl font-bold text-center font-source-serif-pro hover:bg-[#2a1a6b] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl">
              What's on in the Diamond
            </button>
          </div>

          {/* Secondary Buttons */}
          <div className="flex-shrink-0 flex space-x-8 mb-8 justify-center">
            <div className="flex space-x-8 max-w-3xl w-full">
              <button onClick={() => window.location.href = 'https://sheffield.ac.uk/undergraduate/visit/your-open-day-guide/subject-talks-november'} className="flex-1 bg-[#7000FF] text-white py-16 px-8 rounded-3xl text-4xl font-bold font-source-serif-pro hover:bg-[#7a0aff] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                Subject talks
              </button>
              <button onClick={() => navigate('/university-talks')} className="flex-1 bg-[#7000FF] text-white py-16 px-8 rounded-3xl text-4xl font-bold font-source-serif-pro hover:bg-[#7a0aff] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                University talks
              </button>
            </div>
          </div>

          {/* Open Day Guide Card - Enhanced with interactive elements */}
          <div className="flex-shrink-0 mb-8 flex justify-center">
            <div className="w-full max-w-3xl bg-gradient-to-br from-black/20 to-black/20 backdrop-blur-lg border-2 border-white/20 rounded-3xl py-16 px-12 shadow-2xl hover:from-gray-800/40 hover:to-gray-700/40 hover:border-gray-500/50 transition-all duration-300 cursor-pointer group" onClick={() => window.location.href = 'https://sheffield.ac.uk/undergraduate/visit/your-open-day-guide'}>
              <div className="flex items-center justify-center space-x-4">
                <h2 className="text-white text-4xl font-bold font-source-serif-pro drop-shadow-lg group-hover:text-white/90 transition-colors duration-300">
                  Your open day guide
                </h2>
              </div>
            </div>
          </div>

          {/* Video Gallery Card - Redesigned without thumbnail */}
          <div className="flex-shrink-0 mb-20 flex justify-center">
            <div 
              onClick={() => navigate('/video-gallery')}
              className="w-full max-w-3xl bg-gradient-to-r from-black/20 to-black/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12 cursor-pointer hover:from-gray-800/40 hover:to-gray-700/40 hover:border-gray-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl group"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    {/* TikTok-style icon */}
                    <div className="bg-black/20 border-2 border-white/20 rounded-full p-3 group-hover:bg-gray-700/40 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </div>
                    <h3 className="text-white text-4xl font-bold font-source-serif-pro drop-shadow-lg group-hover:text-white/90 transition-colors duration-300 tracking-wider">
                      Student TikTok Videos
                    </h3>
                  </div>
                  <p className="text-gray-300 text-2xl ml-16">Watch student life highlights and experiences</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-6 group-hover:bg-gray-700/40 group-hover:border-gray-500/50 transition-all duration-300">
                  <ArrowUpRight className="text-white w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Ranking Logos - QS and Russell Group in one row */}
          <div className="flex-shrink-0 mt-24">
            <div className="flex items-center justify-center gap-20">
              <img
                src="/RG.png"
                alt="Russell Group"
                className="h-16 md:h-20 lg:h-24 w-auto"
                decoding="async"
                loading="eager"
              />
              <img
                src="/QS.png"
                alt="A World Top 100 University"
                className="h-20 md:h-24 lg:h-28 w-auto"
                decoding="async"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
