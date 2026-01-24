import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { createPageUrl } from './utils';

export default function Home() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(createPageUrl('KibbleAnalyzer'));
  }, [navigate]);
  
  return null;
}