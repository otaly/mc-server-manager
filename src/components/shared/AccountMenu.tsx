'use client';

import { Avatar, Center, Menu } from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';

export const AccountMenu = () => (
  <Menu.Root>
    <Menu.Trigger asChild>
      <Center
        as="button"
        gap={1}
        bg="transparent"
        border="none"
        cursor="pointer"
        color="white"
      >
        <Avatar.Root size="sm">
          <Avatar.Fallback />
        </Avatar.Root>
        <ChevronDown size={18} />
      </Center>
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content bg="bg.700" shadow="lg" border="none">
        <Menu.Item
          value="logout"
          color="white"
          _hover={{ bg: 'blue.500' }}
          cursor="pointer"
        >
          Log out
        </Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
);
