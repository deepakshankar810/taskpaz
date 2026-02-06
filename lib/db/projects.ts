import { supabase } from '@/lib/supabase';
import { Project, CreateProjectInput } from '@/lib/types';

export const createProject = async (userId: string, input: CreateProjectInput) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .insert([{
                user_id: userId,
                name: input.name,
                description: input.description || '',
                content: input.content || '',
                color: input.color || '#3b82f6',
            }])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

export const updateProject = async (projectId: string, data: Partial<CreateProjectInput>) => {
    try {
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.color) updateData.color = data.color;

        const { error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', projectId);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob failed'));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const uploadProjectImage = async (projectId: string, file: File) => {
    try {
        // Compress image before upload
        const compressedBlob = await compressImage(file);

        // Upload to Supabase Storage
        const fileName = `${Date.now()}_optimized.jpg`;
        const { data, error } = await supabase.storage
            .from('projects')
            .upload(`${projectId}/images/${fileName}`, compressedBlob, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('projects')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

export const getProjects = async (userId: string): Promise<Project[]> => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(project => ({
            id: project.id,
            userId: project.user_id,
            name: project.name,
            description: project.description,
            content: project.content,
            color: project.color,
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at),
        } as Project));
    } catch (error) {
        console.error('Error getting projects:', error);
        throw error;
    }
};
