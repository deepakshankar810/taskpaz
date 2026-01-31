'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateProjectInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProjectFormProps {
    onSubmit: (data: CreateProjectInput) => void;
    isLoading?: boolean;
}

const COLORS = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Gray', value: '#64748b' },
];

export function ProjectForm({ onSubmit, isLoading }: ProjectFormProps) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateProjectInput>({
        defaultValues: {
            color: COLORS[0].value
        }
    });
    const selectedColor = watch('color');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" {...register('name', { required: true })} placeholder="e.g. Website Redesign" />
                {errors.name && <span className="text-xs text-red-500">Required</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="What is this project about?" />
            </div>

            <div className="space-y-2">
                <Label>Color Code</Label>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => setValue('color', c.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.value ? 'border-slate-900 scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                        />
                    ))}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
        </form>
    );
}
