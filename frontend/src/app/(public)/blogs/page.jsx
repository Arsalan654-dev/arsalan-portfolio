'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import publicService from '@/services/publicService';
import { getImageUrl, truncateText, formatDate } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getBlogs();
        if (data.success) setBlogs(data.data || []);
      } catch (err) {
        console.error('Failed to load blogs', err);
        toast.error('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner text="Loading blogs..." />;

  return (
    <section style={{ background: 'var(--bs)', minHeight: '80vh' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Blogs
          </h1>
          <p className="mb-0" style={{ color: 'var(--ts)' }}>Thoughts, tutorials, and insights</p>
        </div>
        {blogs.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ color: 'var(--ts)', fontSize: '1.1rem' }}>No blog posts yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {blogs.map(blog => (
              <div key={blog._id} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 rounded-3 overflow-hidden" style={{ background: 'var(--bc)' }}>
                  {blog.image && (
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <img src={getImageUrl(blog.image)} alt={blog.title} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    {blog.category && (
                      <span className="badge rounded-pill px-3 py-2 mb-2 align-self-start fw-normal" style={{ background: 'var(--ap)', color: '#fff' }}>
                        {blog.category.category_title || blog.category.name || ''}
                      </span>
                    )}
                    <h5 className="fw-bold mb-2" style={{ color: 'var(--tp)' }}>{truncateText(blog.title, 60)}</h5>
                    <p className="card-text flex-grow-1" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
                      {truncateText(blog.excerpt || blog.description, 120)}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top" style={{ borderColor: 'var(--bdr)' }}>
                      <small style={{ color: 'var(--ts)' }}>{formatDate(blog.createdAt)}</small>
                      <Link href={`/blogs/${blog.slug || blog._id}`} className="btn fw-semibold px-3 py-1" style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent', fontSize: '0.85rem' }}>
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
