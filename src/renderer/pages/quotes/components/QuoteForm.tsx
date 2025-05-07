import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, Select, useToast
} from '@chakra-ui/react';

interface QuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    content: string;
    source?: string;
    tags?: string;
    importance?: number;
    date?: string;
  }) => void;
  profileId: number | null;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ isOpen, onClose, onSubmit, profileId }) => {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState('');
  const [importance, setImportance] = useState(3);
  const [date, setDate] = useState('');
  const toast = useToast();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({ title: '内容不能为空', status: 'warning' });
      return;
    }
    if (!profileId) {
      toast({ title: '请先选择用户', status: 'warning' });
      return;
    }
    onSubmit({ content, source, tags, importance, date });
    setContent(''); setSource(''); setTags(''); setImportance(3); setDate('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>创建语录</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3} isRequired>
            <FormLabel>内容</FormLabel>
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="请输入语录内容" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>来源</FormLabel>
            <Input value={source} onChange={e => setSource(e.target.value)} placeholder="如：作者/出处" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>标签</FormLabel>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="多个标签用逗号分隔" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>重要性</FormLabel>
            <Select value={importance} onChange={e => setImportance(Number(e.target.value))}>
              <option value={1}>1 - 一般</option>
              <option value={2}>2 - 普通</option>
              <option value={3}>3 - 推荐</option>
              <option value={4}>4 - 重要</option>
              <option value={5}>5 - 极其重要</option>
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>日期</FormLabel>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>取消</Button>
          <Button colorScheme="blue" onClick={handleSubmit}>保存</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuoteForm; 