import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(createPageUrl('KibbleAnalyzer'), { replace: true });
  }, []);
  
  return null;
}