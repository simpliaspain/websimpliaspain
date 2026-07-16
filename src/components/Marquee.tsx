interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  className?: string;
}

export function Marquee({ items, reverse = false, className = "" }: MarqueeProps) {
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex gap-8 whitespace-nowrap ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {duplicatedItems.map((item, index) => (
          <span
            key={index}
            className="text-xl md:text-2xl font-bold text-muted-foreground/50 uppercase tracking-wider flex-shrink-0"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
