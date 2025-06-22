import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="relative w-24 h-24">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-6 bg-blue-400 rounded-b-full 
                      animate-rain opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${0.5 + Math.random() * 1}s`
            }}
          ></div>
        ))}
        <style jsx>{`
          @keyframes rain {
            0% { transform: translateY(-20px); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(24px); opacity: 0; }
          }
          .animate-rain {
            animation: rain infinite linear;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Loader;