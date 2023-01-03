import { StartIcon } from '@/components/Elements';
import { StopIcon } from '@/components/Elements/StopIcon';
import { IconButton, IconButtonProps } from '@chakra-ui/react';

type ControlButtonType = 'start' | 'stop';

type ControlButtonProps = {
  type: ControlButtonType;
  disabled?: boolean;
  onClick?: () => void;
};

export const ControlButton = ({
  type,
  disabled = false,
  onClick,
}: ControlButtonProps) => {
  let icon: IconButtonProps['icon'];

  switch (type) {
    case 'start':
      icon = <StartIcon w={9} h={9} />;
      break;
    case 'stop':
      icon = <StopIcon w={9} h={9} />;
      break;
    default:
      break;
  }

  return (
    <IconButton
      icon={icon}
      disabled={disabled}
      aria-label="server control"
      isRound
      variant="ghost"
      transitionDuration="300ms"
      color={disabled ? 'whiteAlpha.400' : 'blue.500'}
      _hover={{ bg: 'transparent', color: disabled ? undefined : 'blue.300' }}
      onClick={onClick}
    />
  );
};
