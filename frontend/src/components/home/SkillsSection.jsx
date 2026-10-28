'use client';
import { useState, useEffect, useCallback } from 'react';
import publicService from '../../services/publicService';
import { getCdnIconByTitle } from '../../utils/cdnIcons';

const defaultSkills = [
  { name: 'React / Next.js', level: 95 },
  { name: 'Node.js', level: 90 },
  { name: 'JavaScript / TypeScript', level: 92 },
  { name: 'HTML / CSS', level: 95 },
  { name: 'Python', level: 75 },
  { name: 'MongoDB', level: 78 },
  { name: 'PostgreSQL', level: 72 },
  { name: 'Docker', level: 70 },
  { name: 'Rust', level: 40 },
  { name: 'GraphQL', level: 45 },
  { name: 'Kubernetes', level: 35 },
];

export default function SkillsSection() {
  const [skills, setSkills] = useState(defaultSkills);
  const [current, setCurrent] = useState(0);
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await publicService.getTechnologies();
        if (data.success && data.data?.length) {
          const all = data.data.map(tech => ({
            name: tech.technology_title || tech.skill_title,
            level: 70 + Math.floor(Math.random() * 25),
            icon: tech.icon || getCdnIconByTitle(tech.technology_title || tech.skill_title),
          }));
          if (all.length) setSkills(all);
        }
      } catch {}
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) setPerView(2);
      else if (window.innerWidth < 768) setPerView(3);
      else setPerView(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, skills.length - perView);

  const next = useCallback(() => {
    setCurrent(c => c >= maxIndex ? 0 : c + 1);
  }, [maxIndex]);

  useEffect(() => {
    if (skills.length < 2) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [skills.length, next]);

  const getIcon = (skill) => {
    const url = skill.icon || getCdnIconByTitle(skill.name);
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      return <img src={url} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />;
    }
    return <i className="fas fa-code" style={{ fontSize: '1.4rem', color: 'var(--ap)' }}></i>;
  };

  return (
    <section className="py-5" style={{ background: 'var(--bs)' }}>
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1" style={{ color: 'var(--tp)' }}>Skills & Expertise</h2>
          <p style={{ color: 'var(--ts)' }}>Technologies I work with</p>
        </div>

        <div className="position-relative overflow-hidden">
          <div className="d-flex" style={{ transform: `translateX(-${current * (100 / perView)}%)`, transition: 'transform 0.5s ease' }}>
            {skills.map((skill, i) => (
              <div key={skill.name + i} className="flex-shrink-0" style={{ width: `${100 / perView}%`, padding: '0 6px' }}>
                <div className="p-3 rounded-3" style={{ background: 'var(--bp)', border: '1px solid var(--bdr)', height: '100%' }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px',
                      background: 'var(--gc)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getIcon(skill)}
                    </div>
                    <h6 className="fw-bold mb-0" style={{ color: 'var(--tp)', fontSize: '0.85rem' }}>{skill.name}</h6>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: 'var(--ts)', fontSize: '0.7rem' }}>Proficiency</span>
                    <span style={{ color: 'var(--ap)', fontSize: '0.7rem', fontWeight: 600 }}>{skill.level}%</span>
                  </div>
                  <div className="progress" style={{ height: '6px', background: 'var(--bt)', borderRadius: '3px' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${skill.level}%`,
                        background: 'var(--gm)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {skills.length > perView && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="btn p-0 rounded-circle"
                  style={{
                    width: '8px', height: '8px',
                    background: i === current ? 'var(--ap)' : 'var(--bdr)',
                    border: 'none', transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
