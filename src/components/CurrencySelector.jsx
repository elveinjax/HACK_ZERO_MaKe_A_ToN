import { useApp } from '../context/AppContext';
import { ChevronDown } from 'lucide-react';

export default function CurrencySelector() {
  const { currentCurrency, setCurrentCurrency, rates } = useApp();
  const currencies = Object.keys(rates).sort();

  const handleChange = (e) => {
    setCurrentCurrency(e.target.value);
  };

  return (
    <div className="currency-selector" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Currency:</span>
      <select
        value={currentCurrency}
        onChange={handleChange}
        className="form-select"
        style={{ minWidth: '80px' }}
      >
        {currencies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
    </div>
  );
}
