import React, { useContext } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  FormControl,
  FormLabel,
  Switch,
  Select,
  useColorMode,
  Card,
  CardBody,
  Icon,
  Text
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faGlobe,
  faBell,
  faShield,
  faDatabase,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { AppContext } from '../../contexts/AppContext';
import { ConfigService } from '../../services/ipc.service';

// 动画配置
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// 设置页面组件
const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { language, setLanguage } = useContext(AppContext);

  // 处理语言变更
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    ConfigService.setConfig('app.language', newLanguage);
  };

  // 处理主题模式变更
  const handleColorModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    toggleColorMode();
    ConfigService.setConfig('ui.darkMode', e.target.checked);
  };

  return (
    <Box
      as={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Heading as="h1" size="lg" mb={6}>
        {t('navigation.settings')}
      </Heading>

      <Tabs variant="enclosed" colorScheme="brand" isLazy>
        <TabList>
          <Tab>
            <Icon as={FontAwesomeIcon} icon={faPalette} mr={2} />
            {t('settings.appearance')}
          </Tab>
          <Tab>
            <Icon as={FontAwesomeIcon} icon={faGlobe} mr={2} />
            {t('settings.language')}
          </Tab>
          <Tab>
            <Icon as={FontAwesomeIcon} icon={faBell} mr={2} />
            {t('settings.notifications')}
          </Tab>
          <Tab>
            <Icon as={FontAwesomeIcon} icon={faDatabase} mr={2} />
            {t('settings.database')}
          </Tab>
          <Tab>
            <Icon as={FontAwesomeIcon} icon={faRobot} mr={2} />
            {t('settings.llm')}
          </Tab>
          <Tab>
            <Icon as={FontAwesomeIcon} icon={faShield} mr={2} />
            {t('settings.privacy')}
          </Tab>
        </TabList>

        <TabPanels>
          {/* 外观设置 */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card as={motion.div} variants={item}>
                <CardBody>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="dark-mode" mb="0">
                      {t('settings.darkMode')}
                    </FormLabel>
                    <Switch
                      id="dark-mode"
                      isChecked={colorMode === 'dark'}
                      onChange={handleColorModeChange}
                      colorScheme="brand"
                    />
                  </FormControl>
                </CardBody>
              </Card>

              <Card as={motion.div} variants={item}>
                <CardBody>
                  <Text>
                    {t('settings.appearance')} - 更多设置还在开发中
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* 语言设置 */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card as={motion.div} variants={item}>
                <CardBody>
                  <FormControl>
                    <FormLabel htmlFor="language">
                      {t('settings.language')}
                    </FormLabel>
                    <Select
                      id="language"
                      value={language}
                      onChange={handleLanguageChange}
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </Select>
                  </FormControl>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* 通知设置 */}
          <TabPanel>
            <Card as={motion.div} variants={item}>
              <CardBody>
                <Text>
                  {t('settings.notifications')} - 更多设置还在开发中
                </Text>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 数据库设置 */}
          <TabPanel>
            <Card as={motion.div} variants={item}>
              <CardBody>
                <Text>
                  {t('settings.database')} - 更多设置还在开发中
                </Text>
              </CardBody>
            </Card>
          </TabPanel>

          {/* LLM设置 */}
          <TabPanel>
            <Card as={motion.div} variants={item}>
              <CardBody>
                <Text>
                  {t('settings.llm')} - 更多设置还在开发中
                </Text>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 隐私设置 */}
          <TabPanel>
            <Card as={motion.div} variants={item}>
              <CardBody>
                <Text>
                  {t('settings.privacy')} - 更多设置还在开发中
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SettingsPage; 