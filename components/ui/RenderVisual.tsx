"use client";

interface Props {
  src: string;
  alt?: string;
  className?: string;
}

export default function RenderVisual({ src, alt = "Visual", className = "" }: Props) {
  if (!src) return null;

  // Deteksi Kode SVG Mentah
  if (src.trim().startsWith("<svg")) {
    return (
      <div 
        className={`${className} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full`} 
        dangerouslySetInnerHTML={{ __html: src }} 
        title={alt}
      />
    );
  }

  // Deteksi URL Gambar Biasa
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}