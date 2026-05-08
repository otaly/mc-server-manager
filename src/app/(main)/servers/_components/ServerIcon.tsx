import { Image, type ImageProps } from '@chakra-ui/react';
import NextImage from 'next/image';

type ServerIconProps = Omit<ImageProps, 'src' | 'alt'> & {
  isActive?: boolean;
};

export const ServerIcon = ({ isActive = false, ...props }: ServerIconProps) => (
  <Image asChild {...props}>
    <NextImage
      src={isActive ? '/icons/server_active.png' : '/icons/server_inactive.png'}
      alt={isActive ? 'active server' : 'inactive server'}
      width={32}
      height={32}
    />
  </Image>
);
