import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Stack,
  Icon,
  Button,
  useColorMode
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faQuoteLeft,
  faWalking,
  faChartPie,
  faPlus,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

// 渐入动画配置
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// 子元素动画配置
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// 仪表盘页面组件
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  // 快捷操作项
  const quickActions = [
    { 
      icon: faUser, 
      title: t('navigation.profiles'), 
      action: t('common.create'), 
      color: 'blue.500',
      path: '/profiles/new'
    },
    { 
      icon: faQuoteLeft, 
      title: t('navigation.quotes'), 
      action: t('common.create'), 
      color: 'orange.500',
      path: '/quotes/new'
    },
    { 
      icon: faWalking, 
      title: t('navigation.experiences'), 
      action: t('common.create'), 
      color: 'purple.500',
      path: '/experiences/new'
    },
    { 
      icon: faChartPie, 
      title: t('navigation.analysis'), 
      action: t('common.create'), 
      color: 'green.500',
      path: '/analysis/new'
    }
  ];

  return (
    <Box as={motion.div} variants={container} initial="hidden" animate="show">
      <Heading as="h1" size="lg" mb={6}>
        {t('navigation.dashboard')}
      </Heading>

      {/* 快捷操作区域 */}
      <Box as={motion.div} variants={item} mb={8}>
        <Heading as="h2" size="md" mb={4}>
          {t('dashboard.quickActions')}
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              as={motion.div} 
              whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
              bg={colorMode === 'dark' ? 'gray.700' : 'white'}
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
              boxShadow="sm"
              borderRadius="lg"
            >
              <CardBody>
                <Stack direction="row" align="center" spacing={4}>
                  <Box 
                    p={2} 
                    borderRadius="md" 
                    bg={colorMode === 'dark' ? `${action.color}3A` : `${action.color}1A`}
                  >
                    <Icon 
                      as={FontAwesomeIcon} 
                      icon={action.icon} 
                      color={action.color} 
                      fontSize="xl" 
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontWeight="medium">{action.title}</Text>
                  </Box>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<Icon as={FontAwesomeIcon} icon={faPlus} />}
                    _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.100' }}
                  >
                    {action.action}
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* 最近内容区域 */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }} gap={6}>
        {/* 最近个人信息 */}
        <GridItem as={motion.div} variants={item}>
          <Card h="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
            <CardHeader pb={0}>
              <Heading size="md">{t('dashboard.recentProfiles')}</Heading>
            </CardHeader>
            <CardBody>
              <Text>{t('dashboard.recentProfiles')} - 暂无数据</Text>
            </CardBody>
            <CardFooter pt={0} justifyContent="flex-end">
              <Button 
                variant="ghost" 
                size="sm" 
                rightIcon={<Icon as={FontAwesomeIcon} icon={faChevronRight} />}
              >
                {t('common.more')}
              </Button>
            </CardFooter>
          </Card>
        </GridItem>

        {/* 最近语录 */}
        <GridItem as={motion.div} variants={item}>
          <Card h="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
            <CardHeader pb={0}>
              <Heading size="md">{t('dashboard.recentQuotes')}</Heading>
            </CardHeader>
            <CardBody>
              <Text>{t('dashboard.recentQuotes')} - 暂无数据</Text>
            </CardBody>
            <CardFooter pt={0} justifyContent="flex-end">
              <Button 
                variant="ghost" 
                size="sm" 
                rightIcon={<Icon as={FontAwesomeIcon} icon={faChevronRight} />}
              >
                {t('common.more')}
              </Button>
            </CardFooter>
          </Card>
        </GridItem>

        {/* 最近经历 */}
        <GridItem as={motion.div} variants={item}>
          <Card h="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
            <CardHeader pb={0}>
              <Heading size="md">{t('dashboard.recentExperiences')}</Heading>
            </CardHeader>
            <CardBody>
              <Text>{t('dashboard.recentExperiences')} - 暂无数据</Text>
            </CardBody>
            <CardFooter pt={0} justifyContent="flex-end">
              <Button 
                variant="ghost" 
                size="sm" 
                rightIcon={<Icon as={FontAwesomeIcon} icon={faChevronRight} />}
              >
                {t('common.more')}
              </Button>
            </CardFooter>
          </Card>
        </GridItem>

        {/* 最近分析 */}
        <GridItem as={motion.div} variants={item}>
          <Card h="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
            <CardHeader pb={0}>
              <Heading size="md">{t('dashboard.recentAnalysis')}</Heading>
            </CardHeader>
            <CardBody>
              <Text>{t('dashboard.recentAnalysis')} - 暂无数据</Text>
            </CardBody>
            <CardFooter pt={0} justifyContent="flex-end">
              <Button 
                variant="ghost" 
                size="sm" 
                rightIcon={<Icon as={FontAwesomeIcon} icon={faChevronRight} />}
              >
                {t('common.more')}
              </Button>
            </CardFooter>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard; 