"use server";

import { getAuthHeaders } from "../session";

type ActionResult<T> = {
	ok: boolean;
	error: boolean;
	status: number;
	message?: string;
	data?: T;
};

export type MoodboardImage = {
	id: string;
	moodboardId: string;
	url: string;
	caption?: string | null;
	position?: number;
	createdAt?: string;
	updatedAt?: string;
};

type MoodboardAppointment = {
	id: string;
	title?: string;
	start?: string;
	status?: string;
};

export type Moodboard = {
	id: string;
	clientProfileId: string;
	name: string;
	description?: string | null;
	createdAt?: string;
	updatedAt?: string;
	images: MoodboardImage[];
	appointments?: MoodboardAppointment[];
};

type CreateMoodboardPayload = {
	name: string;
	description?: string;
};

type UpdateMoodboardPayload = {
	name?: string;
	description?: string;
};

type AddMoodboardImagePayload = {
	url: string;
	caption?: string;
	position?: number;
};

const parseResponseBody = async (response: Response) => {
	const raw = await response.text();
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		return { message: raw };
	}
};

const moodboardRequest = async <T>(
	endpoint: string,
	init?: RequestInit,
): Promise<ActionResult<T>> => {
	try {
		const headers = await getAuthHeaders();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACK_URL}/moodboard${endpoint}`,
			{
				...init,
				headers: {
					...headers,
					...(init?.headers || {}),
				},
				cache: "no-store",
			},
		);

		const data = await parseResponseBody(response);

		if (!response.ok || (data && data.error)) {
			const message =
				data?.message ||
				`Erreur lors de l'opération moodboard (${response.status})`;

			return {
				ok: false,
				error: true,
				status: response.status,
				message,
				data,
			};
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			data: data as T,
		};
	} catch (error) {
		console.error("Erreur moodboard action:", error);
		throw error;
	}
};

//! ----------------------------------------------------------------------------
//!  MOODBOARD CRUD
//! ----------------------------------------------------------------------------
export const getMyMoodboardsAction = async () => {
	return moodboardRequest<Moodboard[]>("/my", {
		method: "GET",
	});
};

export const getMoodboardByIdAction = async (moodboardId: string) => {
	return moodboardRequest<Moodboard>(`/${moodboardId}`, {
		method: "GET",
	});
};

export const createMoodboardAction = async (payload: CreateMoodboardPayload) => {
	return moodboardRequest<Moodboard>("", {
		method: "POST",
		body: JSON.stringify(payload),
	});
};

export const updateMoodboardAction = async (
	moodboardId: string,
	payload: UpdateMoodboardPayload,
) => {
	return moodboardRequest<Moodboard>(`/${moodboardId}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
};

export const deleteMoodboardAction = async (moodboardId: string) => {
	return moodboardRequest<{ message: string }>(`/${moodboardId}`, {
		method: "DELETE",
	});
};

//! ----------------------------------------------------------------------------
//!  IMAGES
//! ----------------------------------------------------------------------------
export const addMoodboardImageAction = async (
	moodboardId: string,
	payload: AddMoodboardImagePayload,
) => {
	return moodboardRequest<MoodboardImage>(`/${moodboardId}/images`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
};

export const removeMoodboardImageAction = async (
	moodboardId: string,
	imageId: string,
) => {
	return moodboardRequest<{ message: string }>(
		`/${moodboardId}/images/${imageId}`,
		{
			method: "DELETE",
		},
	);
};
