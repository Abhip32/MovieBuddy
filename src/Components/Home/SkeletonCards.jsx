import React, { useState, useEffect } from 'react';
import { Box,Text,Skeleton } from '@chakra-ui/react';
const SkeletonCards = () => {
  return (
        Array.from({ length: 10 }).map((_, index) => (
        <Skeleton height={'500px'}   margin={"0px 5px"}/>)
  ))
}

export default SkeletonCards