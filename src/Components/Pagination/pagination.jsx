import React, { useState } from "react";
import { chakra, Flex, Icon, Button } from "@chakra-ui/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Pagination = ({ page, numOfPages, setPage, fetchMovieApi, fetchSearchApi, searchTerm, selectedGenre }) => {
  const [startPage, setStartPage] = useState(1);

  const PagButton = ({ children, active, disabled }) => {
    const handleClick = () => {
      setPage(children);
      if (searchTerm !== '') {
        fetchSearchApi(searchTerm, children);
      } else {
        fetchMovieApi(selectedGenre, children);
      }
    };

    return (
      <chakra.button
        mx={1}
        px={4}
        py={2}
        rounded="md"
        bg={active ? "brand.600" : "white"}
        _dark={{ bg: active ? "brand.500" : "gray.800" }}
        color={active ? "white" : "gray.700"}
        opacity={disabled ? 0.6 : 1}
        _hover={!disabled && { bg: active ? "brand.600" : "gray.200" }}
        cursor={disabled ? "not-allowed" : "pointer"}
        display={disabled && { base: "none", sm: "block" }}
        onClick={handleClick}
        disabled={disabled}
      >
        {children}
      </chakra.button>
    );
  };

  const renderPageButtons = () => {
    const buttons = [];
    const maxPagesToShow = 9;
    const endPage = Math.min(startPage + maxPagesToShow - 1, numOfPages);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PagButton key={i} active={i === page}>
          {i}
        </PagButton>
      );
    }

    return buttons;
  };

  return (
    <Flex bg="transparent" p={20} w="full" alignItems="center" justifyContent="center">
      <Flex>
        <Button onClick={() => setStartPage(Math.max(1, startPage - 5))} disabled={startPage === 1}>
          <Icon as={IoIosArrowBack} color="gray.700" _dark={{ color: "gray.200" }} boxSize={4} />
        </Button>
        {renderPageButtons()}
        <Button onClick={() => setStartPage(Math.min(startPage + 5, numOfPages - 8))} disabled={startPage >= numOfPages - 8}>
          <Icon as={IoIosArrowForward} color="gray.700" _dark={{ color: "gray.200" }} boxSize={4} />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Pagination;
