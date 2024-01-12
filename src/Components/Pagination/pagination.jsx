import React, { useState } from "react";
import { chakra, Flex, Icon,Button } from "@chakra-ui/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Pagination = ({ page,numOfPages, setPage, fetchMovieApi, selectedGenre }) => {
  const totalPages = numOfPages; // Assuming there are 100 pages in total
  const visiblePages = 5;
  const [startPage,setStartPage]=useState(1);

  const PagButton = (props) => {
    const activeStyle = {
      bg: "brand.600",
      _dark: { bg: "brand.500" },
      color: "white",
    };

    const handlePageChange = (pageN) => {
      setPage(pageN);
      fetchMovieApi(selectedGenre, pageN);
    };

    return (
      <chakra.button
        mx={1}
        px={4}
        py={2}
        rounded="md"
        bg={props.active ? activeStyle.bg : "white"}
        _dark={{ bg: props.active ? activeStyle._dark.bg : "gray.800" }}
        color={props.active ? activeStyle.color : "gray.700"}
        opacity={props.disabled ? 0.6 : 1}
        _hover={!props.disabled && activeStyle}
        cursor={props.disabled ? "not-allowed" : "pointer"}
        display={props.p && !props.active ? { base: "none", sm: "block" } : "block"}
        onClick={() => handlePageChange(props.children)}
      >
        {props.children}
      </chakra.button>
    );
  };

  const renderPageButtons = () => {
    const buttons = [];

    for (let i = startPage; i < startPage+5; i++) {
      buttons.push(
        <PagButton key={i} p active={i === page}>
          {i}
        </PagButton>
      );
    }

    return buttons;
  };

  return (
    <Flex
      bg='transparent'
      p={20}
      w="full"
      alignItems="center"
      justifyContent="center"
    >
      <Flex>
        <Button onClick={() => startPage>=2&&setStartPage(startPage-1)}>
          <Icon
            as={IoIosArrowBack}
            color="gray.700"
            _dark={{ color: "gray.200" }}
            boxSize={4}
          />
        </Button>
        {renderPageButtons()}
        <Button onClick={() => startPage<=99&&setStartPage(startPage+1)}>
          <Icon
            as={IoIosArrowForward}
            color="gray.700"
            _dark={{ color: "gray.200" }}
            boxSize={4}
          />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Pagination;
