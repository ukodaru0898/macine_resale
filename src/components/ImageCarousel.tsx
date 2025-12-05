import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'

interface ImageCarouselProps {
  images: string[]
  interval?: number
  height?: string | number
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  interval = 4000, 
  height = 400 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, interval)
    
    return () => clearInterval(timer)
  }, [images.length, interval])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderRadius: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Images Container */}
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          transition: 'transform 0.8s ease-in-out',
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((image, index) => (
          <Box
            key={index}
            component="img"
            src={image}
            alt={`Slide ${index + 1}`}
            sx={{
              width: '100%',
              height: '100%',
              minWidth: '100%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ))}
      </Box>

      {/* Navigation Dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 10,
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleDotClick(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
        ))}
      </Box>

      {/* Auto-scroll Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 3,
          backgroundColor: '#1976d2',
          animation: `progress ${interval}ms linear infinite`,
          '@keyframes progress': {
            '0%': {
              width: '0%',
            },
            '100%': {
              width: '100%',
            },
          },
        }}
      />
    </Box>
  )
}

export default ImageCarousel
