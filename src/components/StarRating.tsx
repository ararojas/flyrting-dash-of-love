import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  className?: string;
}

export function StarRating({ rating, className = "" }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < fullStars
              ? "fill-gold text-gold"
              : i === fullStars && hasHalf
                ? "fill-gold/50 text-gold"
                : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-gold">{rating.toFixed(1)}</span>
    </div>
  );
}
