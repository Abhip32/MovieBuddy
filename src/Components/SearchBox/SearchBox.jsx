import React from "react";
import { chakra, Flex, Input, Button } from "@chakra-ui/react";

const SearchBox = ({ placeholder, searchTerm, setSearchTerm, fetchSearchApi }) => {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the form from submitting the traditional way

    // Call your fetchSearchApi function here
    fetchSearchApi(searchTerm,1);
  };

  return (
    <chakra.form
      w="full"
      maxW="600px"
      mx="auto"
      my={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      onSubmit={handleSubmit} // Bind the handleSubmit function to the form's onSubmit event
    >
      <Flex
        w="full"
        maxW="80vw"
        p={4}
        mb={4}
        rounded="md"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          px={4}
          py={2}
          bg="white"
          color="black"
          borderRadius="md"
          _focus={{ boxShadow: "outline" }}
          _placeholder={{ color: "gray.400" }}
        />
        <Button
          type="submit" // Add type="submit" to the button to enable Enter key submission
          colorScheme="purple"
          ml={3}
        >
          Search
        </Button>
      </Flex>
    </chakra.form>
  );
};

export default SearchBox;
