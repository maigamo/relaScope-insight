import React from 'react';
import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  Button 
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface ProfilesEmptyStateProps {
  onCreateClick: () => void;
  isFiltered?: boolean;
}

const ProfilesEmptyState: React.FC<ProfilesEmptyStateProps> = ({ 
  onCreateClick, 
  isFiltered = false 
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Alert 
        status="info" 
        variant="subtle" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        textAlign="center" 
        height="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {isFiltered ? t('profiles.noSearchResults') : t('profiles.noProfiles')}
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {isFiltered ? t('profiles.tryOtherSearch') : t('profiles.createFirst')}
        </AlertDescription>
        {!isFiltered && (
          <Button 
            mt={4} 
            colorScheme="blue" 
            leftIcon={<FontAwesomeIcon icon={faPlus} />} 
            onClick={onCreateClick}
          >
            {t('profiles.create')}
          </Button>
        )}
      </Alert>
    </motion.div>
  );
};

export default ProfilesEmptyState; 