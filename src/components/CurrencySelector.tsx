import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { X, Plus } from 'lucide-react';

interface CurrencySelectorProps {
  availableCurrencies: string[];
  selectedCurrencies: string[];
  onCurrenciesChange: (currencies: string[]) => void;
}

export function CurrencySelector({
  availableCurrencies,
  selectedCurrencies,
  onCurrenciesChange
}: CurrencySelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const addCurrency = (currency: string) => {
    if (!selectedCurrencies.includes(currency)) {
      onCurrenciesChange([...selectedCurrencies, currency]);
    }
  };

  const removeCurrency = (currency: string) => {
    onCurrenciesChange(selectedCurrencies.filter(c => c !== currency));
  };

  const unselectedCurrencies = availableCurrencies.filter(
    c => !selectedCurrencies.includes(c)
  );

  return (
    <Card className="p-4 bg-gray-900/50 border-gray-800">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-200">Selected Currencies</h3>
          <span className="text-gray-400 text-sm">{selectedCurrencies.length} selected</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedCurrencies.map(currency => (
            <Badge
              key={currency}
              className="bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30 px-3 py-1"
            >
              {currency}
              <button
                onClick={() => removeCurrency(currency)}
                className="ml-2 hover:text-blue-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {unselectedCurrencies.length > 0 && (
          <div className="pt-2 border-t border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-gray-400 hover:text-gray-200 mb-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
            
            {showAll && (
              <div className="flex flex-wrap gap-2">
                {unselectedCurrencies.map(currency => (
                  <Badge
                    key={currency}
                    onClick={() => addCurrency(currency)}
                    className="bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200 cursor-pointer px-3 py-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {currency}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
