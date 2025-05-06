import React from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ProfilesLoading: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Flex direction="column" align="center" justify="center" py={10}>
        <Spinner size="xl" mb={4} color="blue.500" />
        <Text>{t('common.loading')}</Text>
      </Flex>
    </motion.div>
  );
};

export default ProfilesLoading; 