import React, { useRef, useEffect, useState } from "react";

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

  return (
    // ESTILO LIMPIO: Los bordes redondeados y la sombra son perfectos.
    <div className="w-full aspect-video bg-black rounded-2xl shadow-xl overflow-hidden">
      <video
        ref={videoRef}
        poster={poster} // Muestra la miniatura (thumbnail) mientras carga
        loop
        muted
        autoPlay={isInView}
        playsInline
        className="w-full h-full object-cover"
        controls
      >
        {/* Solo añadimos el <source> cuando el vídeo está a la vista */}
        {isInView && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
};

export default VideoPlayer;
