import serverActiveIcon from '@/assets/icons/server_active.png';
import serverInactiveIcon from '@/assets/icons/server_inactive.png';
import { chakra, Image, ImageProps } from '@chakra-ui/react';

type ServerIconProps = ImageProps & {
  isActive?: boolean;
};

const ServerIconRaw = ({ isActive = false, ...props }: ServerIconProps) => (
  <Image src={isActive ? serverActiveIcon : serverInactiveIcon} {...props} />
);

export const ServerIcon = chakra(ServerIconRaw);
