import type { SpringOptions } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import BorderGlow from './BorderGlow';

interface TiltedCardProps {
  imageSrc: React.ComponentProps<'img'>['src'];
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties['height'];
  containerWidth?: React.CSSProperties['width'];
  imageHeight?: React.CSSProperties['height'];
  imageWidth?: React.CSSProperties['width'];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
  isDragging?: boolean;
  useBorderGlow?: boolean;
  borderRadius?: number | string;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2
};

export default function TiltedCard({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '100%',
  imageHeight = '300px',
  imageWidth = '300px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  isDragging = false,
  useBorderGlow = true,
  borderRadius = 15
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1
  });

  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    if (isDragging) {
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1.25);
      opacity.set(0);
      rotateFigcaption.set(0);
    }
  }, [isDragging, rotateX, rotateY, scale, opacity, rotateFigcaption]);

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (isDragging) return;
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    if (isDragging) return;
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale
        }}
      >
        {useBorderGlow ? (
          <BorderGlow
            borderRadius={typeof borderRadius === 'number' ? borderRadius : parseInt(borderRadius as string, 10) || 15}
            glowColor="270 80 80"
            glowRadius={40}
            glowIntensity={2.0}
            coneSpread={30}
            animated={true}
            colors={["#a78bfa", "#f472b6", "#B071DF"]}
            backgroundColor="transparent"
            borderWidth={2.5}
            className="w-full h-full"
          >
            {typeof imageSrc === 'string' && (imageSrc.endsWith('.mp4') || imageSrc.endsWith('.av1') || imageSrc.endsWith('.webm')) ? (
              <motion.video
                src={imageSrc}
                autoPlay
                loop
                muted
                playsInline
                draggable="false"
                className="w-full h-full object-cover"
                style={{ borderRadius }}
              />
            ) : (
              <motion.img
                src={imageSrc}
                alt={altText}
                draggable="false"
                className="w-full h-full object-cover"
                style={{ borderRadius }}
              />
            )}

            {/* Transparent overlay for drag-anywhere capturing and ghost-drag prevention */}
            <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" style={{ borderRadius }} />
          </BorderGlow>
        ) : (
          <>
            {typeof imageSrc === 'string' && (imageSrc.endsWith('.mp4') || imageSrc.endsWith('.av1') || imageSrc.endsWith('.webm')) ? (
              <motion.video
                src={imageSrc}
                autoPlay
                loop
                muted
                playsInline
                draggable="false"
                className="absolute top-0 left-0 object-cover"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  borderRadius
                }}
              />
            ) : (
              <motion.img
                src={imageSrc}
                alt={altText}
                draggable="false"
                className="absolute top-0 left-0 object-cover"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  borderRadius
                }}
              />
            )}

            {/* Transparent overlay for drag-anywhere capturing and ghost-drag prevention */}
            <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" style={{ borderRadius }} />
          </>
        )}

        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
