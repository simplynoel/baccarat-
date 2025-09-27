import "./Chips.css"

interface ChipsProps {
  value: number;
  color: string;
  onClick?: () => void;
}

const Chips = ({ value, color, onClick }: ChipsProps) => {
  return (
    <div 
      className={`chip chip-${color}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <span className="chip-value">${value}</span>
    </div>
  )
}

export default Chips
