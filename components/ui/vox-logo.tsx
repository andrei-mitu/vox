'use client';

import {
    useEffect,
    useState
}                   from 'react';
import { useTheme } from '@/components/theme/theme-provider';
import Image        from 'next/image';

interface VoxLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

// "Dark Main" has light text (#edf7f5)  → use on dark backgrounds
// "Dark 2"   has dark text  (#103b3d)  → use on light backgrounds
const LOGO_DARK_BG = '/images/logo/VOX Dark Main gradient.svg';
const LOGO_LIGHT_BG = '/images/logo/VOX Dark 2 gradient.svg';

export function VoxLogo({ className, width = 100, height = 50 }: VoxLogoProps) {
  const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if ( !mounted ) {
    return <div style={{ width, height }} aria-hidden />;
  }

  const src = resolvedTheme === 'light' ? LOGO_LIGHT_BG : LOGO_DARK_BG;

  return (
    <Image
      src={src}
      alt="Vox"
      width={width}
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}
