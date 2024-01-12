import React, { useEffect, useState } from "react";

import {
  chakra,
  Box,
  Flex,
  useColorModeValue,
  VisuallyHidden,
  HStack,
  Button,
  useDisclosure,
  VStack,
  Image,
  IconButton,
  CloseButton,
  Avatar,
} from "@chakra-ui/react";
import { AiOutlineMenu } from "react-icons/ai";
import Logo from '../../Assets/logo.png'
import avtarLogo from '../../Assets/avatar.jpeg'
import { AiFillHome } from "react-icons/ai";
import { BiSolidCameraMovie } from "react-icons/bi";
import { PiTelevisionSimpleBold } from "react-icons/pi";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPath = (path) => location.pathname === path
  const bg = useColorModeValue("white", "gray.800");
  const mobileNav = useDisclosure();
  const [scrolling, setScrolling] = useState(false);

  const buttonStyles = {
    variant: "ghost",
    borderRadius: '30px',
    color: '#CF9FFF',
    _hover: { color: 'white', background: 'linear-gradient(90deg, #9400d3,#CF9FFF)' },
  };

  const selectedButtonStyles = {
    ...buttonStyles,
    color: 'white',
    background: 'linear-gradient(90deg, #9400d3, #CF9FFF)',
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Box
      bg={scrolling ? 'black' : 'transparent'}
      w="full"
      px={{ base: 2, sm: 4 }}
      py={4}
      position="fixed"
      zIndex={1}
      transition="background-color 0.3s ease-in-out"
    >
      <Flex alignItems="center" justifyContent="space-between" mx="auto">

        <HStack
          spacing={1}
          width={'35vw'}
          mr={1}
          color="brand.500"
          display={{ base: "none", md: "inline-flex" }}
          alignContent={'flex-start'}
          justifyContent="flex-start"  // Align the content to the end
        >
          <Button {...(isCurrentPath("/") ? selectedButtonStyles : buttonStyles)} onClick={() => navigate("/")} >
            <AiFillHome /> &nbsp;Home
          </Button>
          <Button {...(isCurrentPath("/movies") ? selectedButtonStyles : buttonStyles)} onClick={() => navigate("/movies")} >
            <BiSolidCameraMovie />&nbsp; Movies
          </Button>
          <Button {...(isCurrentPath("/series") ? selectedButtonStyles : buttonStyles)} onClick={() => navigate("/series")}>
            <PiTelevisionSimpleBold />&nbsp;Series
          </Button>
        </HStack>

        <Flex>
          <chakra.a
            href="/"
            title="Choc Home Page"
            display="flex"
            alignItems="center"
          >
            <Image src={Logo} h={'8'} />
          </chakra.a>
        </Flex>

        <Box display={{ base: "inline-flex", md: "none" }}>
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Open menu"
            fontSize="20px"
            color="white"
            _dark={{ color: "inherit" }}
            variant="ghost"
            icon={<AiOutlineMenu />}
            onClick={mobileNav.onOpen}
          />

          <VStack
            pos="absolute"
            top={0}
            left={0}
            right={0}
            display={mobileNav.isOpen ? "flex" : "none"}
            flexDirection="column"
            p={2}
            pb={4}
            m={2}
            bg={'black'}
            spacing={3}
            rounded="sm"
            shadow="sm"
          >
            <CloseButton
              color={'white'}
              aria-label="Close menu"
              onClick={mobileNav.onClose}
            />

            <Button {...(isCurrentPath("/") ? selectedButtonStyles : buttonStyles)} onClick={() => navigate("/")} >
              <AiFillHome /> &nbsp;Home
            </Button>
            <Button {...(isCurrentPath("/movies") ? selectedButtonStyles : buttonStyles)} onClick={() => navigate("/movies")} >
              <BiSolidCameraMovie />&nbsp; Movies
            </Button>
            <Button {...(isCurrentPath("/series") ? selectedButtonStyles : buttonStyles)} onClick={() => navigate("/series")}>
              <PiTelevisionSimpleBold />&nbsp;Series
            </Button>
          </VStack>
        </Box>
        <Box
          width={'35vw'}
          display={{ base: "none", md: "inline-flex" }}
          alignContent={'flex-end'}
          justifyContent="flex-end"  // Align the content to the end
        >
          <Avatar src={avtarLogo} />
        </Box>


      </Flex>
    </Box>
  );
};
