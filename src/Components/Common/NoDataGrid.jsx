import { SimpleGrid,Box, Skeleton, SkeletonText } from "@chakra-ui/react";

const SkeletonGrid = () => {
  return (
    <SimpleGrid columns={[2, 2, 3, 5]} spacing={4} mt={8} px={['5vw', null, '5vw', null]} >
         {Array.from({ length: 24 }, (_, i) => (
           <Box>
           <Skeleton height={{base:'200px',md:'400px'}}/>
             <SkeletonText mt='4' noOfLines={1}  skeletonHeight='2' />
             </Box>
        ))}
      </SimpleGrid>
  );
};

export default SkeletonGrid;
