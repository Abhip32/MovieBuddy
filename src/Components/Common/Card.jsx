import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { AiFillPlayCircle } from "react-icons/ai";

const SingleData = ({
  poster_path,
  title,
  name,
  id,
  vote_average,
  release_date,
  first_air_date,
  mediaType,
  media_type,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${mediaType || media_type}/${id}`);
  };

  const [isHovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getBadgeColor = (voteAverage) => {
    if (voteAverage > 7) {
      return "green";
    } else if (voteAverage >= 5 && voteAverage <= 7) {
      return "yellow";
    } else {
      return "red";
    }
  };

  return (
    <Box
      color="white"
      className="SingleDataMedia"
      onClick={handleClick}
      cursor="pointer"
      position="relative"
      margin={"0px 5px"}
      _hover={{
        transform: "scale(1.02)",
        boxShadow: '1px 1px 20px white',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Movie Poster */}
      <Box style={{ position: "relative" }}>
        <Image
          src={poster_path ? `${img_300}/${poster_path}` : unavailable}
          alt="poster"
          style={{ position: "relative", width: "100%", height: "auto" }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)} // Handle error (e.g., image not found)
        />
        {!imageLoaded && (
          <Box>
          <Skeleton height={{base:'200px',md:'400px'}}/>
            <SkeletonText mt='4' noOfLines={1}  skeletonHeight='2' />
            </Box>
        )}
        {imageLoaded && (
          <Text
            fontSize={"small"}
            maxH={"40px"}
            overflow={'hidden'}
            whiteSpace={'nowrap'}
            bg={'black'}
            textOverflow={'ellipsis'}
            padding={"10px"}
            textAlign={"center"}
            width={"100%"}
          >
            {name || title}
          </Text>
        )}

        {!isHovered && imageLoaded && (
          <Badge
            fontSize={"15px"}
            style={{
              position: "absolute",
              backgroundColor: "transparent",
              top: 0,
              left: 0,
              color: getBadgeColor(Math.round(vote_average * 10) / 10),
            }}
          >
            {Math.round(vote_average * 10) / 10}
          </Badge>
        )}
      </Box>

      {/* Play button */}
      {isHovered && (
        <IconButton
          backgroundColor={"transparent"}
          _hover={{ backgroundColor: "transparent" }}
          icon={<AiFillPlayCircle color={"white"} size={"10vh"} />}
          aria-label="play-button"
          position="absolute"
          top="50%"
          left="45%"
          transform="translate(-50%, -50%)" // Center the button
        />
      )}
    </Box>
  );
};

export default SingleData;
