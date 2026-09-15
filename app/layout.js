import './globals.css';
import '../components/theme.css';

export const metadata = {
  title: 'JK Mongolia | Automotive Services in Gachuurt',
  description: 'Independent automotive support in Mongolia: repair, inspection, sourcing, consignment, parts, paperwork, export support and Musso rental.',
};

export default function RootLayout({ children }) {
  return <html lang="en" suppressHydrationWarning><head><script src="/theme.js" /></head><body>{children}</body></html>;
}
