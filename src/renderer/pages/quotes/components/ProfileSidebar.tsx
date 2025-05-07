import React, { useEffect, useState } from 'react';
import { VStack, Box, Text, Avatar, Spinner } from '@chakra-ui/react';
import { ipcService } from '../../../services/ipc.service';

interface Profile {
  id: number;
  name: string;
  avatar?: string;
}

interface ProfileSidebarProps {
  selectedProfileId: number | null;
  onSelect: (profileId: number) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ selectedProfileId, onSelect }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 通过IPC获取真实档案数据
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const { DB_CHANNELS } = window.IPC_CONSTANTS;
        const response = await ipcService.invoke(DB_CHANNELS.PROFILE.GET_ALL);
        setProfiles(response || []);
      } catch (err: any) {
        setError(err?.message || '加载档案失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (loading) {
    return <Spinner size="md" my={8} />;
  }

  if (error) {
    return <Box color="red.500" my={8} textAlign="center">{error}</Box>;
  }

  return (
    <VStack align="stretch" spacing={1} w="100%">
      {profiles.map(profile => (
        <Box
          key={profile.id}
          px={4}
          py={3}
          bg={selectedProfileId === profile.id ? 'blue.50' : 'transparent'}
          borderLeft={selectedProfileId === profile.id ? '4px solid #3182ce' : '4px solid transparent'}
          cursor="pointer"
          _hover={{ bg: 'gray.50' }}
          onClick={() => typeof profile.id === 'number' && onSelect(profile.id)}
          display="flex"
          alignItems="center"
        >
          <Avatar size="sm" name={profile.name} src={profile.avatar} mr={2} />
          <Text fontWeight={selectedProfileId === profile.id ? 'bold' : 'normal'}>{profile.name}</Text>
        </Box>
      ))}
    </VStack>
  );
};

export default ProfileSidebar; 