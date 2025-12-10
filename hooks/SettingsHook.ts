import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserSchema } from "@/lib/schemas/AuthSchema";
import { userHookKey } from "./UserHook";

export const settingsHookKey = ['settingsHook'];

interface UserSettings {
    _id?: string;
    userId: string;
    selectedModel?: string;
    customPersonality?: string;
    createdAt?: number;
    updatedAt?: number;
}

export function useSettingsHook(userId: string | undefined) {
    const convex = useConvex();
    const queryClient = useQueryClient();

    // Fetch user settings from Convex
    const settings = useQuery({
        queryKey: [...settingsHookKey, userId],
        queryFn: async () => {
            if (!userId) return null;
            return await convex.query(api.userSettings.getUserSettings, { userId });
        },
        enabled: !!userId,
    });

    // Mutation to update settings
    const updateSettingsMutation = useMutation({
        mutationFn: async (newSettings: { selectedModel?: string; customPersonality?: string }) => {
            if (!userId) throw new Error('User not authenticated');
            await convex.mutation(api.userSettings.upsertUserSettings, {
                userId,
                selectedModel: newSettings.selectedModel,
                customPersonality: newSettings.customPersonality,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...settingsHookKey, userId] });
        },
    });

    // Mutation to update profile (name)
    const updateProfileMutation = useMutation({
        mutationFn: async ({ firstName, lastName }: { firstName?: string; lastName?: string }) => {
            const response = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Update user data in cache
            queryClient.setQueryData<UserSchema>(userHookKey, (prev) =>
                prev ? { ...prev, firstName: data.firstName, lastName: data.lastName } : prev
            );
        },
    });

    // Mutation to send password reset email
    const sendPasswordResetMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/user/reset-password', {
                method: 'POST',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send password reset email');
            }

            return response.json();
        },
    });

    // Mutation to delete account
    const deleteAccountMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/user/delete-account', {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete account');
            }

            return response.json();
        },
        onSuccess: () => {
            // Clear all caches and redirect to login
            queryClient.clear();
            window.location.href = '/auth/login';
        },
    });

    // Mutation to upload profile image
    const uploadProfileImageMutation = useMutation({
        mutationFn: async (file: File) => {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
            }

            // Validate file size (5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error('File size exceeds 5MB limit.');
            }

            // Step 1: Get upload URL from Convex
            const uploadUrl = await convex.action(api.profileImage.generateProfileImageUploadUrl);

            // Step 2: Upload file to Convex storage
            const uploadResult = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!uploadResult.ok) {
                throw new Error('Failed to upload image to storage');
            }

            const { storageId } = await uploadResult.json();

            // Step 3: Get the storage URL
            const imageUrl = await convex.query(api.profileImage.getProfileImageUrl, { storageId });

            // Step 4: Update user profile with image URL
            const response = await fetch('/api/user/upload-profile-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile picture');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Update user data in cache
            queryClient.setQueryData<UserSchema>(userHookKey, (prev) =>
                prev ? { ...prev, profilePicture: data.profilePicture } : prev
            );
        },
    });

    return {
        settings,
        updateSettings: updateSettingsMutation.mutateAsync,
        isUpdatingSettings: updateSettingsMutation.isPending,
        updateProfile: updateProfileMutation.mutateAsync,
        isUpdatingProfile: updateProfileMutation.isPending,
        uploadProfileImage: uploadProfileImageMutation.mutateAsync,
        isUploadingProfileImage: uploadProfileImageMutation.isPending,
        sendPasswordReset: sendPasswordResetMutation.mutateAsync,
        isSendingPasswordReset: sendPasswordResetMutation.isPending,
        deleteAccount: deleteAccountMutation.mutateAsync,
        isDeletingAccount: deleteAccountMutation.isPending,
    };
}
