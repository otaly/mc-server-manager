'use client';

import { Button, Stack } from '@chakra-ui/react';

export const LoginButtons = () => (
  <Stack gap={4} w="full" maxW="sm">
    <Button
      variant="outline"
      colorPalette="gray"
      onClick={() => console.log('Google login')}
    >
      Google でログイン
    </Button>
    <Button
      variant="outline"
      colorPalette="gray"
      onClick={() => console.log('GitHub login')}
    >
      GitHub でログイン
    </Button>
  </Stack>
);
