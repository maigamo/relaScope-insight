import React from 'react';
import { InputGroup, InputLeftElement, Input } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface ProfilesSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ProfilesSearch: React.FC<ProfilesSearchProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <FontAwesomeIcon icon={faSearch} color="gray.300" />
        </InputLeftElement>
        <Input 
          placeholder={t('profiles.search')} 
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </InputGroup>
    </motion.div>
  );
};

export default ProfilesSearch; 