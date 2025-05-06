import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Text,
  Divider,
  Badge,
  HStack,
  VStack,
  Tooltip,
  IconButton,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faVenusMars,
  faCakeCandles,
  faBriefcase,
  faHeart,
  faClock,
  faEdit,
  faTrash,
  faNoteSticky
} from '@fortawesome/free-solid-svg-icons';

interface ProfileDetailProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onEdit: () => void;
  onDelete: (id: number) => Promise<void>;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({
  isOpen,
  onClose,
  profile,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();
  const { 
    isOpen: isAlertOpen, 
    onOpen: onAlertOpen, 
    onClose: onAlertClose 
  } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue('blue.50', 'blue.900');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  
  // 格式化时间
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // 格式化兴趣爱好
  const formatInterests = (interests: string) => {
    if (!interests) return [];
    return interests.split(',').map(interest => interest.trim());
  };
  
  // 确认删除
  const handleDelete = async () => {
    await onDelete(profile.id);
    onAlertClose();
    onClose();
  };

  if (!profile) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center">
              <Box
                bg={iconBg}
                p={2}
                borderRadius="full"
                mr={3}
              >
                <FontAwesomeIcon icon={faUser} size="lg" />
              </Box>
              <Text>{profile.name}</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* 基本信息区域 */}
              <Box
                bg={sectionBg}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontWeight="bold" mb={3}>
                  {t('profiles.basicInfo')}
                </Text>
                
                <VStack spacing={3} align="stretch">
                  {profile.gender && (
                    <Flex align="center">
                      <Box width="24px" mr={2}>
                        <FontAwesomeIcon icon={faVenusMars} />
                      </Box>
                      <Text>{t(`profiles.${profile.gender}`)}</Text>
                    </Flex>
                  )}
                  
                  {profile.age && (
                    <Flex align="center">
                      <Box width="24px" mr={2}>
                        <FontAwesomeIcon icon={faCakeCandles} />
                      </Box>
                      <Text>{profile.age} {t('profiles.yearsOld')}</Text>
                    </Flex>
                  )}
                  
                  {profile.occupation && (
                    <Flex align="center">
                      <Box width="24px" mr={2}>
                        <FontAwesomeIcon icon={faBriefcase} />
                      </Box>
                      <Text>{profile.occupation}</Text>
                    </Flex>
                  )}
                </VStack>
              </Box>
              
              {/* 兴趣爱好区域 */}
              {profile.interests && (
                <Box
                  bg={sectionBg}
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex align="center" mb={3}>
                    <Box width="24px" mr={2}>
                      <FontAwesomeIcon icon={faHeart} />
                    </Box>
                    <Text fontWeight="bold">{t('profiles.interests')}</Text>
                  </Flex>
                  
                  <HStack spacing={2} flexWrap="wrap">
                    {formatInterests(profile.interests).map((interest, index) => (
                      <Badge 
                        key={index} 
                        colorScheme="blue" 
                        borderRadius="full"
                        py={1}
                        px={2}
                        mb={2}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}
              
              {/* 备注区域 */}
              {profile.notes && (
                <Box
                  bg={sectionBg}
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex align="center" mb={3}>
                    <Box width="24px" mr={2}>
                      <FontAwesomeIcon icon={faNoteSticky} />
                    </Box>
                    <Text fontWeight="bold">{t('profiles.notes')}</Text>
                  </Flex>
                  
                  <Text whiteSpace="pre-wrap">{profile.notes}</Text>
                </Box>
              )}
              
              {/* 时间信息 */}
              <Box>
                <Flex justify="space-between" mt={2} color="gray.500" fontSize="sm">
                  <Flex align="center">
                    <FontAwesomeIcon icon={faClock} size="sm" style={{ marginRight: '5px' }} />
                    <Text>{t('common.created')}: {formatDate(profile.created_at)}</Text>
                  </Flex>
                  
                  {profile.updated_at && profile.updated_at !== profile.created_at && (
                    <Flex align="center">
                      <FontAwesomeIcon icon={faClock} size="sm" style={{ marginRight: '5px' }} />
                      <Text>{t('common.updated')}: {formatDate(profile.updated_at)}</Text>
                    </Flex>
                  )}
                </Flex>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={2}>
              <Tooltip label={t('common.edit')}>
                <IconButton
                  aria-label={t('common.edit')}
                  icon={<FontAwesomeIcon icon={faEdit} />}
                  colorScheme="blue"
                  onClick={onEdit}
                />
              </Tooltip>
              
              <Tooltip label={t('common.delete')}>
                <IconButton
                  aria-label={t('common.delete')}
                  icon={<FontAwesomeIcon icon={faTrash} />}
                  colorScheme="red"
                  onClick={onAlertOpen}
                />
              </Tooltip>
              
              <Button variant="ghost" ml={2} onClick={onClose}>
                {t('common.close')}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('profiles.deleteConfirmTitle')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('profiles.deleteConfirmMessage', { name: profile.name })}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ProfileDetail; 