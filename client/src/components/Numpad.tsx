
import { Button } from '@/components/ui/button';

interface NumpadProps {
  onNumberClick: (num: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  value: string;
  disabled?: boolean;
}

export function Numpad({ onNumberClick, onClear, onSubmit, value, disabled = false }: NumpadProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="numpad-container">
      <div className="answer-display">
        {value || '数字を入力してください'}
      </div>
      
      <div className="numpad">
        {numbers.slice(0, 9).map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            className="numpad-button"
          >
            {num}
          </button>
        ))}
        
        <button
          onClick={onClear}
          disabled={disabled}
          className="numpad-button"
          style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}
        >
          消去
        </button>
        
        <button
          onClick={() => onNumberClick('0')}
          disabled={disabled}
          className="numpad-button"
        >
          0
        </button>
        
        <button
          onClick={onSubmit}
          disabled={disabled || !value}
          className="numpad-button"
          style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }}
        >
          決定
        </button>
      </div>
    </div>
  );
}
