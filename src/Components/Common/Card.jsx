import React, { useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { img_300, unavailable } from "../../api/config/DefaultImages";
import {
  Box,
  Image,
  Text,
  IconButton,
  Badge,
  Skeleton,
  SkeletonText,
  Center,
} from "@chakra-ui/react";
import { AiFillPlayCircle } from "react-icons/ai";

const SingleData = ({
  poster_path,
  title,
  name,
  id,
  vote_average,
  mediaType,
  media_type,
}) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/${mediaType || media_type}/${id}`);
  }, [navigate, mediaType, media_type, id]);

  const getBadgeColor = (voteAverage) => {
    if (voteAverage > 7) return "green";
    if (voteAverage >= 5) return "#F6BE00";
    return "red";
  };

  return (
    <Box
      color="white"
      className="SingleDataMedia"
      onClick={handleClick}
      cursor="pointer"
      position="relative"
      padding="0px 5px"
    >
<Box position="relative" backgroundColor={'black'}>
  <Image
    src={poster_path ? `${img_300}/${poster_path}` : unavailable}
    alt="poster"
    width="100%"
    height="320px"
  />
  {!id && (
    <Box>
      <Skeleton height={{ base: "200px", md: "400px" }} />
      <SkeletonText mt="4" noOfLines={1} skeletonHeight="2" />
    </Box>
  )}
  {id && (
    <Text
      fontSize="small"
      maxH="40px"
      overflow="hidden"
      whiteSpace="nowrap"
      bg="black"
      textOverflow="ellipsis"
      padding="10px"
      textAlign="center"
      width="100%"
    >
      {name || title}
    </Text>
  )}
  {id && (
    <Badge
    display="flex"
    justifyContent="center"
    alignItems="center"
    fontSize="13px"
    position="absolute"
    width="30px"
    height="35px"
    backgroundColor="white"
    top={0}
    left={0}
    color={getBadgeColor(Math.round(vote_average * 10) / 10)}
    clipPath="polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)"
    >
      <Text>{Math.round(vote_average * 10) / 10}</Text>
    </Badge>
  )}
 <Center
  position="absolute"
  className="PlayButton"
  top="50%"
  left="50%"
  opacity={0}
  _hover={{ opacity: 1 }}
  transition="0.5s ease-in-out"
  width="100%"
  height="100%"
  backgroundColor="rgba(0, 0, 0, 0.5)"
  transform="translate(-50%, -50%)"
>
<IconButton
  _hover={{ backgroundColor: 'transparent' }}
  backgroundColor="transparent"
  icon={<AiFillPlayCircle color="white" size="10vh" />}
  aria-label="play-button"
  onClick={handleClick}
/>

  </Center>
</Box>

    </Box>
  );
};

export default memo(SingleData);
