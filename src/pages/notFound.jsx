

import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
    const navigate = useNavigate();
    const user=JSON.parse(localStorage.getItem('userData'))

  return (
<Box textAlign="center" py={'20vh'} minH={'100vh'} bgGradient='linear(to-r, #451488, #16072b 70%)' color={'white'}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bg='white'
        backgroundClip="text">
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Page Not Found
      </Text>
      <Text color={'gray.500'} mb={6}>
        The page you&apos;re looking for does not seem to exist
      </Text>

      <Button
        colorScheme="purple"
        bgGradient="linear(to-r, primary.400, primary.500, primary.600)"
        color="white"
        variant="solid"
        onClick={()=> user ?navigate("/Home"):navigate("/")}
        >
        Go to Home
      </Button>
    </Box>
  )
}