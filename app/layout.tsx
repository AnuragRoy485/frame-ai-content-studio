import './style.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title:'Frame / AI Content Studio', description:'An AI-native creative operations studio for regional streaming.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
