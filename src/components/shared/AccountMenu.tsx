'use client';

import { Avatar, Center, Icon, Menu } from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';

export const AccountMenu = () => (
  <Menu.Root>
    <Menu.Trigger asChild>
      <Center gap={1} cursor="pointer">
        <Avatar.Root size="xs">
          <Avatar.Fallback />
        </Avatar.Root>
        <Icon size="sm">
          <ChevronDown />
        </Icon>
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
