'use client';

import { useRef, useEffect, useState } from 'react';
import { ShaderBackground } from '@/components/ShaderBackground';
import { MagneticButton } from '@/components/MagneticButton';

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const scrollThrottleRef = useRef<number | undefined>(undefined);

  const sections = [
    { id: 0, name: 'Home' },
    { id: 1, name: 'About' },
    { id: 2, name: 'Solutions' },
    { id: 3, name: 'Who We Serve' },
    { id: 4, name: 'Get Started' },
  ];

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: 'smooth',
      });
      setCurrentSection(index);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();

        if (!scrollContainerRef.current) return;

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: 'instant',
        });

        const sectionWidth = scrollContainerRef.current.offsetWidth;
        const newSection = Math.round(
          scrollContainerRef.current.scrollLeft / sectionWidth
        );
        if (newSection !== currentSection) {
          setCurrentSection(newSection);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentSection]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return;

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined;
          return;
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth;
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const newSection = Math.round(scrollLeft / sectionWidth);

        if (
          newSection !== currentSection &&
          newSection >= 0 &&
          newSection <= 4
        ) {
          setCurrentSection(newSection);
        }

        scrollThrottleRef.current = undefined;
      });
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current);
      }
    };
  }, [currentSection]);

  return (
    <main className='relative h-screen w-full overflow-hidden'>
      <ShaderBackground />

      {/* Navigation */}
      <nav className='fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12'>
        <button
          onClick={() => scrollToSection(0)}
          className='flex items-center gap-2 transition-transform hover:scale-105'
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-foreground/25'>
            <span className='font-sans text-2xl font-bold text-foreground'>
              D
            </span>
          </div>
          <span className='font-sans text-2xl font-semibold tracking-[0.3em] text-foreground md:text-3xl'>
            eckly
          </span>
        </button>

        <div className='hidden items-center gap-8 md:flex'>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group relative font-sans text-sm font-medium transition-colors ${
                currentSection === section.id
                  ? 'text-foreground'
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              {section.name}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                  currentSection === section.id
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              />
            </button>
          ))}
        </div>

        <MagneticButton variant='secondary' href='/login'>
          Sign In
        </MagneticButton>
      </nav>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        data-scroll-container
        className='relative z-10 flex h-screen overflow-x-auto overflow-y-hidden'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Section 1: Hero/Home */}
        <section className='flex min-h-screen w-screen shrink-0 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24'>
          <div className='max-w-3xl'>
            <div className='mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700'>
              <p className='font-mono text-xs text-foreground/90'>
                Event Management SaaS Platform
              </p>
            </div>
            <h1 className='mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-6xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-7xl lg:text-8xl'>
              <span className='text-balance'>
                The All-in-One Scheduling Platform
              </span>
            </h1>
            <p className='mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl'>
              <span className='text-pretty'>
                Built for DJs, artists, and club owners. Automate bookings,
                manage schedules, and streamline your entire event workflow.
              </span>
            </p>
            <div className='flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 duration-1000 delay-300 sm:flex-row sm:items-center'>
              <MagneticButton size='lg' variant='primary' href='/login'>
                Get Started Free
              </MagneticButton>
              <MagneticButton
                size='lg'
                variant='secondary'
                onClick={() => scrollToSection(1)}
              >
                View Solutions
              </MagneticButton>
            </div>
          </div>

          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500'>
            <div className='flex items-center gap-2'>
              <p className='font-mono text-xs text-foreground/80'>
                Scroll to explore
              </p>
              <div className='flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-foreground/80' />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: About */}
        <section className='flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 py-24 md:px-12'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-4xl md:text-5xl font-light text-foreground mb-8'>
              About Deckly
            </h2>
            <div className='space-y-6 text-foreground/70 text-lg leading-relaxed'>
              <p>
                Deckly was built from the ground up to solve the unique
                challenges of event scheduling in the music and nightlife
                industry. We understand that managing DJs, coordinating venues,
                and creating seamless run of shows requires more than just a
                calendar app.
              </p>
              <p>
                Our platform combines intelligent automation with intuitive
                design to help you focus on what matters most: creating
                unforgettable experiences for your audience.
              </p>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-foreground/10'>
                <div>
                  <div className='text-4xl font-light text-foreground mb-2'>
                    10K+
                  </div>
                  <div className='text-foreground/70'>Events Managed</div>
                </div>
                <div>
                  <div className='text-4xl font-light text-foreground mb-2'>
                    500+
                  </div>
                  <div className='text-foreground/70'>Active Venues</div>
                </div>
                <div>
                  <div className='text-4xl font-light text-foreground mb-2'>
                    2K+
                  </div>
                  <div className='text-foreground/70'>Artists & DJs</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Solutions */}
        <section className='flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 py-24 md:px-12'>
          <div className='max-w-6xl mx-auto w-full'>
            <div className='mb-16'>
              <h2 className='text-4xl md:text-5xl font-light text-foreground mb-4'>
                Powerful Solutions for Modern Event Management
              </h2>
              <p className='text-foreground/70 text-lg max-w-2xl'>
                Everything you need to automate, organize, and scale your event
                operations
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Event Creation & Management */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-8 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-7 h-7 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-foreground mb-3'>
                  Event Creation & Management
                </h3>
                <p className='text-foreground/70 leading-relaxed'>
                  Create and edit events with intuitive forms. Manage all your
                  event details, venues, and timings in one place.
                </p>
              </div>

              {/* Run of Show Editor */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-8 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-7 h-7 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-foreground mb-3'>
                  Run of Show Editor
                </h3>
                <p className='text-foreground/70 leading-relaxed'>
                  Visual timeline builder to assign DJs to time slots.
                  Drag-and-drop interface for seamless scheduling.
                </p>
              </div>

              {/* Email Notifications */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-8 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-7 h-7 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-foreground mb-3'>
                  Smart Email Notifications
                </h3>
                <p className='text-foreground/70 leading-relaxed'>
                  Automated email alerts when DJs are booked. Keep everyone in
                  the loop with professional templates.
                </p>
              </div>

              {/* DJ Auto-Assignment */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-8 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-7 h-7 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-foreground mb-3'>
                  DJ Auto-Assignment
                </h3>
                <p className='text-foreground/70 leading-relaxed'>
                  Intelligent algorithm matches DJs by genre, availability, and
                  rotation. Save hours on manual scheduling.
                </p>
              </div>

              {/* Event Import Automation */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-8 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-7 h-7 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-foreground mb-3'>
                  Event Import Automation
                </h3>
                <p className='text-foreground/70 leading-relaxed'>
                  Automatically import events from Ticketmaster, Posh, and other
                  platforms. No manual data entry required.
                </p>
              </div>

              {/* Analytics & Reporting */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-8 transition-all duration-300'>
                <div className='w-14 h-14 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-7 h-7 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-foreground mb-3'>
                  Analytics & Insights
                </h3>
                <p className='text-foreground/70 leading-relaxed'>
                  Track DJ performance, event metrics, and booking trends. Make
                  data-driven decisions for your venues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Who We Serve */}
        <section className='flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 py-24 md:px-12'>
          <div className='max-w-5xl mx-auto w-full'>
            <div className='mb-16 text-center'>
              <h2 className='text-4xl md:text-5xl font-light text-foreground mb-4'>
                Built for Everyone in the Event Industry
              </h2>
              <p className='text-foreground/70 text-lg max-w-2xl mx-auto'>
                Whether you&apos;re a DJ, venue owner, or event organizer, Deckly has
                you covered
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {/* DJs & Artists */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-10 transition-all duration-300'>
                <div className='w-16 h-16 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-8 h-8 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-semibold text-foreground mb-4'>
                  DJs & Artists
                </h3>
                <p className='text-foreground/70 leading-relaxed mb-6'>
                  Manage your gigs, track bookings, and stay organized with a
                  centralized schedule view.
                </p>
                <ul className='space-y-3 text-foreground/70'>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>View all upcoming bookings</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Receive instant booking notifications</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Track performance history</span>
                  </li>
                </ul>
              </div>

              {/* Venue Owners */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-10 transition-all duration-300'>
                <div className='w-16 h-16 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-8 h-8 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-semibold text-foreground mb-4'>
                  Venue Owners
                </h3>
                <p className='text-foreground/70 leading-relaxed mb-6'>
                  Streamline operations, manage multiple venues, and automate DJ
                  scheduling for all your events.
                </p>
                <ul className='space-y-3 text-foreground/70'>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Auto-assign DJs by genre</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Create detailed run of shows</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Import events automatically</span>
                  </li>
                </ul>
              </div>

              {/* Event Organizers */}
              <div className='group bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20 rounded-3xl p-10 transition-all duration-300'>
                <div className='w-16 h-16 rounded-2xl bg-foreground/10 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-8 h-8 text-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-semibold text-foreground mb-4'>
                  Event Organizers
                </h3>
                <p className='text-foreground/70 leading-relaxed mb-6'>
                  Coordinate large-scale events with multiple performers and
                  complex schedules with ease.
                </p>
                <ul className='space-y-3 text-foreground/70'>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Manage complex timelines</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Coordinate multiple artists</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <svg
                      className='w-5 h-5 text-foreground mt-0.5 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Real-time schedule updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Get Started */}
        <section className='flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 py-24 md:px-12'>
          <div className='max-w-3xl mx-auto text-center'>
            <h2 className='text-4xl md:text-5xl font-light text-foreground mb-6'>
              Ready to Get Started?
            </h2>
            <p className='text-foreground/70 text-lg mb-12 leading-relaxed'>
              Join hundreds of venues, DJs, and event organizers who trust
              Deckly to power their events. Start your free trial today.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
              <MagneticButton size='lg' variant='primary' href='/login'>
                Start Free Trial
              </MagneticButton>
              <MagneticButton
                size='lg'
                variant='secondary'
                onClick={() => scrollToSection(1)}
              >
                View Solutions
              </MagneticButton>
            </div>
            <div className='border-t border-foreground/10 pt-12'>
              <p className='text-foreground/50 text-sm font-mono mb-4'>
                Have questions? We&apos;re here to help
              </p>
              <a
                href='mailto:hello@deckly.app'
                className='text-foreground hover:text-foreground/70 transition-colors font-medium'
              >
                hello@deckly.app
              </a>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
