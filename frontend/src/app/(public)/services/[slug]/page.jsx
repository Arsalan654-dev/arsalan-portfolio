'use client';

import { useParams } from 'next/navigation';
import ServiceDetailContent from '@/components/services/ServiceDetailContent';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  return <ServiceDetailContent slug={slug} />;
}
