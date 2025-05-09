import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Flex,
  Divider,
  useColorModeValue,
  VStack,
  Heading
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ipcService } from '../../../services/ipc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faChartLine, faQuoteLeft, faCalendarDay } from '@fortawesome/free-solid-svg-icons';

// 六边形模型数据类型
interface HexagonModelData {
  id: number;
  profileId: number;
  title: string;
  security: number; // 安全感 0-10
  achievement: number; // 成就感 0-10
  freedom: number; // 自由感 0-10
  belonging: number; // 归属感 0-10
  novelty: number; // 新奇感 0-10
  control: number; // 掌控感 0-10
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 相关引用和经历数据
interface RelatedItem {
  id: number;
  content: string;
  date?: string;
  context?: string;
  type?: string;
}

interface HexagonModelDetailProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: number;
}

// 中文映射
const dimensionLabels = {
  security: "安全感",
  achievement: "成就感",
  freedom: "自由感",
  belonging: "归属感",
  novelty: "新奇感", 
  control: "掌控感"
};

// 维度解释
const dimensionDescriptions = {
  security: "对稳定、确定性和安全保障的追求程度。高分表示重视稳定和安全，低分则可能更适应不确定性。",
  achievement: "对成功、认可和成就的追求程度。高分表示强烈追求成就和外部认可，低分则相对不太关注外界评价。",
  freedom: "对自主、独立和自由的追求程度。高分表示重视个人自由和独立决策，低分则可能更倾向于依赖和从众。",
  belonging: "对关系、团体和归属的追求程度。高分表示注重社交关系和群体认同，低分则可能更独立自处。",
  novelty: "对新奇、刺激和变化的追求程度。高分表示喜欢探索和冒险，低分则更喜欢熟悉和稳定的环境。",
  control: "对掌控、影响和主导的追求程度。高分表示期望掌控局面和影响他人，低分则可能更愿意顺其自然。"
};

// 评分等级
const getScoreLevel = (score: number) => {
  if (score >= 8) return { label: '极高', color: 'green' };
  if (score >= 6) return { label: '较高', color: 'teal' };
  if (score >= 4) return { label: '中等', color: 'blue' };
  if (score >= 2) return { label: '较低', color: 'orange' };
  return { label: '极低', color: 'red' };
};

