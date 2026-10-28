'use client';

import { useParams } from 'next/navigation';
import ProjectDetailContent from '@/components/projects/ProjectDetailContent';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  return <ProjectDetailContent slug={slug} />;
}
