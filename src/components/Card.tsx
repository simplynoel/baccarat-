import { useState } from "react"
import "./Card.css"

interface CardProps {
  suit: string;
  value: string;
  className?: string;
}

const Card = ({ suit, value, className = '' }: CardProps) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const getSuitColor = (suit: string): string => {
    return (suit === '♥' || suit === '♦') ? 'red' : 'black';
  };

  return (
    <div className={`card-container ${className}`}>
      <div 
        className="card" 
        onClick={() => setIsFlipped(!isFlipped)} 
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="card-front">
          <div className="card-header">
            <span className={`card-value ${getSuitColor(suit)}`}>{value}</span>
            <span className={`card-suit ${getSuitColor(suit)}`}>{suit}</span>
          </div>
          <div className="card-center">
            <span className={`card-suit-large ${getSuitColor(suit)}`}>{suit}</span>
          </div>
          <div className="card-footer">
            <span className={`card-value ${getSuitColor(suit)}`}>{value}</span>
            <span className={`card-suit ${getSuitColor(suit)}`}>{suit}</span>
          </div>
        </div>
        <div className="card-back">
          <div className="card-back-pattern"></div>
        </div>
      </div>
    </div>
  )
}

export default Card