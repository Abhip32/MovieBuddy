import React, { useState, useEffect, useRef } from "react";
import { BiMicrophone, BiSearch } from "react-icons/bi";
import { chakra, Flex, Input, Button } from "@chakra-ui/react";

const SearchBox = ({ placeholder, searchTerm, setSearchTerm, fetchSearchApi }) => {
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.log("SpeechRecognition is not supported in this browser");
    } else {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.lang = "en-US";

      recognition.current.onstart = () => {
        setIsListening(true);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        fetchSearchApi(transcript, 1);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startVoiceRecognition = () => {
    if (recognition.current) {
      recognition.current.start();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSearchApi(searchTerm, 1);
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
      onSubmit={handleSubmit}
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
          type="submit"
          colorScheme="purple"
          ml={3}
        >
          <BiSearch/>
        </Button>
        <Button
          onClick={startVoiceRecognition}
          colorScheme="teal"
          ml={3}
          disabled={!("webkitSpeechRecognition" in window)}
        >
          {isListening ? "..." : <BiMicrophone/>}
        </Button>
      </Flex>
    </chakra.form>
  );
};

export default SearchBox;
