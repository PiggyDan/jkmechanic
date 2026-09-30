import { CURRENCIES, cleanAmount, convertedAmount, formatRate, fullAmount, normaliseMnt } from '../lib/money'
import { useExchangeRate } from '../lib/useExchangeRate'
import './money-field.css'

// Amount input with an MNT/USD switch. MNT is typed in millions; a preview shows the full amount
// and, with today's exchange rate, the same amount in the other currency.
export default function MoneyField({ id, label, amount, currency, onAmountChange, onCurrencyChange, required = false, optional = false }) {
  const display = currency === 'USD' && amount ? Number(amount.split('.')[0]).toLocaleString('en-US') + (amount.includes('.') ? `.${amount.split('.')[1]}` : '') : amount
  const full = fullAmount(amount, currency)
  const rate = useExchangeRate()
  const converted = convertedAmount(amount, currency, rate?.usdToMnt)

  return (
    <div className="money-field">
      <div className="money-head">
        <label htmlFor={id}>
          <span>{label}{optional && <em> optional</em>}</span>
        </label>
        <div className="money-currency" role="radiogroup" aria-label={`${label} currency`}>
          {CURRENCIES.map((code) => (
            <button key={code} type="button" role="radio" aria-checked={currency === code} className={currency === code ? 'active' : ''} onClick={() => onCurrencyChange(code)}>
              {code}
            </button>
          ))}
        </div>
      </div>
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
        <span className="money-unit" aria-hidden="true">{currency === 'USD' ? 'USD' : 'million ₮'}</span>
      </div>
      <small id={`${id}-preview`} className="money-preview">
        {full ? <>= {full}{converted && <strong className="money-converted"> {converted}</strong>}</> : currency === 'MNT' ? 'In millions: 150 = ₮150,000,000' : 'Type the amount in US dollars'}
      </small>
      {rate && (
        <small className="money-rate">
          {formatRate(rate.usdToMnt)} · today's rate by{' '}
          <a href={rate.sourceUrl} target="_blank" rel="noreferrer">{rate.source}</a>
        </small>
      )}
    </div>
  )
}
