import React from 'react';

interface SpecialCharacterKeyboardProps {
  onCharClick: (char: string) => void;
}

const specialChars = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'];

export const SpecialCharacterKeyboard: React.FC<SpecialCharacterKeyboardProps> = ({ onCharClick }) => {
  return (
    <div className="special-chars">
      <span>Insert: </span>
      {specialChars.map(char => (
        <button key={char} onClick={() => onCharClick(char)} type="button" className="special-char-button">
          {char}
        </button>
      ))}
    </div>
  );
};
