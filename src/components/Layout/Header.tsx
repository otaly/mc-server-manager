import logo from '@/assets/logo.svg';
import simpleLogo from '@/assets/logo_simple.svg';
import { Center, Flex, Image } from '@chakra-ui/react';
import { AccountMenu } from './AccountMenu';

type LogoProps = {
  isSimple?: boolean;
};

const Logo = ({ isSimple = false }: LogoProps) => (
  <Image src={isSimple ? simpleLogo : logo} alt="MC Server Manager" />
);

export const Header = () => (
  <Flex
    as="header"
    bg="bg.500"
    align="center"
    px={8}
    py={2}
    justify="space-between"
    position="sticky"
    top={0}
    border="1px"
    borderColor="border.500"
    zIndex={100}
  >
    <Center h={8}>
      <Logo />
    </Center>
    <AccountMenu />
  </Flex>
);
