'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import publicService from '@/services/publicService';
import { getImageUrl, formatDate } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendar, faUser, faTag } from '@fortawesome/free-solid-svg-icons';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getBlogBySlug(slug);
        if (data.success) setBlog(data.data);
      } catch (err) {
        console.error('Failed to load blog', err);
        toast.error('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) return <LoadingSpinner text="Loading blog..." />;

  if (!blog) {
    return (
      <section style={{ background: 'var(--bs)', minHeight: '80vh' }} className="d-flex align-items-center justify-content-center flex-column">
        <h3 style={{ color: 'var(--tp)' }}>Blog not found</h3>
        <Link href="/blogs" className="btn mt-3" style={{ border: '1px solid var(--ap)', color: 'var(--ap)' }}>Back to Blogs</Link>
      </section>
    );
  }

  return (
    <section style={{ background: 'var(--bs)', minHeight: '80vh' }}>
      <div className="container py-5">
        <Link href="/blogs" className="btn mb-4" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back to Blogs
        </Link>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {blog.image && (
              <div className="rounded-3 overflow-hidden mb-4" style={{ maxHeight: '450px' }}>
                <img src={getImageUrl(blog.image)} alt={blog.title} className="w-100" style={{ objectFit: 'cover' }} />
              </div>
            )}
            <h1 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>{blog.title}</h1>
            <div className="d-flex flex-wrap gap-3 mb-4" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
              {blog.author && (
                <span><FontAwesomeIcon icon={faUser} className="me-1" />{blog.author?.name || blog.author || ''}</span>
              )}
              <span><FontAwesomeIcon icon={faCalendar} className="me-1" />{formatDate(blog.createdAt)}</span>
              {blog.category && (
                <span><FontAwesomeIcon icon={faTag} className="me-1" />{blog.category?.category_title || blog.category?.name || ''}</span>
              )}
            </div>
            <div style={{ color: 'var(--ts)', lineHeight: 1.8, fontSize: '1.05rem' }}>
              {blog.excerpt && <p className="fs-5 fw-medium" style={{ color: 'var(--tp)' }}>{blog.excerpt}</p>}
              {blog.content ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <p>{blog.description}</p>
              )}
            </div>
            {blog.tags?.length > 0 && (
              <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--bdr)' }}>
                <div className="d-flex flex-wrap gap-2">
                  {blog.tags.map((t, i) => (
                    <span key={i} className="badge rounded-pill px-3 py-2 fw-normal" style={{ background: 'var(--ap)', color: '#fff' }}>#{t.name || t || ''}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
