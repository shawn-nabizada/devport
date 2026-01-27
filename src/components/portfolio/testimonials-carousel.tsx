'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface Testimonial {
    _id: string;
    authorName: string;
    authorTitle?: string;
    authorCompany?: string;
    content: string;
}

interface TestimonialsCarouselProps {
    testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, [testimonials.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }, [testimonials.length]);

    useEffect(() => {
        if (isPaused) return;

        timeoutRef.current = setTimeout(() => {
            nextSlide();
        }, 5000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentIndex, isPaused, testimonials.length, nextSlide]);

    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
                    <Quote className="h-8 w-8 text-primary" />
                    {t('nav.testimonials')}
                </h2>

                <div
                    className="relative max-w-4xl mx-auto"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {testimonials.map((testimonial) => (
                                <div key={testimonial._id} className="w-full flex-shrink-0 px-4">
                                    <Card className="h-full bg-card/50 backdrop-blur border-primary/10 shadow-lg">
                                        <CardContent className="flex flex-col items-center text-center p-8 md:p-12">
                                            <Quote className="h-10 w-10 text-primary/20 mb-6" />
                                            <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 italic">
                                                &ldquo;{testimonial.content}&rdquo;
                                            </blockquote>
                                            <div className="mt-auto">
                                                <div className="font-bold text-lg">{testimonial.authorName}</div>
                                                {(testimonial.authorTitle || testimonial.authorCompany) && (
                                                    <div className="text-muted-foreground">
                                                        {testimonial.authorTitle}
                                                        {testimonial.authorTitle && testimonial.authorCompany ? ' at ' : ''}
                                                        <span className="font-medium text-primary">{testimonial.authorCompany}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center mt-8 gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevSlide}
                            className="rounded-full hover:border-primary hover:text-primary transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                        </Button>
                        <div className="flex items-center gap-2">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                        idx === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-primary/50"
                                    )}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextSlide}
                            className="rounded-full hover:border-primary hover:text-primary transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next</span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
