import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Badge,
  Text,
  Flex,
  Tooltip,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisVertical, 
  faEye, 
  faPencilAlt, 
  faTrash,
  faVenusMars,
  faBriefcase,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface ProfileListProps {
  profiles: any[];
  onView: (profile: any) => void;
  onEdit: (profile: any) => void;
  onDelete: (id: number) => Promise<void>;
}

const ProfileList: React.FC<ProfileListProps> = ({ 
  profiles, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [profileToDelete, setProfileToDelete] = React.useState<any>(null);
  
  // 表格样式
  const tableBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // 打开删除确认对话框
  const openDeleteConfirm = (profile: any) => {
    setProfileToDelete(profile);
    onOpen();
  };
  
  // 执行删除操作
  const confirmDelete = async () => {
    if (profileToDelete) {
      await onDelete(profileToDelete.id);
      onClose();
    }
  };
  
  // 格式化时间
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // 格式化兴趣爱好，显示前2个
  const formatInterests = (interests: string) => {
    if (!interests) return null;
    
    const interestsList = interests.split(',').map(i => i.trim());
    if (interestsList.length <= 2) {
      return interestsList.map((interest, index) => (
        <Badge key={index} colorScheme="blue" mr={1}>
          {interest}
        </Badge>
      ));
    }
    
    return (
      <>
        <Badge colorScheme="blue" mr={1}>
          {interestsList[0]}
        </Badge>
        <Badge colorScheme="blue" mr={1}>
          {interestsList[1]}
        </Badge>
        <Tooltip 
          label={interestsList.slice(2).join(', ')} 
          hasArrow 
          placement="top"
        >
          <Badge colorScheme="gray">+{interestsList.length - 2}</Badge>
        </Tooltip>
      </>
    );
  };
  
  return (
    <>
      <Box
        bg={tableBg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="sm"
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>{t('profiles.name')}</Th>
                <Th>{t('profiles.info')}</Th>
                <Th>{t('profiles.interests')}</Th>
                <Th>{t('common.createDate')}</Th>
                <Th width="60px"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {profiles.map((profile) => (
                <Tr 
                  key={profile.id}
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  onClick={() => onView(profile)}
                >
                  <Td fontWeight="medium">{profile.name}</Td>
                  <Td>
                    <Flex direction="column">
                      {profile.gender && (
                        <Flex align="center" mb={1}>
                          <FontAwesomeIcon icon={faVenusMars} size="sm" style={{ marginRight: '8px' }} />
                          <Text fontSize="sm">{t(`profiles.${profile.gender}`)}</Text>
                        </Flex>
                      )}
                      {profile.age && (
                        <Text fontSize="sm" ml="20px">{profile.age} {t('profiles.yearsOld')}</Text>
                      )}
                      {profile.occupation && (
                        <Flex align="center" mt={1}>
                          <FontAwesomeIcon icon={faBriefcase} size="sm" style={{ marginRight: '8px' }} />
                          <Text fontSize="sm">{profile.occupation}</Text>
                        </Flex>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    {profile.interests ? (
                      <Flex align="center">
                        <FontAwesomeIcon icon={faHeart} size="sm" style={{ marginRight: '8px' }} />
                        <Box>{formatInterests(profile.interests)}</Box>
                      </Flex>
                    ) : (
                      <Text color="gray.500" fontSize="sm">-</Text>
                    )}
                  </Td>
                  <Td>{formatDate(profile.created_at)}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                        variant="ghost"
                        size="sm"
                        aria-label={t('common.actions')}
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<FontAwesomeIcon icon={faEye} />} 
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(profile);
                          }}
                        >
                          {t('common.view')}
                        </MenuItem>
                        <MenuItem 
                          icon={<FontAwesomeIcon icon={faPencilAlt} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(profile);
                          }}
                        >
                          {t('common.edit')}
                        </MenuItem>
                        <MenuItem 
                          icon={<FontAwesomeIcon icon={faTrash} />}
                          color="red.500"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(profile);
                          }}
                        >
                          {t('common.delete')}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
      
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('profiles.deleteConfirmTitle')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('profiles.deleteConfirmMessage', { name: profileToDelete?.name })}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ProfileList; 