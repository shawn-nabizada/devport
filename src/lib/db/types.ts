import { ObjectId } from 'mongodb';

// ================================
// User & Authentication
// ================================

export type UserRole = 'user' | 'admin';

export interface User {
    _id: ObjectId;
    email: string;
    password?: string; // Hashed password for credentials auth
    name?: string;
    username?: string; // For portfolio URL: devport.com/username
    image?: string;
    role: UserRole;
    emailVerified?: Date;
    verificationToken?: string; // For email verification
    verificationTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ================================
// Portfolio Content
// ================================

export interface Skill {
    _id: ObjectId;
    userId: ObjectId;
    name: {
        en: string;
        fr: string;
    };
    category?: string;
    proficiency: number; // 0-100
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Project {
    _id: ObjectId;
    userId: ObjectId;
    title: {
        en: string;
        fr: string;
    };
    description: {
        en: string;
        fr: string;
    };
    imageUrl?: string;
    projectUrl?: string;
    githubUrl?: string;
    technologies: string[];
    featured: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Experience {
    _id: ObjectId;
    userId: ObjectId;
    company: string;
    position: {
        en: string;
        fr: string;
    };
    description: {
        en: string;
        fr: string;
    };
    location?: string;
    startDate: Date;
    endDate?: Date; // null = current position
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Education {
    _id: ObjectId;
    userId: ObjectId;
    institution: string;
    degree: {
        en: string;
        fr: string;
    };
    field: {
        en: string;
        fr: string;
    };
    location?: string;
    startDate: Date;
    endDate?: Date;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// ================================
// Contact & Testimonials
// ================================

export interface ContactMessage {
    _id: ObjectId;
    userId: ObjectId; // Portfolio owner receiving the message
    senderName: string;
    senderEmail: string;
    subject?: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

export interface Testimonial {
    _id: ObjectId;
    userId: ObjectId; // Portfolio owner
    authorName: string;
    authorEmail: string;
    authorTitle?: string;
    authorCompany?: string;
    content: string;
    status: TestimonialStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ================================
// Resume / CV
// ================================

export interface Resume {
    _id: ObjectId;
    userId: ObjectId;
    language: 'en' | 'fr';
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
}

// ================================
// User Profile / Settings
// ================================

export interface UserProfile {
    _id: ObjectId;
    userId: ObjectId;
    bio: {
        en: string;
        fr: string;
    };
    headline: {
        en: string;
        fr: string;
    };
    location?: string;
    avatarUrl?: string;
    socialLinks: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        website?: string;
    };
    hobbies: Array<{
        en: string;
        fr: string;
    }>;
    updatedAt: Date;
}
