import React from 'react';
import { Box, Center, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

/**
 * 六边形模型空状态组件
 * 当未选择任何档案时显示的引导界面
 */
const EmptyHexagonState: React.FC = () => {
  const gridColor = useColorModeValue('#d1d5db', '#4b5563');
  
  // 空状态数据
  const emptyChartData = [
    { attribute: "安全感", value: 0, fullMark: 10 },
    { attribute: "成就感", value: 0, fullMark: 10 },
    { attribute: "自由感", value: 0, fullMark: 10 },
    { attribute: "归属感", value: 0, fullMark: 10 },
    { attribute: "新奇感", value: 0, fullMark: 10 },
    { attribute: "掌控感", value: 0, fullMark: 10 }
  ];

  return (
    <Center h="100%" flexDirection="column" p={8}>
      <Box
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 } as any}
        textAlign="center"
        maxW="500px"
      >
        <FontAwesomeIcon icon={faInfoCircle} size="3x" color="#22c55e" />
        <Heading size="md" mt={4} mb={2}>六边形人性模型</Heading>
        <Text mb={6}>请从左侧选择一个档案，查看其六边形人性模型分析结果。</Text>
        
        <Box bg={useColorModeValue('gray.50', 'gray.700')} p={6} borderRadius="lg">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={emptyChartData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="attribute" />
              <PolarRadiusAxis domain={[0, 10]} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Center>
  );
};

export default EmptyHexagonState; 