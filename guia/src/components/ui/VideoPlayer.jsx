import React, { useRef, useEffect, useState } from "react";

// Componente de Reproductor de Vídeo con carga diferida (lazy loading)
const VideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // El "IntersectionObserver" vigila cuándo el vídeo
    // entra en la pantalla del usuario.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true); // Cuando es visible, activamos la carga
          observer.disconnect(); // Dejamos de vigilar
        }
      },
      {
        threshold: 0.25, // Cargar cuando el 25% del vídeo sea visible
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Función para pausar o reproducir el vídeo al hacer clic/tocar sobre él
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    // Hemos añadido "cursor-pointer" y el evento "onClick" al contenedor
    <div 
      className="w-full aspect-video bg-black rounded-2xl shadow-xl overflow-hidden cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        poster={poster} // Muestra la miniatura (thumbnail) mientras carga
        loop
        muted // Mantiene el vídeo silenciado por defecto
        autoPlay={isInView}
        playsInline
        controls // <-- Vuelven los controles para poder ampliar a pantalla completa
        className="w-full h-full object-cover hide-audio-button" // <-- Añadimos esta clase para el CSS
      >
        {/* Solo añadimos el <source> cuando el vídeo está a la vista */}
        {isInView && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
};

export default VideoPlayer;