const HexagonModelDetail: React.FC<HexagonModelDetailProps> = ({ isOpen, onClose, modelId }) => {
  const { t } = useTranslation();
  const [model, setModel] = useState<HexagonModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedQuotes, setRelatedQuotes] = useState<RelatedItem[]>([]);
  const [relatedExperiences, setRelatedExperiences] = useState<RelatedItem[]>([]);
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // 获取模型详情
  useEffect(() => {
    const fetchModelDetails = async () => {
      if (!modelId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 获取模型数据
        const response = await ipcService.invoke('db:hexagon:getById', { id: modelId });
        
        let modelData = null;
        if (response && response.success && response.data) {
          modelData = response.data;
        } else if (response && !response.success) {
          throw new Error(response.error || '获取模型失败');
        } else if (Array.isArray(response) && response.length > 0) {
          modelData = response[0];
        }
        
        if (modelData) {
          setModel(modelData);
          
          // 获取相关引用
          const quotesResponse = await ipcService.invoke('db:quotes:get-by-profile', { 
            profileId: modelData.profileId, 
            limit: 5 
          });
          
          if (quotesResponse && quotesResponse.success && quotesResponse.data) {
            setRelatedQuotes(quotesResponse.data);
          } else if (Array.isArray(quotesResponse)) {
            setRelatedQuotes(quotesResponse.slice(0, 5));
          }
          
          // 获取相关经历
          const experiencesResponse = await ipcService.invoke('db:experiences:get-by-profile', { 
            profileId: modelData.profileId, 
            limit: 5 
          });
          
          if (experiencesResponse && experiencesResponse.success && experiencesResponse.data) {
            setRelatedExperiences(experiencesResponse.data);
          } else if (Array.isArray(experiencesResponse)) {
            setRelatedExperiences(experiencesResponse.slice(0, 5));
          }
        }
      } catch (err: any) {
        console.error('获取模型详情失败:', err);
        setError(err?.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && modelId) {
      fetchModelDetails();
    }
  }, [isOpen, modelId]);
  
  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>六边形人性模型详情</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {loading ? (
            <Flex justify="center" align="center" minH="300px">
              <Spinner size="xl" color="green.500" thickness="4px" />
            </Flex>
          ) : error ? (
            <Box textAlign="center" p={6}>
              <Text color="red.500">{error}</Text>
              <Button mt={4} colorScheme="green" onClick={() => onClose()}>
                关闭
              </Button>
            </Box>
          ) : model ? (
            <Tabs colorScheme="green" variant="enclosed">
              <TabList>
                <Tab><FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px' }} />分析结果</Tab>
                <Tab><FontAwesomeIcon icon={faQuoteLeft} style={{ marginRight: '8px' }} />相关语录</Tab>
                <Tab><FontAwesomeIcon icon={faCalendarDay} style={{ marginRight: '8px' }} />相关经历</Tab>
                <Tab><FontAwesomeIcon icon={faHistory} style={{ marginRight: '8px' }} />历史记录</Tab>
              </TabList>
              
              <TabPanels>
                {/* 分析结果面板 */}
                <TabPanel>
                  <Box mb={4}>
                    <Heading size="md">
                      {model.title}
                      <Text as="span" fontSize="sm" fontWeight="normal" ml={2} color="gray.500">
                        更新于 {formatDate(model.updatedAt)}
                      </Text>
                    </Heading>
                  </Box>
                  
                  <VStack spacing={4} align="stretch">
                    {Object.entries(dimensionLabels).map(([key, label]) => {
                      const score = model[key as keyof HexagonModelData] as number;
                      const level = getScoreLevel(score);
                      
                      return (
                        <Box 
                          key={key} 
                          p={4} 
                          borderWidth="1px" 
                          borderColor={borderColor} 
                          borderRadius="md"
                          boxShadow="sm"
                        >
                          <Flex justify="space-between" align="center" mb={2}>
                            <Heading size="sm">{label}</Heading>
                            <Badge colorScheme={level.color}>
                              {score}/10 ({level.label})
                            </Badge>
                          </Flex>
                          
                          <Text fontSize="sm" color="gray.600">
                            {dimensionDescriptions[key as keyof typeof dimensionDescriptions]}
                          </Text>
                          
                          {/* 进度条 */}
                          <Box mt={3} h="8px" w="100%" bg="gray.100" borderRadius="full">
                            <Box 
                              h="100%" 
                              w={`${score * 10}%`} 
                              bg={`${level.color}.500`} 
                              borderRadius="full"
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </VStack>
                  
                  {model.notes && (
                    <Box mt={6}>
                      <Divider mb={4} />
                      <Heading size="sm" mb={2}>分析备注</Heading>
                      <Text whiteSpace="pre-wrap">{model.notes}</Text>
                    </Box>
                  )}
                </TabPanel>
                
                {/* 相关语录面板 */}
                <TabPanel>
                  {relatedQuotes.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {relatedQuotes.map((quote) => (
                        <Box 
                          key={quote.id} 
                          p={4}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                          boxShadow="sm"
                        >
                          <Flex fontSize="xl" mb={2} color="gray.500">
                            <FontAwesomeIcon icon={faQuoteLeft} />
                          </Flex>
                          <Text fontSize="md">{quote.content}</Text>
                          
                          <Flex mt={3} justify="space-between" align="center">
                            {quote.date && (
                              <Text fontSize="sm" color="gray.500">
                                {formatDate(quote.date)}
                              </Text>
                            )}
                            {quote.context && (
                              <Badge colorScheme="green" variant="outline">
                                {quote.context}
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text color="gray.500">没有相关语录记录</Text>
                    </Box>
                  )}
                </TabPanel>
                
                {/* 相关经历面板 */}
                <TabPanel>
                  {relatedExperiences.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {relatedExperiences.map((exp) => (
                        <Box 
                          key={exp.id} 
                          p={4}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                          boxShadow="sm"
                        >
                          <Heading size="sm" mb={1}>{exp.content}</Heading>
                          
                          <Flex mt={2} justify="space-between" align="center">
                            {exp.date && (
                              <Text fontSize="sm" color="gray.500">
                                {formatDate(exp.date)}
                              </Text>
                            )}
                            {exp.type && (
                              <Badge colorScheme="purple">
                                {exp.type}
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text color="gray.500">没有相关经历记录</Text>
                    </Box>
                  )}
                </TabPanel>
                
                {/* 历史记录面板 */}
                <TabPanel>
                  <Box textAlign="center" py={10}>
                    <Text color="gray.500">暂无历史记录功能</Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Box textAlign="center" p={6}>
              <Text color="gray.500">未找到模型数据</Text>
            </Box>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button colorScheme="gray" onClick={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HexagonModelDetail; 