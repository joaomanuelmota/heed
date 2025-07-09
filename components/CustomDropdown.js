import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactDOM from 'react-dom';

export default function CustomDropdown({ value, options, onChange, disabled, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const selected = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [open]);

  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        <span className="flex items-center">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 ${
                value === opt.value ? 'font-semibold text-blue-600' : 'text-gray-900'
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 