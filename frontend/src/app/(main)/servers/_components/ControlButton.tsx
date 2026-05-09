'use client';

import { Icon, IconButton } from '@chakra-ui/react';

const StartIcon = () => (
  <Icon asChild w={9} h={9}>
    <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.15 32.5L32.5 24l-13.35-8.5zM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41zm0-17z"
      />
    </svg>
  </Icon>
);

const StopIcon = () => (
  <Icon asChild w={9} h={9}>
    <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.5 31.5h15v-15h-15zM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 23.95q0-4.1 1.575-7.75 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24.05 4q4.1 0 7.75 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44zm.05-3q7.05 0 12-4.975T41 23.95q0-7.05-4.95-12T24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24.05 41zM24 24z"
      />
    </svg>
  </Icon>
);

type ControlButtonProps = {
  type: 'start' | 'stop';
  disabled?: boolean;
  onClick?: () => void;
};

export const ControlButton = ({
  type,
  disabled = false,
  onClick,
}: ControlButtonProps) => (
  <IconButton
    aria-label="server control"
    rounded="full"
    variant="ghost"
    disabled={disabled}
    transitionDuration="300ms"
    color={disabled ? 'white/24' : 'blue.500'}
    _hover={{ bg: 'transparent', color: disabled ? undefined : 'blue.300' }}
    onClick={onClick}
  >
    {type === 'start' ? <StartIcon /> : <StopIcon />}
  </IconButton>
);
