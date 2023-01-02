import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Center,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';

export const AccountMenu = () => (
  <Menu>
    <MenuButton>
      <Center gap={1}>
        <Avatar w={8} h={8} />
        <ChevronDownIcon w="1.125em" h="1.125em" />
      </Center>
    </MenuButton>
    <MenuList bg="bg.700" borderColor="border.500">
      <MenuItem bg="inherit" _hover={{ background: 'blue.500' }}>
        Log out
      </MenuItem>
    </MenuList>
  </Menu>
);
