import { useState, useEffect } from "react";
import { X, MapPin, Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const categories = [
  { name: "Cafe", color: "#E68161" },
  { name: "Beach", color: "#5DB8D4" },
  { name: "Park", color: "#22C55E" },
  { name: "Restaurant", color: "#F59E0B" },
  { name: "Museum", color: "#8B5CF6" },
  { name: "Bar", color: "#EC4899" },
];

const mockResults = [
  {
    id: "1",
    name: "Bronte Beach",
    category: "Beach",
    rating: 4.8,
    distance: "2.3 km",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
  },
  {
    id: "2",
    name: "The Grounds of Alexandria",
    category: "Cafe",
    rating: 4.6,
    distance: "4.1 km",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop",
  },
  {
    id: "3",
    name: "Royal Botanic Garden",
    category: "Park",
    rating: 4.9,
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=500&fit=crop",
  },
];

interface SurpriseWheelProps {
  onClose: () => void;
}

export function SurpriseWheel({ onClose }: SurpriseWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof mockResults[0] | null>(null);
  const [radius, setRadius] = useState([5]);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Random rotation (5-8 full spins + random offset)
    const spins = 5 + Math.random() * 3;
    const randomOffset = Math.random() * 360;
    const finalRotation = spins * 360 + randomOffset;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      // Pick random result
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(randomResult);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold">Feeling Lucky?</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {!result ? (
          <>
            {/* Wheel */}
            <div className="relative w-64 h-64">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
              </div>
              
              {/* Spinning Wheel */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full transition-transform duration-[3000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {categories.map((cat, i) => {
                  const angle = 360 / categories.length;
                  const startAngle = i * angle - 90;
                  const endAngle = startAngle + angle;
                  
                  const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  
                  const midAngle = startAngle + angle / 2;
                  const textX = 100 + 55 * Math.cos((midAngle * Math.PI) / 180);
                  const textY = 100 + 55 * Math.sin((midAngle * Math.PI) / 180);
                  
                  return (
                    <g key={cat.name}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={cat.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      >
                        {cat.name}
                      </text>
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="20" fill="white" />
                <circle cx="100" cy="100" r="16" fill="hsl(var(--primary))" />
              </svg>
            </div>
            
            {/* Radius Slider */}
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Radius</span>
                <span className="font-semibold text-primary">{radius[0]} km</span>
              </div>
              <Slider
                value={radius}
                onValueChange={setRadius}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Spin Button */}
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="surprise-button text-lg px-12"
              size="lg"
            >
              {isSpinning ? "Spinning..." : "SURPRISE ME!"}
            </Button>
          </>
        ) : (
          /* Result Card */
          <div className="w-full max-w-sm animate-fade-in">
            <div className="activity-card overflow-hidden">
              <div className="relative aspect-[16/10]">
                <img
                  src={result.image}
                  alt={result.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="status-badge open mb-2">{result.category}</span>
                  <h3 className="text-xl font-bold text-white">{result.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-white/90 text-sm">
                    <span>⭐ {result.rating}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {result.distance}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setResult(null);
                    setRotation(0);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
                <Button variant="outline" className="flex-1">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <Check className="w-4 h-4 mr-2" />
                  Check-In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
