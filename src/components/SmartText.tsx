import { useMemo, useEffect, useState, useRef } from 'react';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

interface ExclusionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SmartTextProps {
  text: string;
  font: string;
  className?: string;
  exclusionBoxes?: Array<ExclusionBox> | null;
}

export function SmartText({ text, font, className = '', exclusionBoxes = null }: SmartTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [localExclusions, setLocalExclusions] = useState<Array<ExclusionBox> | null>(null);

  // Pre-calculate the heavy text segments and metrics
  const prepared = useMemo(() => {
    try {
      return prepareWithSegments(text, font);
    } catch (e) {
      console.error('Pretext prepare failed:', e);
      return null;
    }
  }, [text, font]);

  // Update width on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    
    // Initial measurement
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0) {
      setWidth(Math.floor(rect.width));
    }
    
    return () => observer.disconnect();
  }, []);

  // Map viewport-based exclusionBoxes coordinates to paragraph-local coordinates
  useEffect(() => {
    if (!exclusionBoxes || exclusionBoxes.length === 0 || !containerRef.current || width === 0) {
      setLocalExclusions(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const mapped = exclusionBoxes.map(box => {
      const x = box.x - containerRect.left;
      const y = box.y - containerRect.top;
      return {
        x,
        y,
        width: box.width,
        height: box.height
      };
    });

    setLocalExclusions(mapped);
  }, [exclusionBoxes, width]);

  // Calculate dynamic size from font string for line-height and height styles
  const fontSize = useMemo(() => {
    const fontSizeMatch = font.match(/(\d+(\.\d+)?)px/);
    if (fontSizeMatch) return parseFloat(fontSizeMatch[1]);
    const emMatch = font.match(/(\d+(\.\d+)?)rem/);
    if (emMatch) return parseFloat(emMatch[1]) * 16;
    return 16;
  }, [font]);

  const lineHeight = fontSize * 1.85; // Matches leading-[1.85] leading

  // Line-by-line compiler
  const laidOutLines = useMemo(() => {
    if (!prepared || width === 0) return [];

    const lines: Array<{
      text: string;
      width: number;
      left: number;
      maxWidth: number;
      y: number;
    }> = [];

    let start = { segmentIndex: 0, graphemeIndex: 0 };
    let currentY = 0;
    let index = 0;

    const padding = 20; // Padding around the exclusion card

    try {
      while (true) {
        let lineMaxWidth = width;
        let lineLeft = 0;

        // Check vertical overlap with paragraph-local exclusionBoxes
        let activeBox: ExclusionBox | null = null;
        if (localExclusions && localExclusions.length > 0) {
          for (const box of localExclusions) {
            const yStart = currentY;
            const yEnd = yStart + lineHeight;
            const boxBottom = box.y + box.height;
            const boxTop = box.y;

            if (yStart < boxBottom && yEnd > boxTop) {
              activeBox = box;
              break;
            }
          }
        }

        if (activeBox) {
          // Line intersects with this exclusion card vertically!
          const boxLeft = activeBox.x;
          const boxRight = activeBox.x + activeBox.width;

          // Route text to the side with more available space
          const spaceLeft = boxLeft - padding;
          const spaceRight = width - boxRight - padding;

          if (spaceLeft > spaceRight) {
            // Wrap on the left side
            lineMaxWidth = Math.max(80, spaceLeft); // Minimum width safety bounds
            lineLeft = 0;
          } else {
            // Wrap on the right side
            lineMaxWidth = Math.max(80, spaceRight);
            lineLeft = boxRight + padding;
          }
        }

        const prevStart = { ...start };
        const line = layoutNextLine(prepared, start, lineMaxWidth);
        if (!line) break;

        // Prevent infinite loops if start cursor does not advance
        if (line.end.segmentIndex === prevStart.segmentIndex && line.end.graphemeIndex === prevStart.graphemeIndex) {
          break;
        }

        lines.push({
          text: line.text,
          width: line.width,
          left: lineLeft,
          maxWidth: lineMaxWidth,
          y: currentY,
        });

        // Advance to the end of the current line
        start = line.end;
        currentY += lineHeight;
        index++;

        if (index > 1000) break; // Infinite loop safety break
      }
    } catch (e) {
      console.error('Pretext layout failed:', e);
    }

    return lines;
  }, [prepared, width, font, localExclusions, lineHeight]);

  // Fallback rendering during initial loading or measurement
  if (laidOutLines.length === 0) {
    return (
      <div ref={containerRef} className={`w-full opacity-0 ${className}`} style={{ font }}>
        {text}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full relative ${className}`} style={{ font }}>
      <div 
        style={{ 
          height: `${laidOutLines.length * lineHeight}px`,
          position: 'relative'
        }}
      >
        {laidOutLines.map((line, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: `${line.y}px`,
              left: `${line.left}px`,
              width: `${line.maxWidth}px`,
              height: `${lineHeight}px`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'clip'
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
