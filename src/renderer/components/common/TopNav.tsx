import React, { useContext } from 'react';
import {
  Flex,
  Box,
  IconButton,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Text,
  HStack,
  MenuDivider,
  Button,
  Icon
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faMoon,
  faSun,
  faGlobe,
  faUser,
  faCog,
  faBell,
  faSignOutAlt,
  faLanguage
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { AppContext } from '../../contexts/AppContext';

// 顶部导航组件接口
interface TopNavProps {
  onMenuClick: () => void;
}

// 顶部导航组件
const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { t, i18n } = useTranslation();
  const { state, setLanguage } = useContext(AppContext);
  const { language } = state;

  // 语言切换处理
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // 获取当前语言名称
  const getCurrentLanguageName = () => {
    switch (language) {
      case 'en': return 'English';
      case 'zh': return '中文';
      case 'ja': return '日本語';
      default: return '中文';
    }
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      py={2}
      px={4}
      borderBottomWidth="1px"
      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      boxShadow="sm"
      h="60px"
    >
      {/* 移动端菜单按钮 */}
      <IconButton
        aria-label="Menu"
        display={{ base: 'flex', md: 'none' }}
        icon={<FontAwesomeIcon icon={faBars} />}
        onClick={onMenuClick}
        variant="ghost"
        fontSize="xl"
      />

      {/* 页面标题 */}
      <Box flex={1} ml={{ base: 4, md: 0 }}>
        <Text fontWeight="bold" fontSize="lg">
          {t('app.title')}
        </Text>
      </Box>

      {/* 右侧功能按钮 */}
      <HStack spacing={3}>
        {/* 语言选择菜单 */}
        <Menu closeOnSelect>
          <MenuButton
            as={Button}
            variant="ghost"
            rightIcon={<FontAwesomeIcon icon={faLanguage} />}
            _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }}
            size="sm"
          >
            {getCurrentLanguageName()}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleLanguageChange('zh')}>
              {language === 'zh' && <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />}
              中文
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('en')}>
              {language === 'en' && <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />}
              English
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('ja')}>
              {language === 'ja' && <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />}
              日本語
            </MenuItem>
          </MenuList>
        </Menu>

        {/* 通知菜单 */}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="通知"
            icon={
              <>
                <FontAwesomeIcon icon={faBell} />
                <Badge
                  colorScheme="red"
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  fontSize="xs"
                  borderRadius="full"
                  w="16px"
                  h="16px"
                >
                  2
                </Badge>
              </>
            }
            variant="ghost"
            fontSize="lg"
            position="relative"
          />
          <MenuList>
            <MenuItem>通知1: 系统更新已完成</MenuItem>
            <MenuItem>通知2: 您有新的分析结果</MenuItem>
          </MenuList>
        </Menu>

        {/* 用户菜单 */}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="用户菜单"
            icon={<FontAwesomeIcon icon={faUser} />}
            variant="ghost"
            fontSize="lg"
          />
          <MenuList>
            <MenuItem icon={<Icon as={FontAwesomeIcon} icon={faUser} />}>
              {t('common.profile')}
            </MenuItem>
            <MenuItem icon={<Icon as={FontAwesomeIcon} icon={faCog} />}>
              {t('common.settings')}
            </MenuItem>
            <MenuDivider />
            <MenuItem icon={<Icon as={FontAwesomeIcon} icon={faSignOutAlt} />}>
              {t('common.logout')}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

export default TopNav; 