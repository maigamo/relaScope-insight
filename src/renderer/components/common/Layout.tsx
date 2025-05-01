import React from 'react';
import { 
  Box, 
  Flex, 
  useColorModeValue, 
  Text,
  Center,
  VStack,
  Button
} from '@chakra-ui/react';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCommentDots, faUser, faHistory } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children?: React.ReactNode;
  pageTitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children,
  pageTitle = 'Dashboard' 
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const emptyStateTextColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const { t } = useTranslation();

  // 检查是否有内容
  const hasContent = React.Children.count(children) > 0;

  // 创建项处理函数
  const handleCreateItem = (type: string) => {
    console.log(`创建新的${type}`);
  };

  return (
    <Flex h="100vh" flexDirection="column">
      {/* 顶部导航 */}
      <TopNavigation activePageTitle={pageTitle} />
      
      <Flex flex="1" overflow="hidden">
        {/* 侧边栏导航 */}
        <Sidebar />

        {/* 主内容区 */}
        <Box
          flex="1"
          bg={bgColor}
          overflowY="auto"
        >
          {hasContent ? (
            children
          ) : (
            <Center h="100%" flexDirection="column" px={4}>
              <VStack 
                spacing={6} 
                bg={cardBg} 
                boxShadow="sm" 
                borderRadius="lg" 
                p={8} 
                textAlign="center"
                maxW="500px"
              >
                <Text fontSize="xl" fontWeight="medium">
                  {t('common.emptyContent')}
                </Text>
                <Text color={emptyStateTextColor} mb={4}>
                  {t('common.quickStartGuide')}
                </Text>
                
                <Flex justify="center" wrap="wrap" gap={4}>
                  <Button 
                    leftIcon={<FontAwesomeIcon icon={faUser} />} 
                    colorScheme="blue" 
                    variant="outline"
                    onClick={() => handleCreateItem('profile')}
                  >
                    {t('common.createProfile')}
                  </Button>
                  <Button 
                    leftIcon={<FontAwesomeIcon icon={faCommentDots} />} 
                    colorScheme="green" 
                    variant="outline"
                    onClick={() => handleCreateItem('quote')}
                  >
                    {t('common.addQuote')}
                  </Button>
                  <Button 
                    leftIcon={<FontAwesomeIcon icon={faHistory} />} 
                    colorScheme="purple" 
                    variant="outline"
                    onClick={() => handleCreateItem('experience')}
                  >
                    {t('common.recordExperience')}
                  </Button>
                </Flex>
              </VStack>
            </Center>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}; 