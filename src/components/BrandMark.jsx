import { iconUrl, logoUrl } from '../data/brand'

// variant "icon": square mark (chat, admin). variant "full": the full logo (header, footer).
// Falls back to the orange "JK" square when no logo files have been added.
export default function BrandMark({ variant = 'icon', className = '' }) {
  const src = variant === 'full' ? logoUrl ?? iconUrl : iconUrl ?? logoUrl
  if (!src) return <div className={`brand-mark ${className}`}>JK</div>
  const wide = variant === 'full' && src === logoUrl
  return <img className={`brand-mark brand-mark-img${wide ? ' brand-logo-full' : ''} ${className}`} src={src} alt="" />
}
