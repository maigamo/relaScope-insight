import React from 'react';
import { 
  Box, 
  Text, 
  Avatar, 
  Center,
  Flex,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { Profile } from './types';

// 档案卡片动画
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface ProfileCardProps {
  profile: Profile;
  isSelected: boolean;
  onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = React.memo(({ profile, isSelected, onClick }) => {
  const borderColor = useColorModeValue('green.400', 'green.200');
  const selectedBg = useColorModeValue('green.50', 'green.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box
      as={motion.div}
      variants={cardVariants}
      p={3}
      mb={2}
      borderRadius="md"
      borderLeft={isSelected ? `4px solid ${borderColor}` : '4px solid transparent'}
      bg={isSelected ? selectedBg : 'transparent'}
      cursor="pointer"
      onClick={onClick}
      _hover={{ bg: !isSelected ? hoverBg : selectedBg }}
      transition="all 0.2s"
    >
      <Flex align="center">
        {profile.avatar ? (
          <Avatar size="sm" name={profile.name} src={profile.avatar} mr={3} />
        ) : (
          <Center w="32px" h="32px" mr={3} borderRadius="full" bg="gray.200">
            <FontAwesomeIcon icon={faUser} />
          </Center>
        )}
        <Box>
          <Text fontWeight={isSelected ? "bold" : "normal"} fontSize="sm" noOfLines={1}>
            {profile.name}
          </Text>
          {profile.occupation && (
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {profile.occupation}
            </Text>
          )}
          {profile.tags && (
            <Flex mt={1} flexWrap="wrap" gap={1}>
              {profile.tags.split(',').slice(0, 2).map((tag: string, idx: number) => (
                <Badge key={idx} size="sm" colorScheme="green" fontSize="2xs">
                  {tag.trim()}
                </Badge>
              ))}
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
});

export default ProfileCard; 