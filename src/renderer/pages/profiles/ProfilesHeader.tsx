import React from 'react';
import { Flex, Heading, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface ProfilesHeaderProps {
  onCreateClick: () => void;
  isDisabled?: boolean;
}

const ProfilesHeader: React.FC<ProfilesHeaderProps> = ({ 
  onCreateClick, 
  isDisabled = false 
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('profiles.title')}</Heading>
        <Button 
          leftIcon={<FontAwesomeIcon icon={faPlus} />} 
          colorScheme="blue" 
          onClick={onCreateClick}
          isDisabled={isDisabled}
        >
          {t('profiles.create')}
        </Button>
      </Flex>
    </motion.div>
  );
};

export default ProfilesHeader; 