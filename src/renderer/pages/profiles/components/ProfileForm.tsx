import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  FormErrorMessage,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface ProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
  onSubmit: (profileData: any) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ isOpen, onClose, profile, onSubmit }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const isEditMode = !!profile;

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    occupation: '',
    interests: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interestsList, setInterestsList] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // 加载编辑数据
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        gender: profile.gender || '',
        age: profile.age ? String(profile.age) : '',
        occupation: profile.occupation || '',
        interests: '',
        notes: profile.notes || '',
      });
      
      if (profile.interests) {
        setInterestsList(profile.interests.split(',').map((interest: string) => interest.trim()));
      }
    }
  }, [profile]);

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    }
    
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 120)) {
      newErrors.age = t('validation.invalidAge');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单输入变更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 处理年龄输入变更
  const handleAgeChange = (valueAsString: string) => {
    setFormData(prev => ({ ...prev, age: valueAsString }));
    
    // 清除错误
    if (errors.age) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.age;
        return newErrors;
      });
    }
  };

  // 添加兴趣爱好
  const handleAddInterest = () => {
    if (newInterest.trim() && !interestsList.includes(newInterest.trim())) {
      setInterestsList(prev => [...prev, newInterest.trim()]);
      setNewInterest('');
    } else if (interestsList.includes(newInterest.trim())) {
      toast({
        title: t('common.info'),
        description: t('profiles.interestExists'),
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // 删除兴趣爱好
  const handleRemoveInterest = (interest: string) => {
    setInterestsList(prev => prev.filter(item => item !== interest));
  };

  // 处理兴趣爱好键盘输入
  const handleInterestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      e.preventDefault();
      handleAddInterest();
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 确保兴趣爱好列表正确处理，即使为空也应传递空字符串
      const interestsString = interestsList.length > 0 ? interestsList.join(', ') : '';
      
      console.log('表单提交前兴趣爱好列表:', interestsList);
      console.log('表单提交的兴趣爱好字符串:', interestsString);
      
      const submissionData = {
        ...formData,
        interests: interestsString,
        age: formData.age ? parseInt(formData.age, 10) : null,
      };
      
      console.log('表单最终提交数据:', submissionData);
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('提交表单失败:', error);
      toast({
        title: t('common.error'),
        description: t('common.submitError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? t('profiles.edit') : t('profiles.create')}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>{t('profiles.name')}</FormLabel>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('profiles.namePlaceholder')}
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl>
              <FormLabel>{t('profiles.gender')}</FormLabel>
              <Select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                placeholder={t('profiles.genderPlaceholder')}
              >
                <option value="male">{t('profiles.male')}</option>
                <option value="female">{t('profiles.female')}</option>
                <option value="other">{t('profiles.other')}</option>
              </Select>
            </FormControl>
            
            <FormControl isInvalid={!!errors.age}>
              <FormLabel>{t('profiles.age')}</FormLabel>
              <NumberInput 
                min={0} 
                max={120} 
                value={formData.age}
                onChange={handleAgeChange}
              >
                <NumberInputField 
                  name="age"
                  placeholder={t('profiles.agePlaceholder')}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.age && <FormErrorMessage>{errors.age}</FormErrorMessage>}
            </FormControl>
            
            <FormControl>
              <FormLabel>{t('profiles.occupation')}</FormLabel>
              <Input 
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder={t('profiles.occupationPlaceholder')}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>{t('profiles.interests')}</FormLabel>
              <InputGroup>
                <Input 
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                  placeholder={t('profiles.interestsPlaceholder')}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleAddInterest}>
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              
              {interestsList.length > 0 && (
                <HStack mt={2} flexWrap="wrap">
                  {interestsList.map((interest, index) => (
                    <Tag
                      key={index}
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                      m={1}
                    >
                      <TagLabel>{interest}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveInterest(interest)} />
                    </Tag>
                  ))}
                </HStack>
              )}
            </FormControl>
            
            <FormControl>
              <FormLabel>{t('profiles.notes')}</FormLabel>
              <Textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t('profiles.notesPlaceholder')}
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEditMode ? t('common.save') : t('common.create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileForm; 