import { CURRENCIES, cleanAmount, fullAmount, normaliseMnt } from '../lib/money'
import './money-field.css'

// Amount input with an MNT/USD switch. MNT is typed in millions; a preview shows the full amount.
export default function MoneyField({ id, label, amount, currency, onAmountChange, onCurrencyChange, required = false, optional = false }) {
  const display = currency === 'USD' && amount ? Number(amount.split('.')[0]).toLocaleString('en-US') + (amount.includes('.') ? `.${amount.split('.')[1]}` : '') : amount
  const full = fullAmount(amount, currency)

  return (
    <div className="money-field">
      <label htmlFor={id}>
        <span>{label}{optional && <em> optional</em>}</span>
      </label>
      <div className="money-row">
        <div className="money-input">
          <input
            id={id}
            value={display}
            onChange={(event) => onAmountChange(cleanAmount(event.target.value))}
            onBlur={() => currency === 'MNT' && amount && onAmountChange(normaliseMnt(amount))}
            inputMode="decimal"
            placeholder={currency === 'USD' ? 'e.g. 45,000' : 'e.g. 150'}
            required={required}
            aria-describedby={`${id}-preview`}
          />
          <span className="money-unit" aria-hidden="true">{currency === 'USD' ? '$' : 'million ₮'}</span>
        </div>
        <div className="money-currency" role="radiogroup" aria-label={`${label} currency`}>
          {CURRENCIES.map((code) => (
            <button key={code} type="button" role="radio" aria-checked={currency === code} className={currency === code ? 'active' : ''} onClick={() => onCurrencyChange(code)}>
              {code}
            </button>
          ))}
        </div>
      </div>
      <small id={`${id}-preview`} className="money-preview">
        {full ? `= ${full}` : currency === 'MNT' ? 'Type the amount in millions, e.g. 150 = ₮150,000,000' : 'Type the amount in US dollars'}
      </small>
    </div>
  )
}
