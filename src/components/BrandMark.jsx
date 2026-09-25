import { logoUrl } from '../data/brand'

// Your logo if src/assets/brand/logo.* exists, otherwise the orange "JK" square.
export default function BrandMark({ className = '' }) {
  if (logoUrl) return <img className={`brand-mark brand-mark-img ${className}`} src={logoUrl} alt="" />
  return <div className={`brand-mark ${className}`}>JK</div>
}
