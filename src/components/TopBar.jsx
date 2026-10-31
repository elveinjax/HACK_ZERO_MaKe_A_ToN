import { useApp } from '../context/AppContext';
import CurrencySelector from './CurrencySelector';
import { Plus } from 'lucide-react';

export default function TopBar() {
  const { currentUser } = useApp();

  return (
    <div className="topbar">
      <div className="topbar-title">Brightloop</div>
      <div className="topbar-actions">
        <CurrencySelector />
      </div>
    </div>
  );
}
