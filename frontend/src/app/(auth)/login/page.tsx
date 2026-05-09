import { Center, Text } from '@chakra-ui/react';
import { LoginButtons } from './_components/LoginButtons';

export default function LoginPage() {
  return (
    <Center minH="100dvh" bg="bg.700" flexDirection="column" gap={8}>
      <Text fontSize="xl" fontWeight="bold">
        MC Server Manager
      </Text>
      <LoginButtons />
    </Center>
  );
}
